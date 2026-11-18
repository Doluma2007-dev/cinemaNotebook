export type MovieId = number | string;
export type MovieAge = '0+' | '6+' | '12+' | '16+' | '18+';
export type MovieColor = 'blue' | 'green' | 'purple' | 'pink' | 'orange' | 'red' | 'gray' | 'mint';
export type SortMode = 'rating' | 'year' | 'title';
export type Page = 'catalog' | 'wishlist';

export interface Movie {
  id: MovieId;
  title: string;
  year: number;
  rating: number;
  age: MovieAge;
  genre: string;
  tags: string[];
  description: string;
  emoji: string;
  color: MovieColor;
  posterURL?: string;
}

export type MovieCardPropsData = Pick<Movie, 'id' | 'title' | 'year' | 'rating' | 'age' | 'genre' | 'tags' | 'emoji' | 'color' | 'posterURL'>;
export type MoviePreview = Pick<Movie, 'id' | 'title' | 'year' | 'rating' | 'genre' | 'emoji'>;
export type MovieWithoutDescription = Omit<Movie, 'description'>;
export type MovieDictionary = Record<string, Movie>;

export type LoadingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; loadedAt: number }
  | { status: 'error'; message: string };

export interface ApiGenre {
  genre?: string;
}

export interface ApiMovie {
  kinopoiskId?: number;
  filmId?: number;
  nameRu?: string;
  nameOriginal?: string;
  nameEn?: string;
  genres?: ApiGenre[];
  ratingKinopoisk?: number | string | null;
  rating?: number | string | null;
  year?: number | string;
  posterUrlPreview?: string;
  posterUrl?: string;
  ratingAgeLimits?: string;
  description?: string;
  shortDescription?: string;
}

export interface MoviesApiResponse {
  films: ApiMovie[];
}

export type SearchParams = Record<string, string | number | boolean | null | undefined>;
