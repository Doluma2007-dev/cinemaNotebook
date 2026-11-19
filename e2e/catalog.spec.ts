import { test, expect } from '@playwright/test';

const films = [
  {
    kinopoiskId: 101,
    nameRu: 'Интерстеллар',
    year: 2014,
    ratingKinopoisk: 8.6,
    ratingAgeLimits: 'age16',
    genres: [{ genre: 'фантастика' }, { genre: 'драма' }],
    description: 'Исследование космоса ради спасения человечества.',
  },
  {
    kinopoiskId: 102,
    nameRu: 'Начало',
    year: 2010,
    ratingKinopoisk: 8.7,
    ratingAgeLimits: 'age12',
    genres: [{ genre: 'фантастика' }, { genre: 'боевик' }],
    description: 'История о проникновении в сны.',
  },
];

test.beforeEach(async ({ page }) => {
  await page.route('**/api/v2.2/films/top**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ films }),
    });
  });
  await page.goto('/');
  await expect(page.getByText('Получено фильмов: 2')).toBeVisible();
});

test('пользователь добавляет фильм в список желаемого', async ({ page }) => {
  const interstellarCard = page.locator('.movie-card').filter({ hasText: 'Интерстеллар' });
  await expect(interstellarCard).toBeVisible();
  await interstellarCard.getByRole('button', { name: '+ Желаемое' }).click();

  await page.locator('header nav button').nth(1).click();

  await expect(page.getByRole('heading', { name: 'Список желаемого' })).toBeVisible();
  const savedCard = page.locator('.movie-card').filter({ hasText: 'Интерстеллар' });
  await expect(savedCard).toBeVisible();
  await expect(savedCard.getByRole('button', { name: '✓ В желаемом' })).toBeVisible();
});

test('поиск фильтрует каталог по названию', async ({ page }) => {
  await page.getByPlaceholder('Поиск по названию, жанру или тегу...').fill('Начало');

  await expect(page.getByText('Начало').first()).toBeVisible();
  await expect(page.getByText('Интерстеллар')).toHaveCount(0);
});

test('пользователь открывает карточку фильма и видит описание', async ({ page }) => {
  await page.getByRole('button', { name: /Интерстеллар/ }).first().click();

  await expect(page.getByRole('heading', { name: 'Интерстеллар' })).toBeVisible();
  await expect(page.getByText('Исследование космоса ради спасения человечества.')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Похожие фильмы' })).toBeVisible();
});