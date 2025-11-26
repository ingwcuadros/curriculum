
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { BannerTranslation } from './banner-translation.entity';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('banners')
export class Banner {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    image: string; // Guardamos solo el path relativo o key


    @ManyToMany(() => Tag, { eager: true })
    @JoinTable({
        name: 'banner_tags',
        joinColumn: { name: 'banner_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'tag_id', referencedColumnName: 'id' },
    })
    tags: Tag[];


    @OneToMany(() => BannerTranslation, t => t.banner, { cascade: true })
    translations: BannerTranslation[];
}



