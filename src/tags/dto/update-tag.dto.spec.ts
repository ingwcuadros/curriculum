import { validate } from 'class-validator';
import { UpdateTranslationDto } from './update-tag.dto';

describe('UpdateTranslationDto', () => {
    it('should allow empty body', async () => {
        const dto = new UpdateTranslationDto();
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should fail if name is not string', async () => {
        const dto = new UpdateTranslationDto();
        // @ts-ignore
        dto.name = 123;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should fail if description is not string', async () => {
        const dto = new UpdateTranslationDto();
        // @ts-ignore
        dto.description = 456;
        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('should validate correctly when both fields are strings', async () => {
        const dto = new UpdateTranslationDto();
        dto.name = 'Nuevo nombre';
        dto.description = 'Nueva descripción';
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('should allow null values for optional fields', async () => {
        const dto = new UpdateTranslationDto();
        // @ts-ignore
        dto.name = null;
        // @ts-ignore
        dto.description = null;
        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });
});