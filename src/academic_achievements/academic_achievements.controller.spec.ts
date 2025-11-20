import { Test, TestingModule } from '@nestjs/testing';
import { AcademicAchievementsController } from './academic_achievements.controller';
import { AcademicAchievementsService } from './academic_achievements.service';

describe('AcademicAchievementsController', () => {
  let controller: AcademicAchievementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AcademicAchievementsController],
      providers: [AcademicAchievementsService],
    }).compile();

    controller = module.get<AcademicAchievementsController>(AcademicAchievementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
