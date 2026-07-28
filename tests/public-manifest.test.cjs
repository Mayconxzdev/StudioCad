'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { publicManifest } = require('../src/public-manifest.cjs');

test('redacts paths, network addresses, people and credentials before public export', () => {
  const result = publicManifest({ absolutePath: 'C:\\Users\\person\\project', source: '\\\\10.0.0.15\\technical', username: 'private-user', token: 'never-publish', nested: { endpoint: 'http://192.168.0.15:8090', hash: 'safe-to-publish' } });
  const serialized = JSON.stringify(result);
  assert.match(serialized, /safe-to-publish/); assert.doesNotMatch(serialized, /10\.0\.0\.15|192\.168\.0\.15|private-user|never-publish|C:\\Users/);
});
