export class BlogDBModel {
  constructor(
    public id: string,
    public userId: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public isBanned: boolean,
  ) {}
}
