import { validate } from 'class-validator';
import { CreateTagTranslationDto } from './create-tag-translation.dto';

describe('CreateTagTranslationDto', () => {
    it('should validate a correct DTO', async () => {
        const dto = new CreateTagTranslationDto();
        dto.name = 'Tecnología';
        dto.description = 'Etiqueta';
        dto.tagId = '123e4567-e89b-12d3-a456-426614174000';
        dto.languageId = '123e4567-e89b-12d3-a456-426614174001';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if name is missing', async () => {
        const dto = new CreateTagTranslationDto();
        dto.tagId = '123e4567-e89b-12d3-a456-426614174000';
        dto.languageId = '123e4567-e89b-12d3-a456-426614174001';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if tagId is not UUID', async () => {
        const dto = new CreateTagTranslationDto();
        dto.name = 'Tecnología';
        dto.tagId = 'invalid-uuid';
        dto.languageId = '123e4567-e89b-12d3-a456-426614174001';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isUuid');
    });
});