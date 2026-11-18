import { normalizeAge, normalizeMovie } from './moviesApi';
import type { ApiMovie } from '../types';

describe('normalizeAge', () => {
  test.each([
    ['age0', '0+'],
    ['age6', '6+'],
    ['age12', '12+'],
    ['age16', '16+'],
    ['age18', '18+'],
    [undefined, '12+'],
    ['age21', '12+'],
    ['unknown', '12+'],
  ])('преобразует возраст %s в %s', (input, expected) => {
    expect(normalizeAge(input)).toBe(expected);
  });
});

describe('normalizeMovie', () => {
  it('преобразует корректный ответ API в объект фильма', () => {
    const apiMovie: ApiMovie = {
      kinopoiskId: 123,
      nameRu: 'Интерстеллар',
      year: '2014',
      ratingKinopoisk: '8.6',
      ratingAgeLimits: 'age16',
      genres: [{ genre: 'фантастика' }, { genre: 'драма' }],
      description: 'Путешествие через пространство и время',
      posterUrlPreview: 'https://example.com/poster.jpg',
    };

    expect(normalizeMovie(apiMovie, 0)).toEqual({
      id: 123,
      title: 'Интерстеллар',
      year: 2014,
      rating: 8.6,
      age: '16+',
      genre: 'фантастика',
      tags: ['фантастика', 'драма'],
      description: 'Путешествие через пространство и время',
      emoji: '🎬',
      color: 'blue',
      posterURL: 'https://example.com/poster.jpg',
    });
  });

  it('использует запасные значения, если поля API отсутствуют или некорректны', () => {
    const result = normalizeMovie({ ratingKinopoisk: 'не число', year: 'не год' }, 2);

    expect(result.title).toBe('Фильм 3');
    expect(result.id).toBe('Фильм 3-2');
    expect(result.rating).toBe(0);
    expect(result.year).toBe(0);
    expect(result.genre).toBe('Кино');
    expect(result.tags).toEqual([]);
    expect(result.description).toBe('Описание для этого фильма не предоставлено API.');
  });

  it('не дублирует теги жанров', () => {
    const result = normalizeMovie({
      nameRu: 'Тест',
      genres: [{ genre: 'комедия' }, { genre: 'комедия' }],
    }, 0);

    expect(result.tags).toEqual(['комедия']);
  });
});
