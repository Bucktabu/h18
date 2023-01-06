import { Inject, Injectable } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { settings } from '../../../../settings';
import { InjectRepository } from "@nestjs/typeorm";
import { PgJwtRepository } from "../infrastructure/pg-jwt.repository";
import { JwtEntity } from "../infrastructure/entity/jwt.entity";

@Injectable()
export class JwtService {
  constructor(
    protected jwtRepository: PgJwtRepository,
  ) {}

  async getTokenPayload(token: string) {
    try {
      const result: any = await jwt.verify(token, settings.JWT_SECRET);
      return result;
    } catch (error) {
      return null;
    }
  }

  async checkTokenInBlackList(refreshToken: string) {
    return await this.jwtRepository.getToken(refreshToken);
  }

  async addTokenInBlackList(refreshToken: string) {
    return await this.jwtRepository.addTokenInBlackList(refreshToken);
  }

  async createJWT(userId: string, deviceId: string, timeToExpired: number) {
    return jwt.sign({ userId, deviceId }, settings.JWT_SECRET, {
      expiresIn: `${timeToExpired}s`,
    });
  }

  async createToken(userId: string, deviceId: string) {
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
