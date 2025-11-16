import { Test, TestingModule } from '@nestjs/testing';
import { TagsController } from './tags.controller';
import { TagsService } from './tags.service';

describe('TagsController', () => {
  let controller: TagsController;
  let service: TagsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TagsController],
      providers: [
        {
          provide: TagsService,
          useValue: {
            createTag: jest.fn(),
            deleteTag: jest.fn(),
            addTranslation: jest.fn(),
            getTagsByLanguage: jest.fn(),
            getTagWithTranslation: jest.fn(),
            updateTranslationByTagAndLang: jest.fn(),
            deleteTranslation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<TagsController>(TagsController);
    service = module.get<TagsService>(TagsService);
  });

  it('should call createTag', async () => {
    const dto = {};
    (service.createTag as jest.Mock).mockResolvedValue({ id: 'uuid' });
    const result = await controller.createTag(dto);
    expect(result).toEqual({ id: 'uuid' });
    expect(service.createTag).toHaveBeenCalledWith(dto);
  });

  it('should call deleteTag', async () => {
    (service.deleteTag as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.deleteTag('uuid');
    expect(result).toBeUndefined();
    expect(service.deleteTag).toHaveBeenCalledWith('uuid');
  });

  it('should call addTranslation', async () => {
    const dto = { name: 'Tech' };
    (service.addTranslation as jest.Mock).mockResolvedValue({ id: 'trans-uuid' });
    const result = await controller.addTranslation(dto as any);
    expect(result).toEqual({ id: 'trans-uuid' });
    expect(service.addTranslation).toHaveBeenCalledWith(dto);
  });

  it('should call getTagsByLanguage', async () => {
    (service.getTagsByLanguage as jest.Mock).mockResolvedValue([]);
    const result = await controller.getTagsByLanguage('es');
    expect(result).toEqual([]);
    expect(service.getTagsByLanguage).toHaveBeenCalledWith('es');
  });

  it('should call getTagWithTranslation', async () => {
    (service.getTagWithTranslation as jest.Mock).mockResolvedValue({ name: 'Tech' });
    const result = await controller.getTagWithTranslation('uuid', 'es');
    expect(result).toEqual({ name: 'Tech' });
    expect(service.getTagWithTranslation).toHaveBeenCalledWith('uuid', 'es');
  });

  it('should call updateTranslationByTagAndLang', async () => {
    const dto = { name: 'Tech' };
    (service.updateTranslationByTagAndLang as jest.Mock).mockResolvedValue({ name: 'Tech' });
    const result = await controller.updateTranslationByTagAndLang('uuid', 'es', dto);
    expect(result).toEqual({ name: 'Tech' });
    expect(service.updateTranslationByTagAndLang).toHaveBeenCalledWith('uuid', 'es', dto);
  });

  it('should call deleteTranslation', async () => {
    (service.deleteTranslation as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.deleteTranslation('trans-uuid');
    expect(result).toBeUndefined();
    expect(service.deleteTranslation).toHaveBeenCalledWith('trans-uuid');
  });
  it('should call updateTranslationByTagAndLang with empty dto', async () => {
    (service.updateTranslationByTagAndLang as jest.Mock).mockResolvedValue({ name: 'Old' });
    const result = await controller.updateTranslationByTagAndLang('uuid', 'es', {});
    expect(result).toEqual({ name: 'Old' });
  });
});
