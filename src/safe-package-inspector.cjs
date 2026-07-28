'use strict';

/**
 * Public reference implementation used by the portfolio case study.
 * It inventories archives; it never extracts, executes or trusts their files.
 */
const fs = require('node:fs/promises');
const path = require('node:path');

const LIMITS = Object.freeze({ entries: 5000, expandedBytes: 512 * 1024 * 1024, jsonBytes: 8 * 1024 * 1024, compressionRatio: 120 });
const inspectable = new Set(['.zip', '.tar', '.json']);

function extension(name) { return path.extname(String(name || '')).toLowerCase(); }
function safePath(value) {
  const normalized = String(value || '').replace(/\\/g, '/').replace(/^\.\//, '');
  const comparable = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  if (!comparable || normalized.length > 1000 || normalized.startsWith('/') || /^[a-z]:\//i.test(normalized) || comparable.split('/').some((part) => !part || part === '.' || part === '..')) return null;
  return normalized;
}
function kind(name) {
  const ext = extension(name);
  if (ext === '.pdf') return 'pdf';
  if (['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'].includes(ext)) return 'image';
  if (['.step', '.stp', '.iges', '.igs', '.stl', '.obj', '.glb', '.gltf', '.dwg', '.dxf'].includes(ext)) return 'cad';
  if (ext === '.json') return 'json';
  if (['.js', '.cjs', '.mjs', '.py', '.ps1', '.cmd', '.bat', '.exe', '.dll', '.vbs', '.msi', '.scr'].includes(ext)) return 'script_or_executable';
  if (['.txt', '.md', '.csv', '.docx', '.xlsx'].includes(ext)) return 'document';
  return 'other';
}
function totals(entries) {
  const result = { files: 0, directories: 0, bytes: 0, pdf: 0, image: 0, cad: 0, json: 0, document: 0, scriptOrExecutable: 0, other: 0 };
  for (const entry of entries) {
    if (entry.directory) { result.directories += 1; continue; }
    result.files += 1; result.bytes += entry.bytes;
    const key = ({ script_or_executable: 'scriptOrExecutable' })[entry.kind] || entry.kind;
    result[key] = (result[key] || 0) + 1;
  }
  return result;
}
function parseZip(buffer) {
  const start = Math.max(0, buffer.length - 0x10000 - 22); let end = -1;
  for (let at = buffer.length - 22; at >= start; at -= 1) if (buffer.readUInt32LE(at) === 0x06054b50) { end = at; break; }
  if (end < 0) throw Object.assign(new Error('ZIP end-of-directory not found'), { code: 'ZIP_INVALID' });
  const count = buffer.readUInt16LE(end + 10); const offset = buffer.readUInt32LE(end + 16); const size = buffer.readUInt32LE(end + 12);
  if (count > LIMITS.entries || offset + size > buffer.length) throw Object.assign(new Error('ZIP directory exceeds safe limits'), { code: 'ZIP_LIMIT' });
  const entries = []; let at = offset; let expanded = 0;
  for (let index = 0; index < count; index += 1) {
    if (at + 46 > buffer.length || buffer.readUInt32LE(at) !== 0x02014b50) throw Object.assign(new Error('ZIP central directory is invalid'), { code: 'ZIP_INVALID' });
    const flags = buffer.readUInt16LE(at + 8); const compressed = buffer.readUInt32LE(at + 20); const uncompressed = buffer.readUInt32LE(at + 24); const nameLength = buffer.readUInt16LE(at + 28); const extraLength = buffer.readUInt16LE(at + 30); const commentLength = buffer.readUInt16LE(at + 32); const attrs = buffer.readUInt32LE(at + 38);
    const name = buffer.subarray(at + 46, at + 46 + nameLength).toString(flags & 0x800 ? 'utf8' : 'latin1'); const safe = safePath(name);
    if (!safe) throw Object.assign(new Error('Archive path is unsafe'), { code: 'ARCHIVE_UNSAFE_PATH' });
    if (flags & 0x1) throw Object.assign(new Error('Encrypted ZIP entries are not inspected'), { code: 'ARCHIVE_ENCRYPTED_ENTRY' });
    const unixType = (attrs >>> 16) & 0o170000;
    if (unixType && unixType !== 0o100000 && unixType !== 0o040000) throw Object.assign(new Error('Special ZIP entries are not inspected'), { code: 'ARCHIVE_SPECIAL_ENTRY' });
    if (uncompressed > LIMITS.expandedBytes || compressed && uncompressed / compressed > LIMITS.compressionRatio) throw Object.assign(new Error('Archive compression or entry size exceeds safe limits'), { code: 'ARCHIVE_SIZE_LIMIT' });
    expanded += uncompressed; if (expanded > LIMITS.expandedBytes) throw Object.assign(new Error('Archive expanded size exceeds safe limits'), { code: 'ARCHIVE_SIZE_LIMIT' });
    const directory = safe.endsWith('/'); entries.push({ path: safe, directory, bytes: uncompressed, kind: directory ? 'other' : kind(safe) });
    at += 46 + nameLength + extraLength + commentLength;
  }
  return entries;
}
function octal(buffer) { const text = buffer.toString('ascii').replace(/\0.*$/, '').trim(); return text ? parseInt(text, 8) : 0; }
function parseTar(buffer) {
  const entries = []; let at = 0; let expanded = 0;
  while (at + 512 <= buffer.length) {
    const header = buffer.subarray(at, at + 512); if (header.every((byte) => byte === 0)) break;
    const name = header.subarray(0, 100).toString('utf8').replace(/\0.*$/, ''); const prefix = header.subarray(345, 500).toString('utf8').replace(/\0.*$/, ''); const safe = safePath(prefix ? `${prefix}/${name}` : name);
    if (!safe) throw Object.assign(new Error('Archive path is unsafe'), { code: 'ARCHIVE_UNSAFE_PATH' });
    const type = String.fromCharCode(header[156] || 0); const bytes = octal(header.subarray(124, 136)); const directory = type === '5' || safe.endsWith('/');
    if (!directory && type && type !== '\0' && type !== '0') throw Object.assign(new Error('Special TAR entries are not inspected'), { code: 'ARCHIVE_SPECIAL_ENTRY' });
    expanded += bytes; if (expanded > LIMITS.expandedBytes) throw Object.assign(new Error('Archive expanded size exceeds safe limits'), { code: 'ARCHIVE_SIZE_LIMIT' });
    entries.push({ path: safe, directory, bytes, kind: directory ? 'other' : kind(safe) }); at += 512 + Math.ceil(bytes / 512) * 512;
  }
  return entries;
}
async function inspectPackage({ filePath, originalName }) {
  const ext = extension(originalName); const inspectedAt = new Date().toISOString();
  if (!inspectable.has(ext)) return { state: 'not_applicable', inspectedAt, limitations: ['This format has no automatic internal inventory.'] };
  try {
    if (ext === '.json') {
      const stat = await fs.stat(filePath); if (stat.size > LIMITS.jsonBytes) throw Object.assign(new Error('JSON exceeds safe inspection limit'), { code: 'JSON_LIMIT' });
      const data = JSON.parse(await fs.readFile(filePath, 'utf8')); const keys = data && typeof data === 'object' && !Array.isArray(data) ? Object.keys(data).slice(0, 40) : [];
      return { state: 'inspected', format: 'json', inspectedAt, totals: totals([{ path: path.basename(filePath), bytes: stat.size, kind: 'json' }]), json: { rootType: Array.isArray(data) ? 'array' : typeof data, rootKeys: keys }, limitations: ['JSON was parsed as data only; nothing was executed.'] };
    }
    const body = await fs.readFile(filePath); const entries = ext === '.zip' ? parseZip(body) : parseTar(body);
    const summary = totals(entries);
    return { state: 'inspected', format: ext.slice(1), inspectedAt, totals: summary, entries, warnings: summary.scriptOrExecutable ? [`${summary.scriptOrExecutable} script/executable entry listed; none was executed.`] : [], limitations: ['The archive was inventoried only. No file was extracted or executed.', 'Human review is required before treating any content as a trusted technical reference.'] };
  } catch (error) {
    return { state: 'rejected', inspectedAt, error: { code: error.code || 'PACKAGE_INSPECTION_FAILED', message: error.message }, limitations: ['The received file is preserved but its contents are not used automatically.'] };
  }
}

module.exports = { inspectPackage, safePath, parseZip, parseTar, LIMITS };
