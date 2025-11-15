import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesService } from './languages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Language } from './entities/language.entity';
import { Repository } from 'typeorm';
import { BusinessLogicException } from '../shared/errors/business-errors';
import { HttpStatus } from '@nestjs/common';

describe('LanguagesService', () => {
  let service: LanguagesService;
  let repository: jest.Mocked<Repository<Language>>;

  const mockLanguage: Language = { id: '1', name: 'English' } as Language;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguagesService,
        {
          provide: getRepositoryToken(Language),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LanguagesService>(LanguagesService);
    repository = module.get(getRepositoryToken(Language));
  });

  describe('create', () => {
    it('debe crear y guardar un lenguaje', async () => {
      repository.create.mockReturnValue(mockLanguage);
      repository.save.mockResolvedValue(mockLanguage);

      const result = await service.create({ name: 'English', code: 'EN' });
      expect(result).toEqual(mockLanguage);
      expect(repository.create).toHaveBeenCalledWith({ name: 'English', code: 'EN' });
      expect(repository.save).toHaveBeenCalledWith(mockLanguage);
    });

    it('debe lanzar BusinessLogicException si ocurre un error', async () => {
      repository.create.mockReturnValue(mockLanguage);
      repository.save.mockRejectedValue(new Error('DB error'));

      await expect(service.create({ name: 'English', code: 'EN' })).rejects.toThrow(BusinessLogicException);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los lenguajes', async () => {
      repository.find.mockResolvedValue([mockLanguage]);
      const result = await service.findAll();
      expect(result).toEqual([mockLanguage]);
    });

    it('debe lanzar BusinessLogicException si ocurre un error', async () => {
      repository.find.mockRejectedValue(new Error('DB error'));
      await expect(service.findAll()).rejects.toThrow(BusinessLogicException);
    });
  });

  describe('findOne', () => {
    it('debe retornar el lenguaje si existe', async () => {
      repository.findOne.mockResolvedValue(mockLanguage);
      const result = await service.findOne('1');
      expect(result).toEqual(mockLanguage);
    });

    it('debe lanzar BusinessLogicException si no existe', async () => {
      repository.findOne.mockResolvedValue(null);
      await expect(service.findOne('2')).rejects.toThrow(BusinessLogicException);
    });
  });

  describe('update', () => {
    it('debe actualizar el lenguaje si existe', async () => {
      repository.preload.mockResolvedValue(mockLanguage);
      repository.save.mockResolvedValue(mockLanguage);

      const result = await service.update('1', { name: 'Spanish' });
      expect(result).toEqual(mockLanguage);
    });

    it('debe lanzar BusinessLogicException si no existe', async () => {
      repository.preload.mockResolvedValue(undefined);
      await expect(service.update('2', { name: 'Spanish' })).rejects.toThrow(BusinessLogicException);
    });

    it('debe lanzar BusinessLogicException si ocurre un error al guardar', async () => {
      repository.preload.mockResolvedValue(mockLanguage);
      repository.save.mockRejectedValue(new Error('DB error'));
      await expect(service.update('1', { name: 'Spanish' })).rejects.toThrow(BusinessLogicException);
    });
  });

  describe('remove', () => {
    it('debe eliminar el lenguaje si existe', async () => {
      repository.findOne.mockResolvedValue(mockLanguage);
      repository.remove.mockResolvedValue(mockLanguage);

      await service.remove('1');
      expect(repository.remove).toHaveBeenCalledWith(mockLanguage);
    });

    it('debe lanzar BusinessLogicException si ocurre un error al eliminar', async () => {
      repository.findOne.mockResolvedValue(mockLanguage);
      repository.remove.mockRejectedValue(new Error('DB error'));
      await expect(service.remove('1')).rejects.toThrow(BusinessLogicException);
    });
  });

  describe('LanguagesService - casos adicionales', () => {

    it('debe lanzar Error si ocurre error en findOne (DB error)', async () => {
      repository.findOne.mockRejectedValue(new Error('DB error'));
      await expect(service.findOne('1')).rejects.toThrow(Error);
      await expect(service.findOne('1')).rejects.toThrow('DB error');
    });


    it('debe lanzar BusinessLogicException si ocurre error en findAll (DB error)', async () => {
      repository.find.mockRejectedValue(new Error('DB error'));
      await expect(service.findAll()).rejects.toThrow(BusinessLogicException);
    });
  });

});