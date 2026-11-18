import type { Page } from '../types';

interface HeaderProps {
  page: Page;
  onChangePage: (page: Page) => void;
  wishlistCount: number;
}

export default function Header({ page, onChangePage, wishlistCount }: HeaderProps) {
  return (
    <header className="header">
      <button className="logo" onClick={() => onChangePage('catalog')}>🎬 СинемаБлокнот</button>
      <nav>
        <button className={page === 'catalog' ? 'nav-button active' : 'nav-button'} onClick={() => onChangePage('catalog')}>Каталог</button>
        <button className={page === 'wishlist' ? 'nav-button active' : 'nav-button'} onClick={() => onChangePage('wishlist')}>
          Желаемое <span className="count">{wishlistCount}</span>
        </button>
      </nav>
    </header>
  );
}
