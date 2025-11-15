import { BusinessLogicException } from './business-errors';
import { HttpStatus } from '@nestjs/common';

describe('BusinessLogicException', () => {
    it('debe crear una instancia con el mensaje y el status correcto', () => {
        const message = 'Error de negocio';
        const status = HttpStatus.BAD_REQUEST;

        const exception = new BusinessLogicException(message, status);

        expect(exception).toBeInstanceOf(BusinessLogicException);
        expect(exception.message).toBe(message);
        expect(exception.getStatus()).toBe(status);
    });

    it('debe heredar de HttpException', () => {
        const exception = new BusinessLogicException('Error', HttpStatus.CONFLICT);
        expect(exception).toBeInstanceOf(Error);
        expect(exception).toBeInstanceOf(BusinessLogicException);
    });

    it('debe retornar el status y el mensaje en la respuesta', () => {
        const message = 'Operación inválida';
        const status = HttpStatus.FORBIDDEN;

        const exception = new BusinessLogicException(message, status);
        const response = exception.getResponse();

        expect(response).toEqual(message);
        expect(exception.getStatus()).toBe(status);
    });
});