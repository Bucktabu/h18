import { Injectable } from '@nestjs/common';
import { PostDBModel } from './entity/post-db.model';
import { PostDto } from '../../../blogger/api/dto/post.dto';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {PostViewModel} from "../api/dto/postsView.model";

@Injectable()
export class PgPostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(newPost: PostDBModel): Promise<PostViewModel> {
    const query = `
      INSERT INTO public.posts
             (id, title, short_description, content, created_at, is_banned, "blogId")
      VAlUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING (id, title, short_description, content, created_at, is_banned, "blogId")                
    `;
    const result = await this.dataSource.query(query, [
      newPost.id,
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.createdAt,
      newPost.isBanned,
      newPost.blogId
    ]);

    const postArr = result[0].row.slice(1, -1).split(',');

    return  {
      id: postArr[0],
      title: postArr[1],
      shortDescription: postArr[2],
      content: postArr[3],
      blogId: postArr[6],
      createdAt: postArr[4],
      extendedLikesInfo: {
        myStatus: 'None',
        likesCount: 0,
        dislikesCount: 0,
        newestLikes: [],
      },
    }
  }

  async updatePost(postId: string, dto: PostDto): Promise<boolean> {
    const result = await this.postsRepository.updateOne(
      { id: postId },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
        },
      },
    );

    return result.matchedCount === 1;
  }

  async updatePostsBanStatus(
    blogId: string,
    isBanned: boolean,
  ): Promise<boolean> {
    try {
      await this.postsRepository.updateMany({ blogId }, { $set: { isBanned } });
      return true;
    } catch (e) {
      return false;
    }
  }

  async deletePost(postId: string): Promise<boolean> {
    const result = await this.postsRepository.deleteOne({ id: postId });

    return result.deletedCount === 1;
  }
}
