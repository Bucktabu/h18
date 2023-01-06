import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ViewSecurityDeviseModel } from '../api/dto/viewSecurityDeviseModel';
import { UserDeviceModel } from './entity/userDevice.model';

@Injectable()
export class PgQuerySecurityRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAllActiveSessions(userId: string): Promise<UserDeviceModel[]> {
    const query = `
      SELECT user_id as "userId", device_id as "deviceId", device_title as "deviceTitle", ip_address as "ipAddress", iat, exp
        FROM public.security
       WHERE user_id = $1;
    `;
    try {
      const result = await this.dataSource.query(query, [userId]);
      return result;
    } catch (e) {
      return null;
    }
  }

  async getDeviseById(deviceId: string): Promise<UserDeviceModel | null> {
    const query = `
      SELECT user_id as "userId", device_id as "deviceId", device_title as "deviceTitle", ip_address as "ipAddress", iat, exp
        FROM public.security
       WHERE device_id = $1;
    `;
    try {
      const result = await this.dataSource.query(query, [deviceId]);
      return result[0];
    } catch (e) {
      return null;
    }
  }
}
