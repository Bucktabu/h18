import { ExecutionContext, Inject, PipeTransform } from '@nestjs/common';
import {PgQueryBlogsRepository} from "../modules/public/blogs/infrastructure/pg-query-blogs.repository";

export class NotOwnedBlogValidation implements PipeTransform {
  constructor(
    protected blogRepository: PgQueryBlogsRepository,
  ) {}

  async transform(context: ExecutionContext, metadata) {
    const req = context.switchToHttp().getRequest();

    const blog = await this.blogRepository.getBlogById(req.params.id);

    if (blog.bloggerId !== null) {
      return false;
    }

    return true;
  }
}
