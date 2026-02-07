
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { StorageDriver } from './storage.interface';

export class S3Storage implements StorageDriver {
    private s3: S3Client;
    private bucket: string;

    constructor() {
        if (!process.env.AWS_BUCKET_NAME) {
            throw new Error('AWS_BUCKET_NAME no está definido');
        }
        this.bucket = process.env.AWS_BUCKET_NAME;

        this.s3 = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
            },
        });
    }

    async upload(file: Express.Multer.File, isPdf: boolean): Promise<string> {
        const key = isPdf ? `pdfs/${file.originalname}` : `imagenes/${file.originalname}`;
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            Body: file.buffer,
            ContentType: file.mimetype,
        });

        await this.s3.send(command);
        return `https://${this.bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    }

    async delete(filePath: string, isPdf: boolean): Promise<void> {
        const key = isPdf ? `pdfs/${filePath}` : `imagenes/${filePath}`;
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        await this.s3.send(command);
    }
}
