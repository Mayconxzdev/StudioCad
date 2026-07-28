'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs/promises');
const os = require('node:os');
const path = require('node:path');
const test = require('node:test');
const { inspectPackage } = require('../src/safe-package-inspector.cjs');

function u16(value) { const buffer = Buffer.alloc(2); buffer.writeUInt16LE(value); return buffer; }
function u32(value) { const buffer = Buffer.alloc(4); buffer.writeUInt32LE(value); return buffer; }
function storedZip(entries) {
  let offset = 0; const local = []; const central = [];
  for (const entry of entries) {
    const name = Buffer.from(entry.name); const data = Buffer.from(entry.data || ''); const compressed = entry.compressed ?? data.length; const uncompressed = entry.uncompressed ?? data.length;
    local.push(Buffer.concat([u32(0x04034b50),u16(20),u16(0),u16(0),u16(0),u16(0),u32(0),u32(compressed),u32(uncompressed),u16(name.length),u16(0),name,data]));
    central.push(Buffer.concat([u32(0x02014b50),u16(0x0314),u16(20),u16(0),u16(0),u16(0),u16(0),u32(0),u32(compressed),u32(uncompressed),u16(name.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(offset),name])); offset += 30 + name.length + data.length;
  }
  const directory = Buffer.concat(central); return Buffer.concat([...local,directory,u32(0x06054b50),u16(0),u16(0),u16(entries.length),u16(entries.length),u32(directory.length),u32(offset),u16(0)]);
}
async function fixture(name, content) { const root = await fs.mkdtemp(path.join(os.tmpdir(), 'portfolio-package-')); const file = path.join(root, name); await fs.writeFile(file, content); return { root, file }; }

test('inventories PDF and CAD without extracting content', async () => {
  const item = await fixture('reference.zip', storedZip([{ name: 'drawing/assembly.pdf', data: '%PDF' }, { name: 'cad/fan.step', data: 'ISO-10303-21;' }]));
  try { const result = await inspectPackage({ filePath: item.file, originalName: 'reference.zip' }); assert.equal(result.state, 'inspected'); assert.equal(result.totals.pdf, 1); assert.equal(result.totals.cad, 1); } finally { await fs.rm(item.root, { recursive: true, force: true }); }
});

test('rejects path traversal and compression bombs', async () => {
  const traversal = await fixture('unsafe.zip', storedZip([{ name: '../outside.txt', data: 'never write' }])); const bomb = await fixture('bomb.zip', storedZip([{ name: 'large.txt', data: 'x', compressed: 1, uncompressed: 100000 }]));
  try { assert.equal((await inspectPackage({ filePath: traversal.file, originalName: 'unsafe.zip' })).error.code, 'ARCHIVE_UNSAFE_PATH'); assert.equal((await inspectPackage({ filePath: bomb.file, originalName: 'bomb.zip' })).error.code, 'ARCHIVE_SIZE_LIMIT'); } finally { await fs.rm(traversal.root, { recursive: true, force: true }); await fs.rm(bomb.root, { recursive: true, force: true }); }
});

test('parses JSON as data and never as code', async () => {
  const item = await fixture('project.json', JSON.stringify({ name: 'Synthetic reference', action: 'never execute' }));
  try { const result = await inspectPackage({ filePath: item.file, originalName: 'project.json' }); assert.equal(result.state, 'inspected'); assert.deepEqual(result.json.rootKeys, ['name', 'action']); } finally { await fs.rm(item.root, { recursive: true, force: true }); }
});
