import { Test, TestingModule } from '@nestjs/testing';

import { UserController } from '../user.controller';
import { UserService } from '../user.service';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    register: jest.fn((dto) => {
      return {
        createdAt: new Date(),
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      };
    }),
    login: jest.fn((dto) => {
      const token = 'token123';
      return {
        token,
      };
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [UserService],
    })
      .overrideProvider(UserService)
      .useValue(mockUserService)
      .compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user', async () => {
    expect(
      await controller.register({
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        password: 'password123',
      }),
    ).toEqual({
      createdAt: expect.any(Date),
      email: 'test@example.com',
      firstName: 'John',
      lastName: 'Doe',
    });
  });

  it('should login user', async () => {
    expect(
      await controller.login({
        email: 'test@example.com',
        password: 'password123',
      }),
    ).toEqual({
      token: expect.any(String),
    });
  });
});
