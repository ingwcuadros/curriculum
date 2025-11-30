
import { StorageDriver } from './storage.interface';
import { join } from 'path';
import { promises as fs } from 'fs';

export class LocalStorage implements StorageDriver {
    private uploadPath = join(process.cwd(), 'uploads');

    async upload(file: Express.Multer.File): Promise<string> {
        const filePath = join(this.uploadPath, file.originalname);
        await fs.writeFile(filePath, file.buffer);
        return `/uploads/${file.originalname}`;
    }

    async delete(filePath: string): Promise<void> {
        const fullPath = join(this.uploadPath, filePath);
        await fs.unlink(fullPath);
    }
}
