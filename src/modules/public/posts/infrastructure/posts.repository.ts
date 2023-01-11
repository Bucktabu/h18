import { Injectable } from '@nestjs/common';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import { PostDBModel } from './entity/post-db.model';
import { PostDocument, Post } from './entity/posts.scheme';
import { giveSkipNumber } from '../../../../helper.functions';
import { IPostsRepository } from './posts-repository.interface';
import { PostDto } from '../../../blogger/api/dto/post.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostsRepository implements IPostsRepository {
  constructor(
    @InjectModel(Post.name) private postsRepository: Model<PostDocument>,
  ) {}

  async getPosts(
    query: QueryParametersDto,
    blogId: string | undefined,
  ): Promise<PostDBModel[]> {
    return this.postsRepository
      .find(
        {
          $and: [{ blogId: { $regex: blogId } }, { isBanned: false }],
        },
        { _id: false, __v: false },
      )
      .sort({ [query.sortBy]: query.sortDirection === 'asc' ? 1 : -1 })
      .skip(giveSkipNumber(query.pageNumber, query.pageSize))
      .limit(query.pageSize)
      .lean();
  }

  async getTotalCount(blogId: string | undefined): Promise<number> {
    return this.postsRepository.countDocuments({
      $and: [{ blogId: { $regex: blogId } }, { isBanned: false }],
    });
  }

  async getPostById(id: string): Promise<PostDBModel | null> {
    return this.postsRepository.findOne(
      {
        $and: [{ id }, { isBanned: false }],
      },
      { _id: false, __v: false },
    );
  }

  async createPost(newPost: PostDBModel): Promise<PostDBModel | null> {
    try {
      await this.postsRepository.create(newPost);
      return newPost;
    } catch (e) {
      return null;
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
