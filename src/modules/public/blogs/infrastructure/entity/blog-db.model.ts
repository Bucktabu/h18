export class BlogDBModel {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public websiteUrl: string,
    public createdAt: string,
    public userId: string,
  ) {}
}

export class dbBlogWithAdditionalInfo {
  id: string
  name: string
  description: string
  websiteUrl: string
  createdAt: string
  userId: string
  userLogin: string
  isBanned: boolean
  banDate: string
}