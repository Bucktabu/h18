import {Injectable} from "@nestjs/common";
import {BindBlogDto} from "../api/dto/bind-blog.dto";
import {PgBlogsRepository} from "../../public/blogs/infrastructure/pg-blogs.repository";
import {PgBanInfoRepository} from "../infrastructure/pg-ban-info.repository";
import {PgPostsRepository} from "../../public/posts/infrastructure/pg-posts-repository.service";
import {PgQueryBlogsRepository} from "../../public/blogs/infrastructure/pg-query-blogs.repository";

@Injectable()
export class SaBlogsService {
    constructor(
        protected banInfoRepository: PgBanInfoRepository,
        protected queryBlogsRepository: PgQueryBlogsRepository,
        protected blogsRepository: PgBlogsRepository) {
    }

    async updateBlogBanStatus(
        blogId: string,
        isBanned: boolean,
    ): Promise<boolean | null> {
        const blog = await this.queryBlogsRepository.getBloggerId(blogId)

        if (!blog) {
            return null
        } // TODO можно объединить эти два запроса, НО в случае если я селекчу несучествующую строчку в таблице мне вернет undefined или 500?

        const blogBanned = await this.banInfoRepository.blogBanned(blogId)

        if (blogBanned === isBanned) {
            return true
        }
        if (!blogBanned) {
            const banDate = new Date().toISOString();
            return await this.banInfoRepository.createBlogBanStatus(blogId, banDate);
        }
        return await this.banInfoRepository.deleteBlogBanStatus(blogId)
    }

    async bindBlog(params: BindBlogDto) {
        return this.blogsRepository.bindBlog(params);
    }
}