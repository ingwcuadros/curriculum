import { Test, TestingModule } from '@nestjs/testing';
import { AcademicAchievementsService } from './academic_achievements.service';

describe('AcademicAchievementsService', () => {
  let service: AcademicAchievementsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AcademicAchievementsService],
    }).compile();

    service = module.get<AcademicAchievementsService>(AcademicAchievementsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
