import { BlogViewModel } from "../../src/modules/public/blogs/api/dto/blogView.model";

export const getPostsByBlogId = (num: number, count: number, blog: BlogViewModel) => {
  return {
    id: expect.any(String),
    title: `PostName${num}`,
    shortDescription: `SomeOneShortDescription${num}`,
    content: `SomeOneContent${count - num + 1}`,
    blogId: blog.id,
    blogName: blog.name,
    createdAt: blog.createdAt,
    extendedLikesInfo: {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: "None",
      newestLikes: [
        // {
        //     "addedAt": "2023-01-23T07:56:46.794Z",
        //     "userId": "string",
        //     "login": "string"
        // }
      ]
    }
  }
}
