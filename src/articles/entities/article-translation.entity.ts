
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Article } from './article.entity';
import { Language } from '../../languages/entities/language.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('article_translations')
export class ArticleTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'titulo' })
    titulo: string;

    @Column({ name: 'url', unique: true, nullable: true })
    url: string;

    @Column({ name: 'content', type: 'text', })
    content: string;

    @Column({ name: 'alt_image', nullable: true })
    altImage: string;

    @Column({ name: 'auxilary_content', type: 'text', nullable: true })
    auxiliaryContent: string;

    @Column({ name: 'fecha', type: 'date', nullable: true })
    fecha: Date;

    @Column({ name: 'fecha_end', type: 'date', nullable: true })
    fechaEnd: Date;

    @Column({ name: 'promo', nullable: true })
    promo: string;

    @ManyToOne(() => Article, a => a.translations, { onDelete: 'CASCADE' })
    article: Article;

    @ManyToOne(() => Language, { eager: true })
    language: Language;

    @ManyToMany(() => Tag, { eager: true })
    @JoinTable({
        name: 'article_translation_tags',
        joinColumn: { name: 'article_translation_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    })
    tags: Tag[];
}
