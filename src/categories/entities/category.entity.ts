
import { Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { CategoryTranslation } from './category-translation.entity';

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* istanbul ignore file */
    @OneToMany(() => CategoryTranslation, (translation) => translation.category, { cascade: true })
    translations: CategoryTranslation[];
}
