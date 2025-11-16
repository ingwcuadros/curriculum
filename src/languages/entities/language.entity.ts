import { TagTranslation } from "../../tags/entities/tag-translation.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Language {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', {
        unique: true,
    })
    name: string;

    @Column('text', {
        unique: true,
    })
    code: string;

    @OneToMany(() => TagTranslation, (translation) => translation.language)
    translations: TagTranslation[];


}
