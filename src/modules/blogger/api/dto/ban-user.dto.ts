import { IsBoolean, IsString, MinLength } from 'class-validator';

export class BanUserDto {
  @IsString()
  blogId: string;

  @IsString()
  @MinLength(20)
  banReason: string;

  @IsBoolean()
  isBanned: boolean;
}
