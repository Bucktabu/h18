import { Injectable } from "@nestjs/common";
import { QueryParametersDto } from "../../../global-model/query-parameters.dto";
import { ContentPageModel } from "../../../global-model/contentPage.model";

@Injectable()
export class BloggerBlogService {
  // async getBannedUsers(
  //   blogId: string,
  //   query: QueryParametersDto,
  // ): Promise<ContentPageModel | null> {
  //   const banInfo = await this.banInfoRepository.getBannedUsers(blogId, query);
  //
  //   if (!banInfo) {
  //     return null;
  //   }
  //
  //   const totalCount = await this.banInfoRepository.getTotalCount(
  //     blogId,
  //     query,
  //   );
  //   const viewBanInfo = await Promise.all(
  //     banInfo.map(async (b) => await this.viewBanInfo(b)),
  //   );
  //
  //   return paginationContentPage(
  //     query.pageNumber,
  //     query.pageSize,
  //     viewBanInfo,
  //     totalCount,
  //   );
  // }
}