import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { AcademicAchievementTranslation } from './academic-achievement-translation.entity';

@Entity('academic_achievements')
export class AcademicAchievement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    image: string;

    @OneToMany(() => AcademicAchievementTranslation, t => t.academicAchievement, { cascade: true })
    translations: AcademicAchievementTranslation[];
}