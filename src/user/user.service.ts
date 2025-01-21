import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EmailService } from '@/mailer/email.service';
import { randomBytes } from 'crypto';
import { User } from '@/user/entities/user.entity';
import { SessionService } from '@/session/session.service';
import { AuthService } from '@/auth/auth.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { publicIdExtract } from '@/common/helpers/public-id-extraction';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { DeleteAccountDto } from './dto/delete-account.dto';

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

  async delete(id: number, payload: DeleteAccountDto): Promise<boolean> {
    try {
      const result = await this.userRepository.delete({
        id,
        email: payload.email,
      });

      return result.affected > 0;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new InternalServerErrorException('Failed to delete the account');
    }
  }
}
