export class BlogViewWithOwnerAndBanInfo {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public blogOwnerInfo: {
      userId: string;
      userLogin: string;
    },
    public banInfo: {
      isBanned: boolean;
      banDate: Date;
    },
  ) {}
}
