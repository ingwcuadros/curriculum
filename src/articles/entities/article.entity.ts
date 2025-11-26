
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { ArticleTranslation } from './article-translation.entity';

@Entity('articles')
export class Article {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'image', nullable: true })
    image: string;

    @ManyToOne(() => Category, { eager: true })
    category: Category;

    @OneToMany(() => ArticleTranslation, t => t.article, { cascade: true })
    translations: ArticleTranslation[];
}
