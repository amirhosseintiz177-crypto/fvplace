const fs = require('fs');
const path = require('path');

const localRoot = path.resolve(process.env.LOCAL_STORAGE_DIR || 'uploads');

function safeLocalPath(key) {
  const resolved = path.resolve(localRoot, key);
  if (!resolved.startsWith(localRoot)) throw new Error('Invalid storage key.');
  return resolved;
}

function encodeStorageKey(key) {
  return Buffer.from(key).toString('base64url');
}

function decodeStorageKey(encodedKey) {
  return Buffer.from(encodedKey, 'base64url').toString('utf8');
}

async function putObject({ key, body }) {
  const target = safeLocalPath(key);
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, body);
  return key;
}

async function deleteObject(key) {
  await fs.promises.unlink(safeLocalPath(key)).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

async function createPreviewUrl(key, expiresIn = 300) {
  return `/api/storage/${encodeStorageKey(key)}?ttl=${expiresIn}`;
}

function getLocalObjectPath(encodedKey) {
  return safeLocalPath(decodeStorageKey(encodedKey));
}

module.exports = { putObject, deleteObject, createPreviewUrl, getLocalObjectPath };
