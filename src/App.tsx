import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Movie, MovieId, Page, SortMode } from './types';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import MovieCard from './components/MovieCard';
import MovieDetails from './components/MovieDetails';
import { getMovies } from './api/moviesApi';

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Не удалось загрузить фильмы. Попробуйте ещё раз.';
}

export default function App() {
  const [page, setPage] = useState<Page>('catalog');
  const [search, setSearch] = useState<string>('');
  const [genre, setGenre] = useState<string>('Все жанры');
  const [age, setAge] = useState<string>('Все возрасты');
  const [sort, setSort] = useState<SortMode>('rating');
  const [wishlist, setWishlist] = useState<MovieId[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const loadMovies = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const data = await getMovies();
      setMovies(data);
    } catch (cause: unknown) {
      setError(getErrorMessage(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMovies();
  }, [loadMovies]);

  const toggleSaved = useCallback((id: MovieId): void => {
    setWishlist((current) => current.includes(id)
      ? current.filter((movieId) => movieId !== id)
      : [...current, id]);
  }, []);

  const shownMovies = useMemo(() => {
    const text = search.toLowerCase().trim();
    const result = movies.filter((movie) => {
      const matchesSearch = movie.title.toLowerCase().includes(text)
        || movie.genre.toLowerCase().includes(text)
        || movie.tags.some((tag) => tag.toLowerCase().includes(text));
      const matchesGenre = genre === 'Все жанры' || movie.genre === genre;
      const matchesAge = age === 'Все возрасты' || movie.age === age;
      const matchesPage = page === 'catalog' || wishlist.includes(movie.id);
      return matchesSearch && matchesGenre && matchesAge && matchesPage;
    });

    return [...result].sort((a, b) => {
      switch (sort) {
        case 'rating': return b.rating - a.rating;
        case 'year': return b.year - a.year;
        case 'title': return a.title.localeCompare(b.title, 'ru');
      }
    });
  }, [movies, search, genre, age, page, wishlist, sort]);

  return (
    <div className="app">
      <Header page={page} onChangePage={setPage} wishlistCount={wishlist.length} />
      <main>
        <section className="hero">
          <p className="eyebrow">ТВОЯ ЛИЧНАЯ КИНОТЕКА</p>
          <h1>Найди фильм<br /><span>под своё настроение.</span></h1>
          <p className="hero-description">Ищи кино по жанрам и тегам, сохраняй фильмы в желаемое и открывай похожие истории. Каталог загружается из публичного API.</p>
        </section>

        <div className="api-toolbar">
          <span className="api-status">{loading ? 'Загружаем каталог…' : error ? 'Ошибка загрузки' : `Получено фильмов: ${movies.length}`}</span>
          <button className="reload-button" onClick={() => void loadMovies()} disabled={loading}>
            {loading ? 'Загрузка…' : '↻ Обновить каталог'}
          </button>
        </div>

        {error && <div className="request-error" role="alert">
          <div><strong>Не удалось получить данные от API.</strong><p>{error}</p></div>
          <button className="main-button" onClick={() => void loadMovies()} disabled={loading}>Повторить запрос</button>
        </div>}

        <label className="search">
          <span>⌕</span>
          <input value={search} onChange={(event) => setSearch(event.currentTarget.value)} placeholder="Поиск по названию, жанру или тегу..." />
          {search && <button onClick={() => setSearch('')}>Очистить</button>}
        </label>
        <FilterBar genre={genre} onGenreChange={setGenre} age={age} onAgeChange={setAge} sort={sort} onSortChange={setSort} />

        <section className="catalog">
          <div className="section-heading">
            <div><p className="eyebrow">{page === 'wishlist' ? 'ТВОЯ КОЛЛЕКЦИЯ' : 'ВЫБРАНО ДЛЯ ТЕБЯ'}</p><h2>{page === 'wishlist' ? 'Список желаемого' : 'Каталог фильмов'}</h2></div>
            <span>{shownMovies.length} фильмов</span>
          </div>
          {loading && movies.length === 0 ? (
            <div className="loading-state" role="status"><span className="spinner" />Загружаем фильмы из API…</div>
          ) : shownMovies.length ? (
            <div className="movie-grid">{shownMovies.map((movie) => (
              <MovieCard key={movie.id} movie={movie} isSaved={wishlist.includes(movie.id)} onToggleSaved={toggleSaved} onOpen={setSelectedMovie} />
            ))}</div>
          ) : !error ? (
            <div className="empty-state">
              <span>🍿</span><h3>{page === 'wishlist' ? 'Список пока пуст' : 'Ничего не найдено'}</h3>
              <p>{page === 'wishlist' ? 'Добавь понравившиеся фильмы в желаемое.' : 'API вернул пустой список или фильтры не нашли совпадений.'}</p>
              {page === 'wishlist' && <button className="main-button" onClick={() => setPage('catalog')}>Открыть каталог</button>}
            </div>
          ) : null}
        </section>
      </main>
      <footer>СинемаБлокнот · React + TypeScript + Kinopoisk API</footer>
      <MovieDetails
        movie={selectedMovie}
        movies={movies}
        isSaved={selectedMovie ? wishlist.includes(selectedMovie.id) : false}
        onToggleSaved={toggleSaved}
        onOpenMovie={setSelectedMovie}
        onClose={() => setSelectedMovie(null)}
      />
    </div>
  );
}
