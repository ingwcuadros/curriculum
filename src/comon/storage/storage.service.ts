
import { Injectable } from '@nestjs/common';
import { StorageDriver } from './storage.interface';
import { LocalStorage } from './local.storage';
import { S3Storage } from './s3.storage';

@Injectable()
export class StorageService {
    private driver: StorageDriver;

    constructor() {
        this.driver = process.env.STORAGE_DRIVER === 's3'
            ? new S3Storage()
            : new LocalStorage();
    }

    upload(file: Express.Multer.File): Promise<string> {
        return this.driver.upload(file);
    }

    delete(filePath: string): Promise<void> {
        return this.driver.delete(filePath);
    }
}
