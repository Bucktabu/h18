export class CommentViewModel {
  constructor(
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
    public likesInfo: {
      myStatus: string;
      likesCount: number;
      dislikesCount: number;
    },
  ) {}
}
