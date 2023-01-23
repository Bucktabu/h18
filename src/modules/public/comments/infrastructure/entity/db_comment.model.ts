export class DbCommentModel {
  id: string;
  content: string;
  createdAt: string;
  likesCount: number;
  dislikesCount: number;
  commentatorInfo: {
    userId: string;
    userLogin: string;
  };
  postInfo: {
    id: string;
    title: string;
    blogId: string;
    blogName: string;
  };
  myStatus: string;
}
