import { ViewBanInfoModel } from '../modules/super-admin/api/dto/view-ban-info.model';
import { UserViewModel } from '../modules/super-admin/api/dto/user.view.model';

export class ContentPageModel {
  constructor(
    public pagesCount: number,
    public page: number,
    public pageSize: number,
    public totalCount: number,
    public items: //| BlogViewModel[]
    //| BlogViewWithOwnerAndBanInfo[]
    //| CommentWithAdditionalInfoModel[]
    //| PostViewModel[]
    | UserViewModel[]
      //| CommentViewModel[]
      | ViewBanInfoModel[],
  ) {}
}
