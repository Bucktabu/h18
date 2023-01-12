import { Injectable } from '@nestjs/common';
import { toBlogViewModel } from '../../../../data-mapper/to-blog-view.model';
import { BlogViewModel } from '../api/dto/blogView.model';
import {PgQueryBlogsRepository} from "../infrastructure/pg-query-blogs.repository";
import {BlogDto} from "../../../blogger/api/dto/blog.dto";
import {BlogDBModel} from "../infrastructure/entity/blog-db.model";
import { v4 as uuidv4 } from 'uuid';
import {PgBlogsRepository} from "../infrastructure/pg-blogs.repository";

@Injectable()
export class BlogsService {
  constructor(
    protected blogsRepository: PgBlogsRepository,
  ) {}

  async createBlog(
      userId: string,
      inputModel: BlogDto,
  ): Promise<BlogViewModel | null> {
    const newBlog = new BlogDBModel(
        uuidv4(),
        inputModel.name,
        inputModel.description,
        inputModel.websiteUrl,
        new Date().toISOString(),
        false,
        userId
    );

    const createdBlog = await this.blogsRepository.createBlog(newBlog);

    if (!createdBlog) {
      return null;
    }

    return toBlogViewModel(createdBlog);
  }
}
