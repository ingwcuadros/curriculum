import { Tag } from './tag.entity';
import { TagTranslation } from './tag-translation.entity';

describe('Tag Entity', () => {
    it('should create a Tag instance with translations', () => {
        const tag = new Tag();
        tag.id = 'uuid-tag';
        tag.translations = [new TagTranslation()];

        expect(tag).toBeInstanceOf(Tag);
        expect(tag.id).toBe('uuid-tag');
        expect(tag.translations.length).toBe(1);
        expect(tag.translations[0]).toBeInstanceOf(TagTranslation);
    });
});