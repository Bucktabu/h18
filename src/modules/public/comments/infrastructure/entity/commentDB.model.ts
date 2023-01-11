export class CommentBDModel {
  constructor(
    public id: string,
    public content: string,
    public userId: string,
    public userLogin: string,
    public createdAt: string,
    public bloggerId: string,
    public postId?: string, // TODO убрать ? знак
  ) {}
}
