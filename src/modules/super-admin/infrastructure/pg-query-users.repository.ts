import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { QueryParametersDto } from '../../../global-model/query-parameters.dto';
import {
  giveSkipNumber,
  paginationContentPage,
} from '../../../helper.functions';
import { UserDBModel } from './entity/userDB.model';
import { BanStatusModel } from '../../../global-model/ban-status.model';
import { toUserViewModel } from '../../../data-mapper/to-create-user-view.model';
import { ContentPageModel } from '../../../global-model/contentPage.model';
import { SortParametersModel } from '../../../global-model/sort-parameters.model';
import {toBannedUsersModel} from "../../../data-mapper/to-banned-users.model";

@Injectable()
export class PgQueryUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUserByLoginOrEmail(
    loginOrEmail: string,
  ): Promise<UserDBModel | null> {
    const query = `
      SELECT id, login, email, password_hash as "passwordHash", password_salt as "passwordSalt", created_at as "createdAt"
        FROM public.users
       WHERE login = $1 OR email = $1
    `;
    const result = await this.dataSource.query(query, [loginOrEmail]);

    return result[0];
  }

  async getUserById(userId: string): Promise<UserDBModel | null> {
    const query = `
      SELECT id, login, email, password_hash as "passwordHash", password_salt as "passwordSalt", created_at as "createdAt"
        FROM public.users
       WHERE id = $1;
    `;

    const result = await this.dataSource.query(query, [userId]);

    return result[0];
  }

  async getBannedUsers(blogId: string, queryDto:QueryParametersDto): Promise<ContentPageModel> {
    const filter = this.userFilter(queryDto);

    const usersQuery = `
      SELECT b.ban_date as "banDate", b.ban_reason as "banReason",
             u.id, u.login
        FROM public.banned_users_for_blog b
        LEFT JOIN public.users u  
          ON b.userId = u.id
       WHERE ${filter}
       ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
       LIMIT $1 OFFSET ${giveSkipNumber(
         queryDto.pageNumber,
         queryDto.pageSize,
       )};
    `
    const bannedUsersDB = await this.dataSource.query(usersQuery, [
      queryDto.pageSize,
    ]);

    const bannedUsers = bannedUsersDB.map(u => toBannedUsersModel(u))

    const totalCountQuery = `
      SELECT COUNT(b.blogId)
        FROM public.banned_users_for_blog b
        LEFT JOIN public.users u  
          ON b.userId = u.id
       WHERE ${filter}
    `;
    const totalCount = await this.dataSource.query(totalCountQuery);

    return paginationContentPage(
        queryDto.pageNumber,
        queryDto.pageSize,
        bannedUsers,
        Number(totalCount[0].count),
    );
  }

  async getUsers(queryDto: QueryParametersDto): Promise<ContentPageModel> {
    const filter = this.getFilter(queryDto);

    const usersQuery = `
      SELECT u.id, u.login, u.email, u.created_at as "createdAt",
             b.ban_status as "isBanned", b.ban_date as "banDate", b.ban_reason as "banReason"
        FROM public.users u
        LEFT JOIN public.user_ban_info b
          ON u.id = b.user_id
       WHERE ${filter}
       ORDER BY "${queryDto.sortBy}" ${queryDto.sortDirection}
       LIMIT $1 OFFSET ${giveSkipNumber(
         queryDto.pageNumber,
         queryDto.pageSize,
       )};
    `;

    const usersDB = await this.dataSource.query(usersQuery, [
      queryDto.pageSize,
    ]);

    const users = usersDB.map((u) => toUserViewModel(u));

    const totalCountQuery = `
      SELECT COUNT(u.id)
        FROM public.users u
        LEFT JOIN public.user_ban_info b
          ON u.id = b.user_id
       WHERE ${filter}
    `;
    const totalCount = await this.dataSource.query(totalCountQuery);

    return paginationContentPage(
      queryDto.pageNumber,
      queryDto.pageSize,
      users,
      Number(totalCount[0].count),
    );
  }

  private getFilter(query: QueryParametersDto): string {
    const banFilter = this.banFilter(query);
    const userFilter = this.userFilter(query);

    if (banFilter && userFilter) {
      return `${banFilter} AND ${userFilter}`;
    }
    if (banFilter) return `${banFilter}`;
    if (userFilter) return `${userFilter}`;
    return '';
  }

  private banFilter(query: QueryParametersDto): string {
    const { banStatus } = query;
    if (banStatus === BanStatusModel.Banned) {
      return `b.ban_status = true`;
    }
    if (banStatus === BanStatusModel.NotBanned) {
      return `b.ban_status = false`;
    }
    return '';
  }

  private userFilter(query: QueryParametersDto): string {
    const { searchLoginTerm } = query;
    const { searchEmailTerm } = query;

    const login = `login ILIKE '%${searchLoginTerm}%'`;
    const email = `email ILIKE '%${searchEmailTerm}%'`;

    if (searchLoginTerm && searchEmailTerm) {
      return `${login} OR ${email}`;
    }
    if (login) return login;
    if (searchEmailTerm) return email;
    return '';
  }

  // private sortFilter(query: QueryParametersDto): string {
  //   const {sortBy} = query
  //
  //   if (sortBy === SortParametersModel.Login) {
  //     return `"${sortBy}" COLLATE "C"`
  //   }
  //   // if (sortBy === SortParametersModel.CreatedAt) {
  //   //   return `"${sortBy}" COLLATE "C"`
  //   // }
  //
  //   return `"${sortBy}"`
  // }
}
