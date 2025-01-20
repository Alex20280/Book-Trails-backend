import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@/mailer/email.service';
import { randomBytes } from 'crypto';
import { User } from '@/user/entities/user.entity';
import { SetNewPasswordDto } from '@/auth/dto/set-new-passwor.dto';
import { SessionService } from '@/session/session.service';
import { CreateNewPasswordDto } from '@/auth/dto/create-new-password.dto';
import { AuthService } from '@/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { publicIdExtract } from '@/common/helpers/public-id-extraction';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    readonly emailService: EmailService,
    readonly sessionService: SessionService,
    readonly authService: AuthService,
    readonly cloudinaryService: CloudinaryService,
    private readonly dataSource: DataSource,
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

  async update(
    id: number,
    payload: UpdateUserDto,
    image?: Express.Multer.File,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneByOrFail(User, { id });

      if (payload.name) {
        user.name = payload.name;
      }

      let oldImage: string | null = null;

      if (image) {
        if (user.image) {
          oldImage = user.image;
        }

        const { secure_url } = await this.cloudinaryService.uploadFile(image);
        user.image = secure_url;
      }

      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();

      if (oldImage) {
        const publicId = publicIdExtract(oldImage);
        await this.cloudinaryService.deleteFile(publicId);
      }

      return user;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async saveUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async logout(id: number) {
    const user = await this.userRepository.findOneByOrFail({ id });
    user.isLoggedIn = false;

    const loggedOutUser = await this.userRepository.save(user);
    await this.sessionService.closeSession(id);

    return { message: 'Logout successful', userId: loggedOutUser.id };
  }
}
