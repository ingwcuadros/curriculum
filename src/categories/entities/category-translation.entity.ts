import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from './category.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('category_translations')
export class CategoryTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ nullable: true })
    description: string;

    /* istanbul ignore file */
    @ManyToOne(() => Category, (category) => category.translations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'category_id' })
    category: Category;

    /* istanbul ignore file */
    @ManyToOne(() => Language, (language) => language.translations, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'language_id' })
    language: Language;
}
