import { Injectable } from '@nestjs/common';
import { BanInfoModel } from './entity/banInfo.model';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {BanUserDto} from "../../blogger/api/dto/ban-user.dto";

@Injectable()
export class PgBanInfoRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBanInfo(userId: string): Promise<BanInfoModel | null> {
    const query = `
      SELECT user_id as "userId", ban_status as "isBanned", ban_date as "banDate", ban_reason as "banReason"
        FROM public.user_ban_info
       WHERE user_id = $1;
    `;
    const result = await this.dataSource.query(query, [userId]);

    return result[0];
  }

  async youBanned(userId, blogId): Promise<boolean> {
    const query = `
      SELECT "blogId"
        FROM public.banned_users_for_blog
       WHERE "userId" = $1 AND "blogId" = $2
    `
    const result = await this.dataSource.query(query, [userId, blogId])

    if (!result.length) {
      return false
    }
    return true
  }

  async createBanInfo(banInfo: BanInfoModel): Promise<BanInfoModel> {
    const filter = this.getCreateFilter(banInfo);

    await this.dataSource.query(`
        INSERT INTO public.user_ban_info
               (user_id, ban_status, ban_reason, ban_date)
        VALUES (${filter})
    `);

    return banInfo;
  }

  async createBannedUserForBlog(userId: string, blogId: string, banReason: string, banDate: string): Promise<boolean> {
    const query = `
      INSERT INTO public.banned_users_for_blog
             ("blogId", "userId", ban_reason, ban_date)
      VALUES ($1, $2, $3, $4)   
              RETURNING ("blogId")
    `
    const result = await this.dataSource.query(query, [blogId, userId, banReason, banDate])

    if(!result.length) {
      return false
    }
    return true
  }

  async saUpdateBanStatus(
    userId: string,
    banStatus: boolean,
    banReason: string | null,
    banDate: Date | null,
  ): Promise<boolean> {
    const filter = this.getUpdateFilter(banStatus, banReason, banDate);
    const result = await this.dataSource.query(`
       UPDATE public.user_ban_info
          SET ${filter}
        WHERE user_id = '${userId}';
    `);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async deleteBanInfoById(userId: string): Promise<boolean> {
    const query = `
      DELETE 
        FROM public.user_ban_info
       WHERE user_id = $1;
    `;

    const result = await this.dataSource.query(query, [userId]);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async deleteBannedUserForBlog(userId: string, blogId: string): Promise<boolean> {
    const query = `
      DELETE 
        FROM public.banned_users_for_blog
       WHERE "userId" = $1 AND "blogId" = $2;
    `;

    const result = await this.dataSource.query(query, [userId, blogId]);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  private getCreateFilter(banInfo: BanInfoModel): string {
    if (banInfo.banReason !== null) {
      return `'${banInfo.parentId}', '${banInfo.isBanned}', '${banInfo.banReason}', '${banInfo.banDate}'`;
    }
    return `'${banInfo.parentId}', '${banInfo.isBanned}', null, null, null`;
  }

  private getUpdateFilter(
    banStatus: boolean,
    banReason: string | null,
    banDate: Date | null,
  ): string {
    let filter = `ban_status = '${banStatus}', ban_date = null, ban_reason = null`;
    if (banReason !== null) {
      return (filter = `ban_status = '${banStatus}', ban_date = '${banDate}', ban_reason = '${banReason}'`);
    }
    return filter;
  }
}
