import { httpGet } from './http';
import type { ApiGenre, ApiMovie, Movie, MovieColor, MoviesApiResponse } from '../types';

const COLORS: readonly MovieColor[] = ['blue', 'green', 'purple', 'pink', 'orange', 'red', 'gray', 'mint'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringOrNumber(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

function parseGenre(value: unknown): ApiGenre | null {
  if (!isRecord(value)) return null;
  return { genre: typeof value.genre === 'string' ? value.genre : undefined };
}

function parseApiMovie(value: unknown): ApiMovie {
  if (!isRecord(value)) throw new Error('API вернул некорректный объект фильма.');

  const genres = Array.isArray(value.genres)
    ? value.genres.map(parseGenre).filter((genre): genre is ApiGenre => genre !== null)
    : undefined;

  return {
    kinopoiskId: typeof value.kinopoiskId === 'number' ? value.kinopoiskId : undefined,
    filmId: typeof value.filmId === 'number' ? value.filmId : undefined,
    nameRu: typeof value.nameRu === 'string' ? value.nameRu : undefined,
    nameOriginal: typeof value.nameOriginal === 'string' ? value.nameOriginal : undefined,
    nameEn: typeof value.nameEn === 'string' ? value.nameEn : undefined,
    genres,
    ratingKinopoisk: isStringOrNumber(value.ratingKinopoisk) ? value.ratingKinopoisk : null,
    rating: isStringOrNumber(value.rating) ? value.rating : null,
    year: isStringOrNumber(value.year) ? value.year : undefined,
    posterUrlPreview: typeof value.posterUrlPreview === 'string' ? value.posterUrlPreview : undefined,
    posterUrl: typeof value.posterUrl === 'string' ? value.posterUrl : undefined,
    ratingAgeLimits: typeof value.ratingAgeLimits === 'string' ? value.ratingAgeLimits : undefined,
    description: typeof value.description === 'string' ? value.description : undefined,
    shortDescription: typeof value.shortDescription === 'string' ? value.shortDescription : undefined,
  };
}

function parseMoviesResponse(value: unknown): MoviesApiResponse {
  if (!isRecord(value) || !Array.isArray(value.films)) {
    throw new Error('Kinopoisk API вернул данные в неожиданном формате.');
  }
  return { films: value.films.map(parseApiMovie) };
}

export function normalizeAge(value: string | undefined): Movie['age'] {
  const digits = value?.replace(/^age/i, '').replace(/\+$/, '');
  if (digits === '0' || digits === '6' || digits === '12' || digits === '16' || digits === '18') {
    return `${digits}+`;
  }
  return '12+';
}

export function normalizeMovie(item: ApiMovie, index: number): Movie {
  const title = item.nameRu || item.nameOriginal || item.nameEn || `Фильм ${index + 1}`;
  const genre = item.genres?.[0]?.genre || 'Кино';
  const rawRating = item.ratingKinopoisk ?? item.rating ?? 0;
  const numericRating = Number(rawRating);
  const rating = Number.isFinite(numericRating) ? Number(numericRating.toFixed(1)) : 0;
  const numericYear = Number(item.year);
  const year = Number.isFinite(numericYear) ? numericYear : 0;
  const tags = [...new Set(
    (item.genres ?? [])
      .map((entry) => entry.genre)
      .filter((tag): tag is string => typeof tag === 'string' && tag.length > 0)
      .concat(genre !== 'Кино' ? [genre.toLowerCase()] : []),
  )];

  return {
    id: item.kinopoiskId ?? item.filmId ?? `${title}-${index}`,
    title,
    year,
    rating,
    age: normalizeAge(item.ratingAgeLimits),
    genre,
    tags,
    description: item.description || item.shortDescription || 'Описание для этого фильма не предоставлено API.',
    emoji: '🎬',
    color: COLORS[index % COLORS.length] ?? 'blue',
    posterURL: item.posterUrlPreview || item.posterUrl,
  };
}

async function requestMovies(path: string, params: Record<string, string | number>): Promise<Movie[]> {
  const raw: unknown = await httpGet<unknown>(path, params);
  return parseMoviesResponse(raw).films.map(normalizeMovie);
}

// Получаем популярные фильмы. Ответ API проверяется до преобразования в Movie.
export function getMovies(page = 1): Promise<Movie[]> {
  return requestMovies('/v2.2/films/top', { type: 'TOP_100_POPULAR_FILMS', page });
}

// Поиск фильмов по ключевым словам.
export function searchMovies(keyword: string, page = 1): Promise<Movie[]> {
  return requestMovies('/v2.1/films/search-by-keyword', { keyword, page });
}
