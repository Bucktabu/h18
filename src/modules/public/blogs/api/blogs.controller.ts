import {
  Controller,
  Get,
  NotFoundException,
  Param,
  Query,
  Req,
} from '@nestjs/common';
import { BlogsService } from '../application/blogs.service';
import { PostsService } from '../../posts/application/posts.service';
import { Request } from 'express';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import {PgQueryBlogsRepository} from "../infrastructure/pg-query-blogs.repository";
import {PgQueryPostsRepository} from "../../posts/infrastructure/pg-query-posts.repository";

@Controller('blogs')
export class BlogsController {
  constructor(
    protected queryBlogsRepository: PgQueryBlogsRepository,
    protected queryPostsRepository: PgQueryPostsRepository
  ) {}

  @Get()
  getBlogs(
    @Query()
    query: QueryParametersDto,
  ) {
    return this.queryBlogsRepository.getBlogs(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string) {
    const blog = await this.queryBlogsRepository.getBloggerId(blogId);

    if (!blog) {
      throw new NotFoundException();
    }

    return blog;
  }

  @Get(':id/posts')
  async getPostsByBlogId(
    @Query() query: QueryParametersDto,
    @Param('id') blogId: string,
    @Req() req: Request,
  ) {
    const post = await this.queryBlogsRepository.getBloggerId(blogId);

    if (!post) {
      throw new NotFoundException();
    }

    return this.queryPostsRepository.getPosts(query, blogId, req.headers.authorization);
  }
}
