import { validate } from 'class-validator';
import { CreateLanguageDto } from './create-language.dto';

describe('CreateLanguageDto', () => {
    it('debe ser válido cuando name y code son strings no vacíos', async () => {
        const dto = new CreateLanguageDto();
        dto.name = 'Español';
        dto.code = 'ES';

        const errors = await validate(dto);
        expect(errors.length).toBe(0);
    });

    it('debe fallar cuando name está vacío', async () => {
        const dto = new CreateLanguageDto();
        dto.name = '';
        dto.code = 'ES';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.property === 'name')).toBe(true);
    });

    it('debe fallar cuando code está vacío', async () => {
        const dto = new CreateLanguageDto();
        dto.name = 'Español';
        dto.code = '';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.property === 'code')).toBe(true);
    });

    it('debe fallar cuando name no es un string', async () => {
        const dto = new CreateLanguageDto();
        // @ts-ignore
        dto.name = 123;
        dto.code = 'ES';

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.property === 'name')).toBe(true);
    });

    it('debe fallar cuando code no es un string', async () => {
        const dto = new CreateLanguageDto();
        dto.name = 'Español';
        // @ts-ignore
        dto.code = 456;

        const errors = await validate(dto);
        expect(errors.length).toBeGreaterThan(0);
        expect(errors.some(e => e.property === 'code')).toBe(true);
    });
});