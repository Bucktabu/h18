import { Injectable } from '@nestjs/common';
import { PostDBModel } from './entity/post-db.model';
import { PostDto } from '../../../blogger/api/dto/post.dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostViewModel } from '../api/dto/postsView.model';

@Injectable()
export class PgPostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(newPost: PostDBModel): Promise<PostViewModel> {
    const query = `
      INSERT INTO public.posts
             (id, title, short_description, content, created_at, "blogId")
      VAlUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING (id, title, short_description, content, created_at, "blogId")                
    `;
    const result = await this.dataSource.query(query, [
      newPost.id,
      newPost.title,
      newPost.shortDescription,
      newPost.content,
      newPost.createdAt,
      newPost.blogId,
    ]);

    const postArr = result[0].row.slice(1, -1).split(',');

    return {
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
    };
  }

  async updatePost(postId: string, dto: PostDto): Promise<boolean> {
    const query = `
      UPDATE public.posts
         SET title = $1, shortDescription = $2, content = $3
       WHERE id = $4  
    `;
    const result = await this.dataSource.query(query, [
      dto.title,
      dto.shortDescription,
      dto.content,
      postId,
    ]);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }

  async deletePost(postId: string): Promise<boolean> {
    const query = `
      DELETE FROM public.posts
       WHERE id = $1;
    `;
    const result = await this.dataSource.query(query, [postId]);

    if (result[1] !== 1) {
      return false;
    }
    return true;
  }
}
