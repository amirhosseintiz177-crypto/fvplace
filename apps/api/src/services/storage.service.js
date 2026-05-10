const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const env = require('../config/env');

function createS3Client() {
  return new S3Client({
    endpoint: env.s3.endpoint,
    region: env.s3.region,
    forcePathStyle: env.s3.forcePathStyle,
    credentials: env.s3.accessKeyId
      ? { accessKeyId: env.s3.accessKeyId, secretAccessKey: env.s3.secretAccessKey }
      : undefined,
  });
}

const s3 = createS3Client();

async function putObject({ key, body, contentType }) {
  await s3.send(new PutObjectCommand({ Bucket: env.s3.bucket, Key: key, Body: body, ContentType: contentType }));
  return key;
}

async function deleteObject(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: env.s3.bucket, Key: key }));
}

async function createPreviewUrl(key, expiresIn = 300) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: env.s3.bucket, Key: key }), { expiresIn });
}

module.exports = { putObject, deleteObject, createPreviewUrl };
