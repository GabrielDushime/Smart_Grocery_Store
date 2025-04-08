import { IsEmail, IsNotEmpty, MinLength, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({ example: 'user@example.com', description: 'The email of the user' })
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  @ApiProperty({ example: 'password123', description: 'The password of the user' })
  password: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ example: 'John Doe', description: 'The full name of the user' })
  fullName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: '+250123456789', description: 'The phone number of the user', required: false })
  phoneNumber?: string;
  
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'customer', description: 'The role of the user', default: 'customer' })
  role?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Kigali, Rwanda', description: 'The address of the user', required: false })
  address?: string;
}