const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const env = require('../config/env');

const localRoot = path.resolve(process.env.LOCAL_STORAGE_DIR || 'uploads');
const hasS3Config = Boolean(env.s3.endpoint && env.s3.bucket && env.s3.accessKeyId && env.s3.secretAccessKey);
const s3 = hasS3Config
  ? new S3Client({
      endpoint: env.s3.endpoint,
      region: env.s3.region,
      forcePathStyle: env.s3.forcePathStyle,
      credentials: { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey },
    })
  : null;

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

async function putObject({ key, body, contentType }) {
  if (s3) {
    await s3.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: body, ContentType: contentType }));
    return key;
  }

  const target = safeLocalPath(key);
  await fs.promises.mkdir(path.dirname(target), { recursive: true });
  await fs.promises.writeFile(target, body);
  return key;
}

async function deleteObject(key) {
  if (s3) {
    await s3.send(new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: key }));
    return;
  }

  await fs.promises.unlink(safeLocalPath(key)).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
}

async function createPreviewUrl(key, expiresIn = 300) {
  if (s3) {
    return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }), { expiresIn });
  }

  return `/api/storage/${encodeStorageKey(key)}?ttl=${expiresIn}`;
}

function getLocalObjectPath(encodedKey) {
  if (s3) return null;
  return safeLocalPath(decodeStorageKey(encodedKey));
}

module.exports = { putObject, deleteObject, createPreviewUrl, getLocalObjectPath, hasS3Config };
