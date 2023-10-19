import aws from 'aws-sdk';
import sanitize from 'sanitize-filename';

const config = {
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY
};

const s3Bucket = process.env.AWS_S3_BUCKET_NAME || '';

const s3 = new aws.S3(config);

interface IUploadToS3 {
  image: any;
  filename: string;
  path?: string;
}

export const uploadImageToS3 = async ({ image, filename, path }: IUploadToS3) => {
  let cleanedFilename = sanitize(filename);
  if (path) {
    cleanedFilename = `${path}${cleanedFilename}`;
  }

  try {
    const uploadedImage = await s3
      .upload({
        Bucket: s3Bucket,
        Key: cleanedFilename,
        Body: image
      })
      .promise();

    return uploadedImage;
  } catch (e: any) {
    console.log(e);
    throw new Error(e);
  }
};

export { s3 };
