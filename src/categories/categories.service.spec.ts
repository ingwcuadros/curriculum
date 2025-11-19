import { CategoriesService } from './categories.service';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CategoryTranslation } from './entities/category-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { BusinessLogicException } from '../shared/errors/business-errors';

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryRepo: jest.Mocked<Repository<Category>>;
  let translationRepo: jest.Mocked<Repository<CategoryTranslation>>;
  let languageRepo: jest.Mocked<Repository<Language>>;

  beforeEach(() => {
    categoryRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), remove: jest.fn() } as any;
    translationRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn(), remove: jest.fn() } as any;
    languageRepo = { findOne: jest.fn() } as any;

    service = new CategoriesService(categoryRepo, translationRepo, languageRepo);
  });

  it('should create a category', async () => {
    categoryRepo.create.mockReturnValue({ id: 'uuid' } as Category);
    categoryRepo.save.mockResolvedValue({ id: 'uuid' } as Category);
    const result = await service.createCategory({});
    expect(result.id).toBe('uuid');
  });

  it('should handle error in createCategory', async () => {
    categoryRepo.create.mockImplementation(() => { throw new Error('DB error'); });
    await expect(service.createCategory({})).rejects.toThrow(BusinessLogicException);
  });

  it('should delete category successfully', async () => {
    categoryRepo.findOne.mockResolvedValue({ id: 'uuid' } as Category);
    categoryRepo.remove.mockResolvedValue({ id: 'uuid' } as Category);
    await expect(service.deleteCategory('uuid')).resolves.toBeUndefined();
  });

  it('should throw error if category not found in deleteCategory', async () => {
    categoryRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteCategory('uuid')).rejects.toThrow(BusinessLogicException);
  });

  it('should add translation successfully', async () => {
    categoryRepo.findOne.mockResolvedValue({ id: 'uuid' } as Category);
    languageRepo.findOne.mockResolvedValue({ id: 'lang-uuid' } as Language);
    translationRepo.create.mockReturnValue({ id: 'trans-uuid' } as CategoryTranslation);
    translationRepo.save.mockResolvedValue({ id: 'trans-uuid' } as CategoryTranslation);
    const result = await service.addTranslation({ name: 'Tech', categoryId: 'uuid', languageId: 'lang-uuid' } as any);
    expect(result.id).toBe('trans-uuid');
  });

  it('should throw error if language not found', async () => {
    categoryRepo.findOne.mockResolvedValue({ id: 'uuid' } as Category);
    languageRepo.findOne.mockResolvedValue(null);
    await expect(service.addTranslation({ name: 'Tech', categoryId: 'uuid', languageId: 'lang-uuid' } as any))
      .rejects.toThrow(BusinessLogicException);
  });

  it('should return categories by language', async () => {
    translationRepo.find.mockResolvedValue([{ category: { id: 'uuid' }, name: 'Tech', description: 'Desc', language: { code: 'es' } } as any]);
    const result = await service.getCategoriesByLanguage('es');
    expect(result[0].language).toBe('es');
  });

  it('should handle error in getCategoriesByLanguage', async () => {
    translationRepo.find.mockRejectedValue(new Error('DB error'));
    await expect(service.getCategoriesByLanguage('es')).rejects.toThrow(BusinessLogicException);
  });

  it('should get category with translation', async () => {
    translationRepo.findOne.mockResolvedValue({ id: 'trans-uuid', category: { id: 'uuid' }, name: 'Tech', description: 'Desc', language: { code: 'es' } } as any);
    const result = await service.getCategoryWithTranslation('uuid', 'es');
    expect(result.language).toBe('es');
  });

  it('should throw error if translation not found', async () => {
    translationRepo.findOne.mockResolvedValue(null);
    await expect(service.getCategoryWithTranslation('uuid', 'es')).rejects.toThrow(BusinessLogicException);
  });

  it('should handle error in getCategoryWithTranslation', async () => {
    translationRepo.findOne.mockRejectedValue(new Error('DB error'));
    await expect(service.getCategoryWithTranslation('uuid', 'es')).rejects.toThrow(BusinessLogicException);
  });

  it('should update translation by category and lang', async () => {
    const translation = { id: 'trans-uuid', category: { id: 'uuid' }, language: { code: 'es' }, name: 'Old', description: 'Old desc' } as any;
    translationRepo.findOne.mockResolvedValue(translation);
    translationRepo.save.mockResolvedValue({ ...translation, name: 'New', description: 'New desc' });
    const result = await service.updateTranslationByCategoryAndLang('uuid', 'es', { name: 'New', description: 'New desc' });
    expect(result.name).toBe('New');
  });

  it('should update translation without changes when dto is empty', async () => {
    const translation = { id: 'trans-uuid', category: { id: 'uuid' }, language: { code: 'es' }, name: 'Old', description: 'Old desc' } as any;
    translationRepo.findOne.mockResolvedValue(translation);
    translationRepo.save.mockResolvedValue(translation);
    const result = await service.updateTranslationByCategoryAndLang('uuid', 'es', {});
    expect(result.name).toBe('Old');
  });

  it('should throw error if translation not found in update', async () => {
    translationRepo.findOne.mockResolvedValue(null);
    await expect(service.updateTranslationByCategoryAndLang('uuid', 'es', { name: 'New' })).rejects.toThrow(BusinessLogicException);
  });

  it('should delete translation successfully', async () => {
    translationRepo.findOne.mockResolvedValue({ id: 'trans-uuid' } as CategoryTranslation);
    translationRepo.remove.mockResolvedValue({ id: 'trans-uuid' } as CategoryTranslation);
    await expect(service.deleteTranslation('trans-uuid')).resolves.toBeUndefined();
  });

  it('should throw error if translation not found in delete', async () => {
    translationRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteTranslation('trans-uuid')).rejects.toThrow(BusinessLogicException);
  });
  it('should throw BusinessLogicException when createCategory fails', async () => {
    categoryRepo.create.mockImplementation(() => { throw new Error('DB error'); });
    await expect(service.createCategory({})).rejects.toThrow(BusinessLogicException);
  });

  it('should throw BusinessLogicException when getCategoriesByLanguage fails', async () => {
    translationRepo.find.mockRejectedValue(new Error('DB error'));
    await expect(service.getCategoriesByLanguage('es')).rejects.toThrow(BusinessLogicException);
  });
});