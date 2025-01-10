import { User } from '@/user/entities/user.entity';

export interface LoginCResponse {
  existingUser: User;
  accessToken: string;
}
