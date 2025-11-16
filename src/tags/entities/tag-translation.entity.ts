import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Tag } from "./tag.entity";
import { Language } from '../../languages/entities/language.entity';

@Entity('tag_translations')
export class TagTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description?: string;

    @ManyToOne(() => Tag, (tag) => tag.translations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'tag_id' })
    tag: Tag;

    @ManyToOne(() => Language, (language) => language.translations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'language_id' })
    language: Language;
}