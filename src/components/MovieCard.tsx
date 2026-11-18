import type { Movie } from '../types';

interface MovieCardProps {
  movie: Movie;
  isSaved: boolean;
  onToggleSaved: (id: Movie['id']) => void;
  onOpen: (movie: Movie) => void;
}

export default function MovieCard({ movie, isSaved, onToggleSaved, onOpen }: MovieCardProps) {
  return (
    <article className="movie-card">
      <button className={`poster ${movie.color}`} onClick={() => onOpen(movie)}>
        <span className="poster-year">{movie.year} · {movie.age}</span>
        {movie.posterURL
          ? <img className="poster-image" src={movie.posterURL} alt={`Постер: ${movie.title}`} loading="lazy" />
          : <span className="poster-emoji">{movie.emoji}</span>}
        <span className="poster-title">{movie.title}</span><span className="poster-rating">★ {movie.rating}</span>
      </button>
      <div className="card-bottom">
        <button className="movie-name" onClick={() => onOpen(movie)}>{movie.title}</button>
        <button className={isSaved ? 'save-button saved' : 'save-button'} onClick={() => onToggleSaved(movie.id)}>
          {isSaved ? '✓ В желаемом' : '+ Желаемое'}
        </button>
      </div>
      <div className="tag-line">{movie.tags.slice(0, 2).map((tag) => <span key={tag}>#{tag}</span>)}</div>
    </article>
  );
}
