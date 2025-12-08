
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('pdf_resource')
export class PdfResource {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'file_name' })
    fileName: string;

    @Column({ name: 'meta_keywords', nullable: true })
    metaKeywords: string;

    @Column({ name: 'file_path' })
    filePath: string; // URL o ruta del PDF en el storage
}
