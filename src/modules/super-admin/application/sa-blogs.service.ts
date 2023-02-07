import { Injectable } from '@nestjs/common';
import { BindBlogDto } from '../api/dto/bind-blog.dto';
import { PgBlogsRepository } from '../../public/blogs/infrastructure/pg-blogs.repository';
import { PgBanInfoRepository } from '../infrastructure/pg-ban-info.repository';
import { PgPostsRepository } from '../../public/posts/infrastructure/pg-posts.repository';
import { PgQueryBlogsRepository } from '../../public/blogs/infrastructure/pg-query-blogs.repository';

@Injectable()
export class SaBlogsService {
  constructor(
    protected banInfoRepository: PgBanInfoRepository,
    protected queryBlogsRepository: PgQueryBlogsRepository,
    protected blogsRepository: PgBlogsRepository,
  ) {}

  async updateBlogBanStatus(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean | null> {
    const blogBanned = await this.queryBlogsRepository.blogBanned(blogId);

    if (blogBanned === null) {
      return null;
    }

    if (blogBanned === isBanned) {
      return true;
    }
    if (!blogBanned) {

      const banDate = new Date().toISOString();
      return await this.banInfoRepository.createBlogBanStatus(blogId, banDate);
    }

    return await this.banInfoRepository.deleteBlogBanStatus(blogId);
  }

  async bindBlog(params: BindBlogDto) {
    return this.blogsRepository.bindBlog(params);
  }
}
