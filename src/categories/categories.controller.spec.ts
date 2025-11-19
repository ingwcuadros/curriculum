import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  let service: CategoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            createCategory: jest.fn(),
            deleteCategory: jest.fn(),
            addTranslation: jest.fn(),
            getCategoriesByLanguage: jest.fn(),
            getCategoryWithTranslation: jest.fn(),
            updateTranslationByCategoryAndLang: jest.fn(),
            deleteTranslation: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
    service = module.get<CategoriesService>(CategoriesService);
  });

  it('should call createCategory', async () => {
    (service.createCategory as jest.Mock).mockResolvedValue({ id: 'uuid' });
    const result = await controller.createCategory({});
    expect(result).toEqual({ id: 'uuid' });
    expect(service.createCategory).toHaveBeenCalledWith({});
  });

  it('should call deleteCategory', async () => {
    (service.deleteCategory as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.deleteCategory('uuid');
    expect(result).toBeUndefined();
    expect(service.deleteCategory).toHaveBeenCalledWith('uuid');
  });

  it('should call addTranslation', async () => {
    const dto = { name: 'Tech' };
    (service.addTranslation as jest.Mock).mockResolvedValue({ id: 'trans-uuid' });
    const result = await controller.addTranslation(dto as any);
    expect(result).toEqual({ id: 'trans-uuid' });
    expect(service.addTranslation).toHaveBeenCalledWith(dto);
  });

  it('should call getCategoriesByLanguage', async () => {
    (service.getCategoriesByLanguage as jest.Mock).mockResolvedValue([]);
    const result = await controller.getCategoriesByLanguage('es');
    expect(result).toEqual([]);
    expect(service.getCategoriesByLanguage).toHaveBeenCalledWith('es');
  });

  it('should call getCategoryWithTranslation', async () => {
    (service.getCategoryWithTranslation as jest.Mock).mockResolvedValue({ name: 'Tech' });
    const result = await controller.getCategoryWithTranslation('uuid', 'es');
    expect(result).toEqual({ name: 'Tech' });
    expect(service.getCategoryWithTranslation).toHaveBeenCalledWith('uuid', 'es');
  });

  it('should call updateTranslationByCategoryAndLang', async () => {
    const dto = { name: 'Tech' };
    (service.updateTranslationByCategoryAndLang as jest.Mock).mockResolvedValue({ name: 'Tech' });
    const result = await controller.updateTranslationByCategoryAndLang('uuid', 'es', dto);
    expect(result).toEqual({ name: 'Tech' });
    expect(service.updateTranslationByCategoryAndLang).toHaveBeenCalledWith('uuid', 'es', dto);
  });

  it('should call deleteTranslation', async () => {
    (service.deleteTranslation as jest.Mock).mockResolvedValue(undefined);
    const result = await controller.deleteTranslation('trans-uuid');
    expect(result).toBeUndefined();
    expect(service.deleteTranslation).toHaveBeenCalledWith('trans-uuid');
  });
  it('should call updateTranslationByCategoryAndLang with empty dto', async () => {
    (service.updateTranslationByCategoryAndLang as jest.Mock).mockResolvedValue({ name: 'Old' });
    const result = await controller.updateTranslationByCategoryAndLang('uuid', 'es', {});
    expect(result).toEqual({ name: 'Old' });
  });

  it('should call getCategoriesByLanguage with empty lang', async () => {
    (service.getCategoriesByLanguage as jest.Mock).mockResolvedValue([]);
    const result = await controller.getCategoriesByLanguage('');
    expect(result).toEqual([]);
    expect(service.getCategoriesByLanguage).toHaveBeenCalledWith('');
  });

  it('should call getCategoryWithTranslation with empty lang', async () => {
    (service.getCategoryWithTranslation as jest.Mock).mockResolvedValue({ name: 'Tech' });
    const result = await controller.getCategoryWithTranslation('uuid', '');
    expect(result).toEqual({ name: 'Tech' });
    expect(service.getCategoryWithTranslation).toHaveBeenCalledWith('uuid', '');
  });
});