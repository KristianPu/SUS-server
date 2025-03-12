import { IsEnum, IsNumber, IsString, validateSync } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export enum Environment {
  DEVELOPMENT = 'dev',
  TEST = 'test',
  PRODUCTION = 'prod',
}

export class EnvironmentVariables {
  @IsNumber()
  PORT: number;

  @IsString()
  HOST: string;

  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  BASE_URL: string;

  @IsString()
  MONGODB_URI: string;

  @IsString()
  JWT_SECRET: string;

  @IsNumber()
  JWT_EXPIRATION: number;

  @IsNumber()
  SALT: number;

  @IsString()
  LOG_LEVEL: string;

  @IsString()
  EXCLUDE_PROPERTIES: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
}
