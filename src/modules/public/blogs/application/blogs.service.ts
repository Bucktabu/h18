import { Inject, Injectable } from '@nestjs/common';
import { QueryParametersDto } from '../../../../global-model/query-parameters.dto';
import { ContentPageModel } from '../../../../global-model/contentPage.model';
import { paginationContentPage } from '../../../../helper.functions';
import { toBlogViewModel } from '../../../../data-mapper/to-blog-view.model';
import { BlogViewModel } from '../api/dto/blogView.model';
import { IBlogsRepository } from '../infrastructure/blogs-repository.interface';

@Injectable()
export class BlogsService {
  constructor(
    @Inject(IBlogsRepository) protected blogsRepository: IBlogsRepository,
  ) {}

  async getBlogs(query: QueryParametersDto): Promise<ContentPageModel | null> {
    const blogs = await this.blogsRepository.getBlogs(query);

    if (!blogs) {
      return null;
    }

    const totalCount = await this.blogsRepository.getTotalCount(
      query.searchNameTerm,
    );

    return paginationContentPage(
      query.pageNumber,
      query.pageSize,
      blogs,
      totalCount,
    );
  }

  async getBlogById(blogId: string): Promise<BlogViewModel | null> {
    const blog = await this.blogsRepository.getBlogById(blogId);

    if (!blog) {
      return null;
    }

    return toBlogViewModel(blog);
  }
}
