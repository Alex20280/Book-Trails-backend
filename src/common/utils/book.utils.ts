import { Book } from '@/book/entities/book.entity';
import { ReadDay } from '../interfaces';
import { BookStatus } from '../enums/book.enum';
import { BookSession } from '@/book-session/entities/book-session.entity';

export const getStartEndOfYear = (offset: number, year: number) => {
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYearUTC = new Date(Date.UTC(year + 1, 0, 1));
  const startOfYearUserTime = new Date(startOfYear.getTime() + offset * 60000);
  const endOfYearUserTime = new Date(endOfYearUTC.getTime() + offset * 60000);
  return { startOfYearUserTime, endOfYearUserTime };
};

export const createReadDaysResponse = (readDays: ReadDay[]) => {
  const monthDaysCount = readDays.reduce((acc, { readDay }) => {
    const month = new Date(readDay).getMonth() + 1; // Отримуємо місяць (1-12) тому що місяці починаються з 0
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += 1; // Підраховуємо кількість днів для цього місяця
    return acc;
  }, {});

  const response = Object.entries(monthDaysCount).map(([month, count]) => ({
    [parseInt(month, 10)]: count,
  }));

  return response;
};

export const formatBooksPerMonth = (
  data: { readmonth: string; bookcount: string }[],
) => {
  return data.map(({ readmonth, bookcount }) => ({
    [parseInt(readmonth.split('-')[1])]: parseInt(bookcount),
  }));
};

export const getManyResponse = (books: Book[]) => {
  const response = books.map((book) => {
    const { id, title, image, author, status, pages, userRating } = book;
    const totalReadingTime = book.bookSessions?.reduce((total, session) => {
      if (
        session.startDate &&
        session.endDate &&
        book.status === BookStatus.Read
      ) {
        const start = new Date(session.startDate).getTime();
        const end = new Date(session.endDate).getTime();
        return total + (end - start);
      }
      return total;
    }, 0);

    let readPercetage: number | undefined;

    if (book.status !== BookStatus.ToRead) {
      const readPages = book.bookSessions?.length
        ? book.bookSessions.reduce(
            (max: number, session: BookSession) =>
              session.currentPage > max ? session.currentPage : max,
            0,
          )
        : 0;

      const readPerc = parseFloat((readPages / book.pages).toFixed(2)) * 100;

      readPercetage = readPerc;
    }

    return {
      id,
      title,
      image,
      author,
      status,
      pages,
      ...(userRating && { userRating }),
      ...(totalReadingTime !== 0 && { totalReadingTime }),
      ...(readPercetage !== 0 && { readPercetage }),
    };
  });

  return response;
};

export const calculateReadingTime = (sessions: BookSession[]) => {
  const { totalSessionTime, totalPauseTime } = sessions.reduce(
    (acc, session) => {
      const sessionStart = new Date(session.startDate).getTime();
      const sessionEnd = new Date(session.endDate).getTime();

      acc.totalSessionTime += sessionEnd - sessionStart;

      session.pauses.forEach((pause) => {
        const pauseStart = new Date(pause.startDate).getTime();
        const pauseEnd = new Date(pause.endDate).getTime();
        acc.totalPauseTime += pauseEnd - pauseStart;
      });

      return acc;
    },
    { totalSessionTime: 0, totalPauseTime: 0 },
  );

  return Math.round((totalSessionTime - totalPauseTime) / 60000);
};

export const findStartReadingDate = (bookSessions: BookSession[]) => {
  return bookSessions.sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  )[0]?.startDate;
};

export const findEndReadingDate = (bookSessions: BookSession[]) => {
  return bookSessions.sort(
    (a, b) => new Date(b.endDate).getTime() - new Date(a.endDate).getTime(),
  )[0]?.endDate;
};

const adjustForUserTimezone = (dateStr: string, offsetInMinutes: number) => {
  const date = new Date(dateStr);
  const adjustedDate = new Date(date.getTime() - offsetInMinutes * 60000);
  return adjustedDate;
};

export const calculateSinceStart = (
  startReadingDate: string,
  offset: number,
) => {
  const now = new Date().toISOString();
  const userNowDate = adjustForUserTimezone(now, offset);
  const userStartDate = adjustForUserTimezone(startReadingDate, offset);
  const diffInMillis = userNowDate.getTime() - userStartDate.getTime();
  return Math.floor(diffInMillis / (1000 * 3600 * 24));
};
