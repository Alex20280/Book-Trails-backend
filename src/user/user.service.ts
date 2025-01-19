import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@/mailer/email.service';
import { randomBytes } from 'crypto';
import { User } from '@/user/entities/user.entity';
import { SetNewPasswordDto } from '@/auth/dto/set-new-passwor.dto';
import { SessionService } from '@/session/session.service';
import { CreateNewPasswordDto } from '@/auth/dto/create-new-password.dto';
import { AuthService } from '@/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    readonly emailService: EmailService,
    readonly sessionService: SessionService,
    readonly authService: AuthService,
  ) {}

  async forgetPassword(email: string): Promise<boolean> {
    const user = await this.authService.findOneByParams({ email });
    const code = randomBytes(2).toString('hex');

    user.resetPasswordCode = code;

    await this.userRepository.save(user);
    await this.emailService.sendEmail(email, code, true);
    return true;
  }

  async setNewPassword(
    payload: SetNewPasswordDto | CreateNewPasswordDto,
  ): Promise<User> {
    try {
      let user: User;
      let password: string;

      if ('code' in payload) {
        const { email, newPassword, code } = payload as SetNewPasswordDto;

        user = await this.userRepository.findOneBy({
          email,
          resetPasswordCode: code,
        });

        if (!user) {
          throw new BadRequestException('Invalid reset code');
        }

        user.resetPasswordCode = null;
        password = newPassword;
      } else {
        const { email, newPassword } = payload as CreateNewPasswordDto;

        user = await this.userRepository.findOneBy({ email });
        if (!user) {
          throw new BadRequestException('User not found');
        }
        password = newPassword;
      }

      user.password = await bcrypt.hash(password, 10);
      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async me(id: number) {
    return await this.userRepository.findOneByOrFail({ id });
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }
}
