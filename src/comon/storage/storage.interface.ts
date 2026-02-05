
export interface StorageDriver {
    upload(file: Express.Multer.File, isPdf?: boolean): Promise<string>;
    delete(filePath: string, isPdf?: boolean): Promise<void>;
}
