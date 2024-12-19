import { ConflictException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOneOptions, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(payload: CreateUserDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: payload.email,
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const newUser = new User(payload);
    newUser.password = await bcrypt.hash(payload.password, 10);

    return await this.userRepository.save(newUser);
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
