// import { ExecutionContext, Inject, PipeTransform } from '@nestjs/common';
// import { IBlogsRepository } from '../modules/public/blogs/infrastructure/blogs-repository.interface';
//
// export class NotOwnedBlogValidation implements PipeTransform {
//   constructor(
//     @Inject(IBlogsRepository) protected saBlogRepository: IBlogsRepository,
//   ) {}
//
//   async transform(context: ExecutionContext, metadata) {
//     const req = context.switchToHttp().getRequest();
//
//     const blog = await this.saBlogRepository.getBlogById(req.params.id);
//
//     if (blog.userId !== null) {
//       return false;
//     }
//
//     return true;
//   }
// }
