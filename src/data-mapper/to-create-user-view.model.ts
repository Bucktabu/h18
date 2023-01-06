import {
  CreatedUserModel,
  UserWithCountAndBanInfo,
} from '../modules/super-admin/infrastructure/entity/userDB.model';
import {BanInfoModel} from '../modules/super-admin/infrastructure/entity/banInfo.model';
import {UserViewModelWithBanInfo} from "../modules/super-admin/api/dto/userView.model";

export const toCreateUserViewModel = (
  user: CreatedUserModel,
  banInfo: BanInfoModel,
): UserViewModelWithBanInfo => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: new Date(user.createdAt).toISOString(),
    banInfo: {
      isBanned: banInfo.isBanned,
      banDate: banInfo.banDate,
      banReason: banInfo.banReason
  }}
};

export const toUserViewModel = (
    user: UserWithCountAndBanInfo
) => {
  return {
    id: user.id,
    login: user.login,
    email: user.email,
    createdAt: new Date(user.createdAt).toISOString(),
    banInfo: {
      isBanned: user.isBanned,
      banDate: user.banDate,
      banReason: user.banReason
    }
  }
}
