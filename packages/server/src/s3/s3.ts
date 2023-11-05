import { fromEnv } from '@aws-sdk/credential-providers'; // ES6 import
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sanitize from 'sanitize-filename';
import { logError } from '../util/logger';

const s3Bucket = process.env.AWS_S3_BUCKET_NAME || '';

interface IUploadToS3 {
  image: Buffer | ReadableStream<Uint8Array>;
  filename: string;
  path?: string;
}

const BUCKET_URL = 'https://justreadcomics.s3.amazonaws.com/';

const generateS3BucketUrl = (filename: string) => {
  return `${BUCKET_URL}${filename}`;
};

export const uploadImageToS3 = async ({ image, filename, path }: IUploadToS3) => {
  const s3 = new S3Client({ region: 'us-east-1', credentials: fromEnv() });
  let cleanedFilename = sanitize(filename);
  if (path) {
    cleanedFilename = `${path}${cleanedFilename}`;
  }

  const command = new PutObjectCommand({
    Bucket: s3Bucket,
    Key: cleanedFilename,
    Body: image
  });

  try {
    await s3.send(command);
    return generateS3BucketUrl(cleanedFilename);
  } catch (e: any) {
    logError(e);
    throw new Error(e);
  }
};

export const uploadSeriesImageFromUrlToS3 = async (seriesName: string, seriesImage: string) => {
  if (seriesImage.length) {
    const imageFetch = await fetch(seriesImage)
      .then((res) => res.arrayBuffer())
      .catch((err) => {
        logError(err);
        return null;
      });
    if (imageFetch) {
      const imageBlob = Buffer.from(imageFetch);
      const imageExtension = seriesImage.split('.').pop();
      const filename = sanitize(seriesName).split(' ').join('').toLowerCase();

      if (imageBlob) {
        return await uploadImageToS3({
          image: imageBlob,
          path: 'series/',
          filename: `${filename}.${imageExtension}`
        });
      }
    }
  }
  return '';
};
