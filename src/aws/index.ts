import AWS_S3, { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import AppError from "../error";

const s3Client = new S3({ region: process.env.AWS_REGION as string });
interface PutObjectCommandOutput extends AWS_S3.PutObjectCommandOutput {
   Location: string;
}

export class Storage {
   public async UploadFile(fileBuffer: Buffer, fileName: string): Promise<PutObjectCommandOutput | AppError> {
      try {
         const command = new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET as string,
            Key: fileName,
            Body: fileBuffer,
         });

         const response = await s3Client.send(command);
         const location = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
         return { ...response, Location: location };
      } catch (error: any) {
         return new AppError(500, "Error uploading file to S3", error);
      }
   }
   public async FindFile(fileName: string): Promise<AWS_S3.ListObjectsV2CommandOutput | AppError> {
      try {
         const command = new AWS_S3.ListObjectsV2Command({
            Bucket: process.env.AWS_BUCKET as string,
            Prefix: fileName,
         });
         return await s3Client.send(command);
      } catch (error: any) {
         return new AppError(500, "Error finding file in S3", error);
      }
   }
   public async DeleteFile(fileName: string): Promise<AWS_S3.DeleteObjectCommandOutput | AppError> {
      try {
         const command = new AWS_S3.DeleteObjectCommand({
            Bucket: process.env.AWS_BUCKET as string,
            Key: fileName,
         });
         return await s3Client.send(command);
      } catch (error: any) {
         return new AppError(500, "Error deleting file in S3", error);
      }
   }
}
