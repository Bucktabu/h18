import { DbCommentModel } from '../modules/public/comments/infrastructure/entity/db_comment.model';
import {
  CommentViewModel,
  CommentWithAdditionalInfo,
} from '../modules/public/comments/api/dto/commentView.model';

export const toCommentsViewModel = (
  comment: DbCommentModel,
): CommentWithAdditionalInfo => {
  let myStatus = comment.myStatus;
  if (!comment.myStatus) {
    myStatus = 'None';
  }

  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    likesInfo: {
      likesCount: comment.likesCount,
      dislikesCount: comment.dislikesCount,
      muStatus: myStatus,
    },
    commentatorInfo: comment.commentatorInfo,
    postInfo: comment.postInfo,
  };
};
