import {Injectable} from "@nestjs/common";
import {BindBlogDto} from "../api/dto/bind-blog.dto";

@Injectable()
export class SaBlogsService {
    constructor() {
    }

    async updateBlogBanStatus(
        blogId: string,
        isBanned: boolean,
    ): Promise<boolean> {
        // const banDate = new Date();
        // await this.postsRepository.updatePostsBanStatus(blogId, isBanned);
        // await this.banInfoRepository.saUpdateBanStatus(blogId, isBanned, banDate);
        // return this.blogsRepository.updateBanStatus(blogId, isBanned);
        return true
    }

    async bindBlog(params: BindBlogDto) {
        //return this.blogsRepository.bindBlog(params);
    }
}