import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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

}
