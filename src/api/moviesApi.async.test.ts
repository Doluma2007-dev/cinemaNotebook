import { getMovies, searchMovies } from './moviesApi';
import { httpGet } from './http';

jest.mock('./http', () => ({
  httpGet: jest.fn(),
}));

const mockedHttpGet = jest.mocked(httpGet);

describe('асинхронные функции moviesApi', () => {
  beforeEach(() => {
    mockedHttpGet.mockReset();
  });

  it('getMovies дожидается ответа API и возвращает преобразованный список', async () => {
    mockedHttpGet.mockImplementation(async <T>() => ({
      films: [{
        kinopoiskId: 10,
        nameRu: 'Матрица',
        year: '1999',
        ratingKinopoisk: 8.5,
        genres: [{ genre: 'фантастика' }],
      }],
    } as T));

    await expect(getMovies()).resolves.toMatchObject([
      { id: 10, title: 'Матрица', year: 1999, rating: 8.5, genre: 'фантастика' },
    ]);
    expect(mockedHttpGet).toHaveBeenCalledWith('/v2.2/films/top', {
      type: 'TOP_100_POPULAR_FILMS',
      page: 1,
    });
  });

  it('getMovies передаёт ошибку API вызывающему коду', async () => {
    mockedHttpGet.mockImplementation(async () => { throw new Error('Сервер недоступен'); });

    await expect(getMovies()).rejects.toThrow('Сервер недоступен');
  });

  it('searchMovies отправляет ключевое слово и номер страницы', async () => {
    mockedHttpGet.mockImplementation(async <T>() => ({ films: [] } as T));

    await expect(searchMovies('матрица', 2)).resolves.toEqual([]);
    expect(mockedHttpGet).toHaveBeenCalledWith('/v2.1/films/search-by-keyword', {
      keyword: 'матрица',
      page: 2,
    });
  });

  it('отклоняет ответ API неправильного формата', async () => {
    mockedHttpGet.mockImplementation(async <T>() => ({ items: [] } as T));

    await expect(getMovies()).rejects.toThrow(
      'Kinopoisk API вернул данные в неожиданном формате.',
    );
  });
});
