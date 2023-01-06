import { Inject, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { settings } from '../../../../settings';
import { InjectRepository } from '@nestjs/typeorm';
import { PgJwtRepository } from '../infrastructure/pg-jwt.repository';
import { TokenBlackList } from '../infrastructure/entity/tokenBlackList';

@Injectable()
export class JwtService {
  constructor(protected jwtRepository: PgJwtRepository) {}

  async getTokenPayload(token: string) {
    try {
      const result: any = await jwt.verify(token, settings.JWT_SECRET);
      return result;
    } catch (error) {
      return null;
    }
  }

  async checkTokenInBlackList(refreshToken: string): Promise<boolean> {
    const token = await this.jwtRepository.getToken(refreshToken);
    if (!token) {
      return false;
    }
    return true;
  }

  async addTokenInBlackList(refreshToken: string): Promise<boolean> {
    return await this.jwtRepository.addTokenInBlackList(refreshToken);
  }

  async createJWT(
    userId: string,
    deviceId: string,
    timeToExpired: number,
  ): Promise<string> {
    return jwt.sign({ userId, deviceId }, settings.JWT_SECRET, {
      expiresIn: `${timeToExpired}s`,
    });
  }

  async createToken(
    userId: string,
    deviceId: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = await this.createJWT(
      userId,
      deviceId,
      Number(settings.timeLife.ACCESS_TOKEN),
    );
    const refreshToken = await this.createJWT(
      userId,
      deviceId,
      Number(settings.timeLife.REFRESH_TOKEN),
    );

    return { accessToken, refreshToken };
  }
}
