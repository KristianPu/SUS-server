import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

import { UserService } from '../user.service';
import { User } from '../schema/user.schema';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn().mockResolvedValue(true),
}));

const mockUser = {
  _id: 'mockId',
  email: 'test@example.com',
  password: 'hashedPassword',
};

const mockUserModel = {
  find: jest
    .fn()
    .mockReturnValue({ exec: jest.fn().mockResolvedValue([mockUser]) }),
  create: jest.fn(),
  save: jest.fn(),
};

const jwtServiceMock = {
  sign: jest.fn().mockReturnValue('token'),
};

describe('UserService', () => {
  let service: UserService;
  let model: Model<User>;

  beforeEach(async () => {
    const mockModel = {
      find: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      }),
      create: jest.fn().mockImplementation((dto) => ({
        _doc: {
          ...dto,
          _id: 'mockId',
        },
        save: jest.fn().mockResolvedValue(true),
      })),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        UserService,
        { provide: JwtService, useValue: jwtServiceMock },
        {
          provide: getModelToken(User.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    model = module.get<Model<User>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should throw BadRequestException for invalid email', async () => {
      const dto = { email: 'invalid-email', password: 'password' };
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });

    it('should return BadRequestException for existing user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      (model.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      await expect(service.register(createUserDto)).rejects.toThrow(
        `User with email ${createUserDto.email} already exists`,
      );
    });

    it('should create and return new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password',
      };

      (model.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.register(createUserDto);

      expect(result).toEqual({
        email: createUserDto.email,
      });
    });
  });

  describe('login', () => {
    it('should return BadRequestException for invalid email', async () => {
      const dto = { email: 'invalid-email', password: 'password' };

      (model.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([]),
      });

      await expect(service.register(dto)).rejects.toThrow(
        new BadRequestException('Invalid email'),
      );
    });

    it('should return BadRequestException for invalid password', async () => {
      const dto = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      const mockUser = {
        _id: 'mockId',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      (model.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([mockUser]),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(false);

      const promise = service.login(dto);

      await expect(promise).rejects.toThrow(BadRequestException);
      await expect(promise).rejects.toThrow('Invalid password');
    });

    it('should return token for valid credentials', async () => {
      const dto = { email: 'test@example.com', password: 'password' };

      const user = {
        _id: 'mockId',
        email: 'test@example.com',
        password: 'hashedPassword',
      };

      (model.find as jest.Mock).mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([user]),
      });

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login(dto);

      expect(result).toEqual({ token: 'token' });
    });
  });
});
