
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Banner } from './banner.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('banner_translations')
export class BannerTranslation {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'text_banner' })
    textBanner: string;

    @Column({ name: 'alt_image', nullable: true })
    altImage: string;

    @Column({ name: 'role', nullable: true })
    role: string;

    @ManyToOne(() => Banner, b => b.translations, { onDelete: 'CASCADE' })
    banner: Banner;

    @ManyToOne(() => Language, { eager: true })
    language: Language;

}
