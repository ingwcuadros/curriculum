import { Test, TestingModule } from '@nestjs/testing';
import { LanguagesController } from './languages.controller';
import { LanguagesService } from './languages.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

describe('LanguagesController', () => {
  let controller: LanguagesController;
  let service: jest.Mocked<LanguagesService>;

  const mockLanguage = { id: '1', name: 'English', code: 'EN' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguagesController],
      providers: [
        {
          provide: LanguagesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LanguagesController>(LanguagesController);
    service = module.get(LanguagesService);
  });

  describe('create', () => {
    it('debe llamar al servicio y retornar el lenguaje creado', async () => {
      const dto: CreateLanguageDto = { name: 'English', code: 'EN' };
      service.create.mockResolvedValue(mockLanguage);

      const result = await controller.create(dto);
      expect(result).toEqual(mockLanguage);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los lenguajes', async () => {
      service.findAll.mockResolvedValue([mockLanguage]);

      const result = await controller.findAll();
      expect(result).toEqual([mockLanguage]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe retornar el lenguaje por id', async () => {
      service.findOne.mockResolvedValue(mockLanguage);

      const result = await controller.findOne('1');
      expect(result).toEqual(mockLanguage);
      expect(service.findOne).toHaveBeenCalledWith('1');
    });
  });

  describe('update', () => {
    it('debe actualizar el lenguaje', async () => {
      const dto: UpdateLanguageDto = { name: 'Spanish', code: 'ES' };
      service.update.mockResolvedValue({ id: '1', name: 'Spanish', code: 'ES' });

      const result = await controller.update('1', dto);
      expect(result).toEqual({ id: '1', name: 'Spanish', code: 'ES' });
      expect(service.update).toHaveBeenCalledWith('1', dto);
    });
  });

  describe('remove', () => {
    it('debe eliminar el lenguaje', async () => {
      service.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');
      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith('1');
    });
  });
});