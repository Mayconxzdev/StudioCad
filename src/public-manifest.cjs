'use strict';

const PRIVATE_KEY = /^(absolutePath|localPath|nasPath|uncPath|username|token|password|secret|credential|logs?)$/i;
const PRIVATE_VALUE = /(?:\\\\|[A-Z]:\\Users\\|\b(?:10|127|172\.(?:1[6-9]|2\d|3[01])|192\.168)\.(?:\d{1,3}\.){1,2}\d{1,3}\b|@)/i;

function redact(value) {
  if (typeof value === 'string') return PRIVATE_VALUE.test(value) ? '[redacted]' : value;
  if (Array.isArray(value)) return value.map(redact);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value).map(([key, child]) => [key, PRIVATE_KEY.test(key) ? '[redacted]' : redact(child)]));
}

function publicManifest(internal) {
  const cleaned = redact(JSON.parse(JSON.stringify(internal || {})));
  return { schema: 'portfolio-public-manifest/v1', generatedAt: new Date().toISOString(), data: cleaned, limitation: 'Public export excludes network locations, local paths, identities, credentials and logs.' };
}

module.exports = { publicManifest, redact };
