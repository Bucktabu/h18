import { IsBoolean, IsString, IsUUID, MinLength } from "class-validator";

export class BanUserDto {
  @IsString()
  @IsUUID() // TODO не отрабатывает
  blogId: string;

  @IsString()
  @MinLength(20)
  banReason: string;

  @IsBoolean()
  isBanned: boolean;
}
