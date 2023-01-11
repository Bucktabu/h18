import {Injectable} from "@nestjs/common";
import {PostDto} from "../api/dto/post.dto";

@Injectable()
export class BloggerPostsService {
    constructor() {
    }

    async createPost(dto: PostDto, userId: string,) {

    }

    async updatePost(postId: string, dto: PostDto): Promise<boolean> {
        //return await this.postsRepository.updatePost(postId, dto);
        return true
    }

    async deletePost(postId: string): Promise<boolean> {
        //return await this.postsRepository.deletePost(postId);
        return true
    }
}