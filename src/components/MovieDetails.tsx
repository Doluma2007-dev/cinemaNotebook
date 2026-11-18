import type { MouseEvent } from 'react';
import type { Movie } from '../types';

interface MovieDetailsProps {
  movie: Movie | null;
  movies: Movie[];
  isSaved: boolean;
  onToggleSaved: (id: Movie['id']) => void;
  onOpenMovie: (movie: Movie) => void;
  onClose: () => void;
}

type ScoredMovie = Movie & { score: number };

export default function MovieDetails({
  movie, movies, isSaved, onToggleSaved, onOpenMovie, onClose,
}: MovieDetailsProps) {
  if (!movie) return null;

  const similar: ScoredMovie[] = movies
    .filter((item) => item.id !== movie.id)
    .map((item) => ({
      ...item,
      score: (item.genre === movie.genre ? 2 : 0) + item.tags.filter((tag) => movie.tags.includes(tag)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  const stopPropagation = (event: MouseEvent<HTMLElement>): void => event.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="details" onClick={stopPropagation}>
        <button className="close-button" onClick={onClose} aria-label="Закрыть">✕</button>
        <div className={`details-banner ${movie.color}`}>
          <span>{movie.emoji}</span>
          <div><p>ИНФОРМАЦИЯ О ФИЛЬМЕ</p><h2>{movie.title}</h2><span>{movie.year} · {movie.age} · ★ {movie.rating}</span></div>
        </div>
        <div className="details-content">
          <p>{movie.description}</p><p><strong>Жанр:</strong> {movie.genre}</p>
          <div className="tag-line">{movie.tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>
          <button className="main-button" onClick={() => onToggleSaved(movie.id)}>
            {isSaved ? '✓ Убрать из желаемого' : '+ Добавить в желаемое'}
          </button>
          <h3>Похожие фильмы</h3>
          {similar.length ? (
            <div className="similar-list">{similar.map((item) => (
              <button key={item.id} onClick={() => onOpenMovie(item)}>
                <span>{item.emoji}</span><span>{item.title}<small>{item.genre} · ★ {item.rating}</small></span>
              </button>
            ))}</div>
          ) : <p>Похожих фильмов пока нет.</p>}
        </div>
      </section>
    </div>
  );
}
