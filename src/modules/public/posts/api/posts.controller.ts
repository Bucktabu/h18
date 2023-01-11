import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentsService } from '../../comments/application/comments.service';
import { PostsService } from '../application/posts.service';
import { CommentDTO } from '../../comments/api/dto/commentDTO';
import { Request } from 'express';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import { AuthBearerGuard } from '../../../../guards/auth.bearer.guard';
import { User } from '../../../../decorator/user.decorator';
import { UserDBModel } from '../../../super-admin/infrastructure/entity/userDB.model';
import { ReactionDto } from '../../../../global-model/reaction.dto';

@Controller('posts')
export class PostsController {
  constructor(
    protected commentsService: CommentsService,
    protected postsService: PostsService,
  ) {}

  @Get()
  getPosts(@Query() query: QueryParametersDto, @Req() req: Request) {
    const blogId = '';
    return this.postsService.getPosts(query, blogId, req.headers.authorization);
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string, @Req() req: Request) {
    const post = await this.postsService.getPostById(
      postId,
      req.headers.authorization,
    );

    if (!post) {
      throw new NotFoundException();
    }

    return post;
  }

  @Get(':id/comments')
  async getCommentsByPostId(
    @Query() query: QueryParametersDto,
    @Param('id') postId: string,
    @Req() req: Request,
  ) {
    const comment = await this.commentsService.getComments(
      postId,
      query,
      req.headers.authorization,
    );

    if (!comment) {
      throw new NotFoundException();
    }

    return comment;
  }

  @Post('/:id/comments')
  @HttpCode(201)
  @UseGuards(AuthBearerGuard)
  async createComment(
    @Body() dto: CommentDTO,
    @Param('id') postId: string,
    @User() user: UserDBModel,
  ) {
    const post = await this.postsService.getPostById(postId);

    if (!post) {
      throw new NotFoundException();
    }

    const banStatus = await this.postsService.checkBanStatus(user.id, postId);

    if (banStatus) {
      throw new ForbiddenException();
    }

    return this.commentsService.createComment(postId, dto.content, user);
  }

  @Put(':id/like-status')
  @HttpCode(204)
  @UseGuards(AuthBearerGuard)
  async updateLikeStatus(
    @Body() dto: ReactionDto,
    @Param('id') commentId: string,
    @User() user: UserDBModel,
  ) {
    const post = await this.postsService.getPostById(commentId);

    if (!post) {
      throw new NotFoundException();
    }

    await this.postsService.updateLikesInfo(user.id, commentId, dto.likeStatus);

    return;
  }
}
