import { Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { TagTranslation } from "./tag-translation.entity";

@Entity('tags')
export class Tag {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    /* istanbul ignore file */
    @OneToMany(() => TagTranslation, (translation) => translation.tag, { cascade: true })
    translations: TagTranslation[];
}

