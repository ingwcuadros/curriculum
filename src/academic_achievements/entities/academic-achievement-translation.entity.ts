import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { AcademicAchievement } from './academic_achievement.entity';
import { Language } from '../../languages/entities/language.entity';

@Entity('academic_achievement_translations')
export class AcademicAchievementTranslation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @Column({ name: 'alt_image', nullable: true })
    altImage: string;

    @ManyToOne(() => AcademicAchievement, a => a.translations, { onDelete: 'CASCADE' })
    academicAchievement: AcademicAchievement;

    @ManyToOne(() => Language, { eager: true })
    language: Language;
}