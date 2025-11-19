import { validate } from 'class-validator';
import { UpdateCategoryTranslationDto } from './update-category-translation.dto';

describe('UpdateCategoryTranslationDto', () => {
    it('should allow empty body', async () => {
        const dto = new UpdateCategoryTranslationDto();
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if name is not string', async () => {
        const dto = new UpdateCategoryTranslationDto();
        // @ts-ignore
        dto.name = 123;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if description is not string', async () => {
        const dto = new UpdateCategoryTranslationDto();
        // @ts-ignore
        dto.description = 456;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should validate correctly when both fields are strings', async () => {
        const dto = new UpdateCategoryTranslationDto();
        dto.name = 'Nueva categoría';
        dto.description = 'Descripción actualizada';
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should allow null values for optional fields', async () => {
        const dto = new UpdateCategoryTranslationDto();
        // @ts-ignore
        dto.name = null;
        // @ts-ignore
        dto.description = null;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});