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

@Controller('blogs')
export class BlogsController {
  constructor(
    protected blogsService: BlogsService,
    protected postsService: PostsService,
  ) {}

  @Get()
  getBlogs(
    @Query()
    query: QueryParametersDto,
  ) {
    return this.blogsService.getBlogs(query);
  }

  @Get(':id')
  async getBlogById(@Param('id') blogId: string) {
    const blog = await this.blogsService.getBlogById(blogId);

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
    console.log(query);
    const post = await this.blogsService.getBlogById(blogId);

    if (!post) {
      throw new NotFoundException();
    }

    return this.postsService.getPosts(query, blogId, req.headers.authorization);
  }
}
