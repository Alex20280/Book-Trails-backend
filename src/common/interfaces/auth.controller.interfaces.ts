import { User } from '@/user/entities/user.entity';

export interface LoginCResponse {
  loggedInUser: User;
  accessToken: string;
}
