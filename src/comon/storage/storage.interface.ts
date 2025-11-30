
export interface StorageDriver {
    upload(file: Express.Multer.File): Promise<string>;
    delete(filePath: string): Promise<void>;
}
