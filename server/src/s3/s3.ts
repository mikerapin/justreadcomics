import { fromEnv } from '@aws-sdk/credential-providers'; // ES6 import
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sanitize from 'sanitize-filename';

const s3Bucket = process.env.AWS_S3_BUCKET_NAME || '';

interface IUploadToS3 {
  image: any;
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
    console.log(e);
    throw new Error(e);
  }
};
