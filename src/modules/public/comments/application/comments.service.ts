import { Inject, Injectable } from '@nestjs/common';
import { JwtService } from '../../auth/application/jwt.service';
import { LikesService } from '../../likes/application/likes.service';
import { CommentsRepository } from '../infrastructure/comments.repository';
import { PgLikesRepository } from '../../likes/infrastructure/pg-likes.repository';
import { CommentBDModel } from '../infrastructure/entity/commentDB.model';
import { CommentViewModel } from '../api/dto/commentView.model';
import { v4 as uuidv4 } from 'uuid';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import { ContentPageModel } from '../../../../global-model/contentPage.model';
import { paginationContentPage } from '../../../../helper.functions';
import { UserDBModel } from '../../../super-admin/infrastructure/entity/userDB.model';
import { toCommentOutputBeforeCreate } from '../../../../data-mapper/to-comment-view-before-create.model';
import { ICommentsRepository } from '../infrastructure/comments-repository.interface';
import { ILikesRepository } from '../../likes/infrastructure/likes-repository.interface';
import { IBanInfo } from '../../../super-admin/infrastructure/ban-info/ban-info.interface';
import { IPostsRepository } from '../../posts/infrastructure/posts-repository.interface';
import { IBlogsRepository } from '../../blogs/infrastructure/blogs-repository.interface';

@Injectable()
export class CommentsService {
  constructor(
    protected likesService: LikesService,
    protected jwtService: JwtService,
    @Inject(IBanInfo) protected banInfoRepository: IBanInfo,
    @Inject(IBlogsRepository) protected blogsRepository: IBlogsRepository,
    @Inject(ICommentsRepository)
    protected commentsRepository: ICommentsRepository,
    @Inject(ILikesRepository) protected likesRepository: ILikesRepository,
    @Inject(IPostsRepository) protected postsRepository: IPostsRepository,
  ) {}

  async getComments(
    postId: string,
    query: QueryParametersDto,
    token?: string,
  ): Promise<ContentPageModel | null> {
    const commentsDB = await this.commentsRepository.getComments(query, postId);

    if (!commentsDB.length) {
      return null;
    }

    const totalCount = await this.commentsRepository.getTotalCount(postId);
    const userId = await this.jwtService.getUserIdViaToken(token);
    const comments = await Promise.all(
      commentsDB.map(async (c) => await this.addLikesInfoForComment(c, userId)),
    );

    return paginationContentPage(
      query.pageNumber,
      query.pageSize,
      comments,
      totalCount,
    );
  }

  async getCommentById(
    commentId: string,
    token?: string,
  ): Promise<CommentViewModel | null> {
    const comment = await this.commentsRepository.getCommentById(commentId);

    if (!comment) {
      return null;
    }

    const banInfo = await this.banInfoRepository.getBanInfo(comment.userId);

    if (banInfo.isBanned) {
      return null;
    }

    const userId = await this.jwtService.getUserIdViaToken(token);
    return await this.addLikesInfoForComment(comment, userId);
  }

  async createComment(
    postId: string,
    comment: string,
    user: UserDBModel,
  ): Promise<CommentViewModel | null> {
    const commentId = uuidv4();
    const post = await this.postsRepository.getPostById(postId);
    const blog = await this.blogsRepository.getBlogById(post.blogId);

    const newComment = new CommentBDModel(
      commentId,
      comment,
      user.id,
      user.login,
      new Date().toISOString(),
      blog.userId, // bloggerId
      postId,
    );

    try {
      await this.commentsRepository.createComment(newComment);
    } catch (e) {
      return null;
    }

    return toCommentOutputBeforeCreate(newComment);
  }

  async updateComment(commentId: string, comment: string): Promise<boolean> {
    return await this.commentsRepository.updateComment(commentId, comment);
  }

  async updateLikesInfo(
    userId: string,
    commentId: string,
    likeStatus: string,
  ): Promise<boolean> {
    const addedAt = new Date().toISOString();
    return await this.likesRepository.updateUserReaction(
      commentId,
      userId,
      likeStatus,
      addedAt,
    );
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    return await this.commentsRepository.deleteCommentById(commentId);
  }

  private async addLikesInfoForComment(
    comment: CommentBDModel,
    userId: string | null,
  ) {
    const result = await this.likesService.getReactionAndReactionCount(
      comment.id,
      userId,
    );

    return {
      id: comment.id,
      content: comment.content,
      userId: comment.userId,
      userLogin: comment.userLogin,
      createdAt: comment.createdAt,
      likesInfo: {
        myStatus: result.reaction,
        likesCount: result.likesCount,
        dislikesCount: result.dislikesCount,
      },
    };
  }
}
