import { BookStatus } from '../enums/book.enum';

export interface BookResponse {
  id: number;
  title: string;
  image: string | null;
  author: string;
  status: BookStatus;
  pages: number;
  readPercetage?: number;
  totalReadingTime?: number;
  userRating: number | null;
}
