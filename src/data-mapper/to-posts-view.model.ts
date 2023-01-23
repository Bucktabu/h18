import { PostViewModel } from '../modules/public/posts/api/dto/postsView.model';
import { DbPostModel } from '../modules/public/posts/infrastructure/entity/db-post.model';

export const toPostsViewModel = (post: DbPostModel): PostViewModel => {
  let myStatus = post.myStatus;
  if (!post.myStatus) {
    myStatus = 'None';
  }

  return {
    id: post.id,
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    createdAt: post.createdAt,
    extendedLikesInfo: {
      likesCount: post.likesCount,
      dislikesCount: post.dislikesCount,
      myStatus: myStatus,
      newestLikes: post.newestLikes,
    },
  };
};
