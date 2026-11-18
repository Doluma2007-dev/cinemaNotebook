import type { ChangeEvent } from 'react';
import type { SortMode } from '../types';

interface FilterBarProps {
  genre: string;
  onGenreChange: (value: string) => void;
  age: string;
  onAgeChange: (value: string) => void;
  sort: SortMode;
  onSortChange: (value: SortMode) => void;
}

export default function FilterBar({
  genre, onGenreChange, age, onAgeChange, sort, onSortChange,
}: FilterBarProps) {
  const handleSortChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.currentTarget.value;
    if (value === 'rating' || value === 'year' || value === 'title') onSortChange(value);
  };

  return (
    <section className="filters">
      <label><span>Жанр</span><select value={genre} onChange={(event) => onGenreChange(event.currentTarget.value)}>
        <option>Все жанры</option><option>Драма</option><option>Фантастика</option><option>Комедия</option><option>Мультфильм</option>
      </select></label>
      <label><span>Возраст</span><select value={age} onChange={(event) => onAgeChange(event.currentTarget.value)}>
        <option>Все возрасты</option><option>0+</option><option>6+</option><option>12+</option><option>16+</option><option>18+</option>
      </select></label>
      <label><span>Сортировка</span><select value={sort} onChange={handleSortChange}>
        <option value="rating">По рейтингу</option><option value="year">Сначала новые</option><option value="title">По названию</option>
      </select></label>
    </section>
  );
}
