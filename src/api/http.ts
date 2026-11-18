import type { SearchParams } from '../types';

const API_BASE_URL = 'https://kinopoiskapiunofficial.tech/api';
// Vite подставляет значение из .env через define в vite.config.ts.
// Такой способ также позволяет Jest запускать модуль без синтаксиса import.meta.
const API_KEY = process.env.VITE_KINOPOISK_API_KEY?.trim();

export async function httpGet<T>(path: string, params: SearchParams = {}): Promise<T> {
  if (!API_KEY || API_KEY === 'вставьте_свой_ключ_сюда') {
    throw new Error('Не найден API-ключ. Создайте файл .env и задайте VITE_KINOPOISK_API_KEY.');
  }

  const url = new URL(`${API_BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json', 'X-API-KEY': API_KEY },
    });
  } catch {
    throw new Error('Не удалось подключиться к API. Проверьте интернет-соединение и доступность сервиса.');
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('API отклонил ключ (401/403). Проверьте VITE_KINOPOISK_API_KEY в файле .env.');
    }
    if (response.status === 402) throw new Error('Исчерпан лимит запросов API. Попробуйте позже.');
    if (response.status === 429) throw new Error('Слишком много запросов к API. Подождите немного и повторите попытку.');
    throw new Error(`Kinopoisk API вернул ошибку HTTP ${response.status}`);
  }

  return (await response.json()) as T;
}
