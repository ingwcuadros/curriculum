import { TagsService } from './tags.service';
import { Repository } from 'typeorm';
import { Tag } from './entities/tag.entity';
import { TagTranslation } from './entities/tag-translation.entity';
import { Language } from '../languages/entities/language.entity';
import { BusinessLogicException } from '../shared/errors/business-errors';

describe('TagsService', () => {
  let service: TagsService;
  let tagRepo: jest.Mocked<Repository<Tag>>;
  let translationRepo: jest.Mocked<Repository<TagTranslation>>;
  let languageRepo: jest.Mocked<Repository<Language>>;

  beforeEach(() => {
    tagRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), remove: jest.fn() } as any;
    translationRepo = { create: jest.fn(), save: jest.fn(), findOne: jest.fn(), find: jest.fn(), remove: jest.fn() } as any;
    languageRepo = { findOne: jest.fn() } as any;

    service = new TagsService(tagRepo, translationRepo, languageRepo);
  });

  it('should create a tag', async () => {
    tagRepo.create.mockReturnValue({ id: 'uuid' } as Tag);
    tagRepo.save.mockResolvedValue({ id: 'uuid' } as Tag);
    const result = await service.createTag({});
    expect(result.id).toBe('uuid');
  });

  it('should handle error in createTag', async () => {
    tagRepo.create.mockImplementation(() => { throw new Error('DB error'); });
    await expect(service.createTag({})).rejects.toThrow(BusinessLogicException);
  });

  it('should delete tag successfully', async () => {
    tagRepo.findOne.mockResolvedValue({ id: 'uuid' } as Tag);
    tagRepo.remove.mockResolvedValue({ id: 'uuid' } as Tag);
    await expect(service.deleteTag('uuid')).resolves.toBeUndefined();
  });

  it('should throw error if tag not found in deleteTag', async () => {
    tagRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteTag('uuid')).rejects.toThrow(BusinessLogicException);
  });

  it('should add translation successfully', async () => {
    tagRepo.findOne.mockResolvedValue({ id: 'uuid' } as Tag);
    languageRepo.findOne.mockResolvedValue({ id: 'lang-uuid' } as Language);
    translationRepo.create.mockReturnValue({ id: 'trans-uuid' } as TagTranslation);
    translationRepo.save.mockResolvedValue({ id: 'trans-uuid' } as TagTranslation);
    const result = await service.addTranslation({ name: 'Tech', tagId: 'uuid', languageId: 'lang-uuid' } as any);
    expect(result.id).toBe('trans-uuid');
  });

  it('should throw error if language not found', async () => {
    tagRepo.findOne.mockResolvedValue({ id: 'uuid' } as Tag);
    languageRepo.findOne.mockResolvedValue(null);
    await expect(service.addTranslation({ name: 'Tech', tagId: 'uuid', languageId: 'lang-uuid' } as any))
      .rejects.toThrow(BusinessLogicException);
  });

  it('should return tags by language', async () => {
    translationRepo.find.mockResolvedValue([{ tag: { id: 'uuid' }, name: 'Tech', description: 'Desc', language: { code: 'es' } } as any]);
    const result = await service.getTagsByLanguage('es');
    expect(result[0].language).toBe('es');
  });

  it('should handle error in getTagsByLanguage', async () => {
    translationRepo.find.mockRejectedValue(new Error('DB error'));
    await expect(service.getTagsByLanguage('es')).rejects.toThrow(BusinessLogicException);
  });

  it('should get tag with translation', async () => {
    translationRepo.findOne.mockResolvedValue({ id: 'trans-uuid', tag: { id: 'uuid' }, name: 'Tech', description: 'Desc', language: { code: 'es' } } as any);
    const result = await service.getTagWithTranslation('uuid', 'es');
    expect(result.language).toBe('es');
  });

  it('should throw error if translation not found', async () => {
    translationRepo.findOne.mockResolvedValue(null);
    await expect(service.getTagWithTranslation('uuid', 'es')).rejects.toThrow(BusinessLogicException);
  });

  it('should handle error in getTagWithTranslation', async () => {
    translationRepo.findOne.mockRejectedValue(new Error('DB error'));
    await expect(service.getTagWithTranslation('uuid', 'es')).rejects.toThrow(BusinessLogicException);
  });

  it('should update translation by tag and lang', async () => {
    const translation = { id: 'trans-uuid', tag: { id: 'uuid' }, language: { code: 'es' }, name: 'Old', description: 'Old desc' } as any;
    translationRepo.findOne.mockResolvedValue(translation);
    translationRepo.save.mockResolvedValue({ ...translation, name: 'New', description: 'New desc' });
    const result = await service.updateTranslationByTagAndLang('uuid', 'es', { name: 'New', description: 'New desc' });
    expect(result.name).toBe('New');
  });

  it('should throw error if translation not found in update', async () => {
    translationRepo.findOne.mockResolvedValue(null);
    await expect(service.updateTranslationByTagAndLang('uuid', 'es', { name: 'New' })).rejects.toThrow(BusinessLogicException);
  });

  it('should delete translation successfully', async () => {
    translationRepo.findOne.mockResolvedValue({ id: 'trans-uuid' } as TagTranslation);
    translationRepo.remove.mockResolvedValue({ id: 'trans-uuid' } as TagTranslation);
    await expect(service.deleteTranslation('trans-uuid')).resolves.toBeUndefined();
  });

  it('should throw error if translation not found in delete', async () => {
    translationRepo.findOne.mockResolvedValue(null);
    await expect(service.deleteTranslation('trans-uuid')).rejects.toThrow(BusinessLogicException);
  });

  it('should update translation without changes when dto is empty', async () => {
    const translation = { id: 'trans-uuid', tag: { id: 'uuid' }, language: { code: 'es' }, name: 'Old', description: 'Old desc' } as any;
    translationRepo.findOne.mockResolvedValue(translation);
    translationRepo.save.mockResolvedValue(translation);
    const result = await service.updateTranslationByTagAndLang('uuid', 'es', {});
    expect(result.name).toBe('Old');
    expect(result.description).toBe('Old desc');
  });

});