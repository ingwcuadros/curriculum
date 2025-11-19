import { validate } from 'class-validator';
import { CreateCategoryTranslationDto } from './create-category-translation.dto';
import { UpdateCategoryTranslationDto } from './update-category-translation.dto';

describe('CreateCategoryTranslationDto', () => {
    it('should validate a correct DTO', async () => {
        const dto = new CreateCategoryTranslationDto();
        dto.name = 'Tecnología';
        dto.description = 'Categoría de tecnología';
        dto.categoryId = '123e4567-e89b-12d3-a456-426614174000';
        dto.languageId = '123e4567-e89b-12d3-a456-426614174001';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if name is missing', async () => {
        const dto = new CreateCategoryTranslationDto();
        dto.categoryId = '123e4567-e89b-12d3-a456-426614174000';
        dto.languageId = '123e4567-e89b-12d3-a456-426614174001';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if categoryId is not UUID', async () => {
        const dto = new CreateCategoryTranslationDto();
        dto.name = 'Tecnología';
        dto.categoryId = 'invalid';
        dto.languageId = '123e4567-e89b-12d3-a456-426614174001';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isUuid');
    });
});

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
    });

    it('should validate correctly when both fields are strings', async () => {
        const dto = new UpdateCategoryTranslationDto();
        dto.name = 'Nueva categoría';
        dto.description = 'Descripción actualizada';
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});