import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthBasicGuard } from '../../../guards/auth.basic.guard';
import { QueryParametersDto } from '../../../global-model/query-parameters.dto';
import { PgQueryBlogsRepository } from '../../public/blogs/infrastructure/pg-query-blogs.repository';
import { BanBlogDto } from './dto/ban-blog.dto';
import { SaBlogsService } from '../application/sa-blogs.service';
import { BindBlogDto } from './dto/bind-blog.dto';
import { ContentPageModel } from '../../../global-model/contentPage.model';

@UseGuards(AuthBasicGuard)
@Controller('sa/blogs')
export class SaBlogsController {
  constructor(
    protected queryBlogsRepository: PgQueryBlogsRepository,
    protected blogsService: SaBlogsService,
  ) {}

  @Get()
  getUsers(
    @Query()
    query: QueryParametersDto,
  ): Promise<ContentPageModel> {
    return this.queryBlogsRepository.saGetBlogs(query);
  }

  @Put(':id/ban')
  @HttpCode(204)
  updateBlogStatus(@Body() dto: BanBlogDto, @Param('id') blogId: string) {
    return this.blogsService.updateBlogBanStatus(blogId, dto.isBanned);
  }

  @Put(':id/bind-with-user/:userId')
  bindBlog(@Param() params: BindBlogDto) {
    return this.blogsService.bindBlog(params);
  }
}
