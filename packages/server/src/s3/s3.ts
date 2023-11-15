import { fromEnv } from '@aws-sdk/credential-providers'; // ES6 import
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { logError } from '../util/logger';
import { cleanFileName } from '../util/string';

const s3Bucket = process.env.AWS_S3_BUCKET_NAME || '';

interface IUploadToS3 {
  image: Buffer | ReadableStream<Uint8Array>;
  filename: string;
  fileExtension?: string;
  path?: string;
}

const BASE_URL = 'https://www.justreadcomics.com/';

const generateS3BucketUrl = (filename: string) => {
  return `${BASE_URL}${filename}`;
};

export const uploadImageToS3 = async ({ image, filename, fileExtension, path }: IUploadToS3) => {
  const s3 = new S3Client({ region: 'us-east-1', credentials: fromEnv() });
  let cleanedFilename = cleanFileName(filename);
  if (fileExtension) {
    cleanedFilename = `${cleanedFilename}.${fileExtension}`;
  }
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
      const filename = cleanFileName(seriesName).split(' ').join('').toLowerCase();

      if (imageBlob) {
        return await uploadImageToS3({
          image: imageBlob,
          path: 'series/',
          filename,
          fileExtension: imageExtension || '.jpg'
        });
      }
    }
  }
  return '';
};
