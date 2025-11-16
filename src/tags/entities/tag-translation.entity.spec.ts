import { TagTranslation } from './tag-translation.entity';
import { Tag } from './tag.entity';
import { Language } from '../../languages/entities/language.entity';

describe('TagTranslation Entity', () => {
    it('should create a TagTranslation instance with relations', () => {
        const translation = new TagTranslation();
        translation.id = 'uuid-translation';
        translation.name = 'Tecnología';
        translation.description = 'Etiqueta para tecnología';
        translation.tag = new Tag();
        translation.language = new Language();

        expect(translation).toBeInstanceOf(TagTranslation);
        expect(translation.id).toBe('uuid-translation');
        expect(translation.name).toBe('Tecnología');
        expect(translation.description).toBe('Etiqueta para tecnología');
        expect(translation.tag).toBeInstanceOf(Tag);
        expect(translation.language).toBeInstanceOf(Language);
    });
});