import { Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ExperienceTranslation } from './experience-translation.entity';
import { Article } from 'src/articles/entities/article.entity';

@Entity('experiences')
export class Experience {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToMany(() => Article, { eager: true })
    @JoinTable({
        name: 'experience_articles',
        joinColumn: { name: 'experience_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'article_id', referencedColumnName: 'id' },
    })
    articles: Article[];

    @OneToMany(() => ExperienceTranslation, et => et.experience, { cascade: true })
    translations: ExperienceTranslation[];
}
