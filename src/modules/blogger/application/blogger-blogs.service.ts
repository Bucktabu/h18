import { Injectable } from '@nestjs/common';
import { BlogDto } from '../api/dto/blog.dto';
import { BanUserDto } from '../api/dto/ban-user.dto';
import { PgUsersRepository } from '../../super-admin/infrastructure/pg-users.repository';
import { PgQueryUsersRepository } from '../../super-admin/infrastructure/pg-query-users.repository';
import { PgBanInfoRepository } from '../../super-admin/infrastructure/pg-ban-info.repository';
import { PgBlogsRepository } from '../../public/blogs/infrastructure/pg-blogs.repository';

@Injectable()
export class BloggerBlogService {
  constructor(
    protected banInfoRepository: PgBanInfoRepository,
    protected queryUserRepository: PgQueryUsersRepository,
  ) {}
  async updateUserBanStatus(
    userId: string,
    dto: BanUserDto,
  ): Promise<boolean | null> {
    const user = await this.queryUserRepository.getUserById(userId);

    if (!user) {
      return null;
    }

    const youBanned = await this.banInfoRepository.youBanned(
      userId,
      dto.blogId,
    ); // TODO можно объединить эти два запроса, НО в случае если я селекчу несучествующую строчку в таблице мне вернет undefined или 500?

    if (youBanned === dto.isBanned) {
      return true;
    }
    if (!youBanned) {
      const banDate = new Date().toISOString();
      return await this.banInfoRepository.createUserBanForBlogStatus(
        userId,
        dto.blogId,
        dto.banReason,
        banDate,
      );
    }
    return await this.banInfoRepository.deleteUserBanForBlogStatus(
      userId,
      dto.blogId,
    );
  }
}
