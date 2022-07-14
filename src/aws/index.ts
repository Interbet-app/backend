import AWS from "aws-sdk";
import AppError from "../error";

export class S3 {
   private bucket: AWS.S3;
   private readonly ACCESS_KEY_ID: string;
   private readonly SECRET_ACCESS_KEY: string;
   private readonly REGION: string;
   private readonly BUCKET_NAME: string;
   constructor() {
      this.ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID as string;
      this.SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY as string;
      this.REGION = process.env.AWS_REGION as string;
      this.BUCKET_NAME = process.env.AWS_BUCKET as string;
      this.bucket = new AWS.S3({
         accessKeyId: this.ACCESS_KEY_ID,
         secretAccessKey: this.SECRET_ACCESS_KEY,
         region: this.REGION,
      });
   }

   public async UploadFile(fileBuffer: Buffer, fileName: string): Promise<AWS.S3.ManagedUpload.SendData | AppError> {
      try {
         const params = {
            Bucket: this.BUCKET_NAME,
            Key: fileName,
            Body: fileBuffer,
         } as AWS.S3.PutObjectRequest;
         return await this.bucket.upload(params).promise();
      } catch (error: any) {
         return new AppError(500, "Error uploading file to S3", error);
      }
   }
   public async find(fileName: string): Promise<AWS.S3.ListObjectsV2Output | AppError> {
      try {
         const params = {
            Bucket: this.BUCKET_NAME,
            Prefix: fileName,
         } as AWS.S3.ListObjectsV2Request;
         return await this.bucket.listObjectsV2(params).promise();
      } catch (error: any) {
         return new AppError(500, "Error finding file in S3", error);
      }
   }
   public async delete(fileName: string): Promise<AWS.S3.DeleteObjectOutput | AppError> {
      try {
         const params = {
            Bucket: this.BUCKET_NAME,
            Key: fileName,
         } as AWS.S3.DeleteObjectRequest;
         return await this.bucket.deleteObject(params).promise();
      } catch (error: any) {
         return new AppError(500, "Error deleting file in S3", error);
      }
   }
}

