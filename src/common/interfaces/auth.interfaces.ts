import { User } from '@/user/entities/user.entity';

export interface CLoginResponse {
  loggedInUser: User;
  accessToken: string;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface SLoginResponse {
  loggedInUser: User;
  accessToken: string;
  refreshToken: string;
}

export interface InTokensGenerate {
  email: string;
  role: string;
  id: number;
  name: string;
  sessionId: number;
}
