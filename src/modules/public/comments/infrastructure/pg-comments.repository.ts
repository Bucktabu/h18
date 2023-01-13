import { Injectable } from '@nestjs/common';
import { CommentBDModel } from './entity/commentDB.model';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import { giveSkipNumber } from '../../../../helper.functions';
import {InjectDataSource} from "@nestjs/typeorm";
import {DataSource} from "typeorm";
import {CommentViewModel} from "../api/dto/commentView.model";

@Injectable()
export class PgCommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {
  }

  async createComment(
    newComment: CommentBDModel,
  ): Promise<CommentViewModel | null> {
    const query = `
      INSERT INTO public.comments
             (id, content, created_at, "postId", "userId")
      VALUES ($1, $2, $3, $4, $5)
             RETURNING (id, content, userId, created_at AS "createdAt",
                        (SELECT login AS "userLogin"
                           FROM public.users
                          WHERE users.id = '${newComment.userId}'));       
    `
    const result = await this.dataSource.query(query, [
      newComment.id,
      newComment.content,
      newComment.createdAt,
      newComment.postId,
      newComment.userId,
    ]);

    try {
      const commentArr = result[0].row.slice(1, -1).split(',');

      return {
        id: commentArr[0],
        content: commentArr[1],
        userId: commentArr[2],
        userLogin: commentArr[4],
        createdAt: commentArr[3],
        likesInfo: {
          likesCount: 0,
          dislikesCount: 0,
          myStatus: 'None'
        }
      }
    } catch (e) {
      return null
    }
  }

  // async updateComment(commentId: string, comment: string): Promise<boolean> {
  //   const result = await this.commentsRepository.updateOne(
  //     { id: commentId },
  //     { $set: { content: comment } },
  //   );
  //
  //   return result.modifiedCount === 1;
  // }
  //
  // async deleteCommentById(commentId: string): Promise<boolean> {
  //   const result = await this.commentsRepository.deleteOne({ id: commentId });
  //
  //   return result.deletedCount === 1;
  // }
}
