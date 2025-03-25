import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from './schema/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<Partial<User>> {
    const existingUser = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new BadRequestException(
        `User with email ${createUserDto.email} already exists`,
      );
    }
    const salt = Number(this.configService.get<number>('SALT'));
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    const user = await this.userModel.create(createUserDto);
    const { password, ...userWithoutPassword } = user;

    await user.save();

    return userWithoutPassword;
  }

  async login(loginUserDto: LoginUserDto): Promise<{ token: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userModel.findOne({ where: { email } });
    if (!user)
      throw new BadRequestException(`User with email ${email} not found`);

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) throw new BadRequestException('Invalid password');

    const payload = { id: user.id, username: user.email };
    const token = this.jwtService.sign(payload);
    return { token };
  }
}
