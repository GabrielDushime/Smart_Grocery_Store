import { IsEmail, IsOptional, IsString, MinLength, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @ApiPropertyOptional({ example: 'user@example.com' })
  email?: string;


  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Jane Doe' })
  fullName?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'admin' })
  role?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: '+250123456789' })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({ example: 'Kigali, Rwanda' })
  address?: string;

  @IsBoolean()
  @IsOptional()
  @ApiPropertyOptional({ example: false })
  isAdmin?: boolean;
}
