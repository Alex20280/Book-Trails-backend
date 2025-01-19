import { User } from '@/user/entities/user.entity';

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginSResponse {
  loggedInUser: User;
  accessToken: string;
  refreshToken: string;
}
