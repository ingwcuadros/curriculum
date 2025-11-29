import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Article } from "../../articles/entities/article.entity";
import { Language } from '../../languages/entities/language.entity';
import { Experience } from "./experience.entity";

@Entity('experience_translations')
export class ExperienceTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'title' })
    title: string;

    @Column({ name: 'content', type: 'text' })
    content: string;


    @ManyToOne(() => Experience, e => e.translations, { onDelete: 'CASCADE' })
    experience: Experience;

    @ManyToOne(() => Language, { eager: true })
    language: Language;

}