import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// @Injectable()
// export class ForbiddenGuard implements CanActivate {
//   constructor(
//     @Inject(IBlogsRepository)
//     protected blogsRepository: PgQueryBlogsRepositop,
//   ) {}
//
//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest();
//
//     let blogId = req.params.id;
//     if (req.body.blogId) {
//       blogId = req.body.blogId;
//     } else if (req.params.blogId) {
//       blogId = req.params.blogId;
//     }
//
//     const blog = await this.blogsRepository.getBlogById(blogId);
//
//     if (!blog) {
//       throw new NotFoundException();
//     }
//
//     if (blog.userId !== req.user.id) {
//       throw new ForbiddenException();
//     }
//
//     return true;
//   }
// }
