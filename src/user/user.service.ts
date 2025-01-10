import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { EmailService } from '@/mailer/email.service';
import { randomBytes } from 'crypto';
import { VerifyEmailDto } from '@/auth/dto/verify-email.dto';
import { User } from '@/user/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    readonly emailService: EmailService,
  ) {}

  async create(payload: CreateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOneBy({
      email: payload.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = new User(payload);
    const token = randomBytes(2).toString('hex');

    newUser.password = await bcrypt.hash(payload.password, 10);
    newUser.emailVerificationToken = token;

    await this.emailService.sendEmailVerification(payload.email, token);

    return await this.userRepository.save(newUser);
  }

  async verifyEmail(payload: VerifyEmailDto): Promise<User> {
    const { email, emailVerificationToken } = payload;
    try {
      const user = await this.userRepository.findOneBy({
        email,
        emailVerificationToken,
      });

      if (!user) {
        throw new BadRequestException('Invalid token');
      }

      user.isVerifyEmail = true;
      user.emailVerificationToken = null;
      user.isLoggedIn = true;

      return await this.userRepository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async login(user: User) {
    user.isLoggedIn = true;
    return await this.userRepository.save(user);
  }

  async findOneByParams(
    params: Record<string, string | number | boolean>,
    relations?: string[],
  ): Promise<User> {
    const queryOptions: FindOneOptions<User> = {
      where: params,
      relations: relations,
    };

    const user = await this.userRepository.findOneOrFail(queryOptions);

    return user;
  }

  async findAll() {
    return `This action returns all user`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  async update(id: number, payload: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
