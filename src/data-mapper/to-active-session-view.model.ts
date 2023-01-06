import { UserDeviceModel } from "../modules/public/security/infrastructure/entity/userDevice.model";
import { ViewSecurityDeviseModel } from "../modules/public/security/infrastructure/entity/viewSecurityDeviseModel";

export const toActiveSessionsViewModel = (device: UserDeviceModel): ViewSecurityDeviseModel => {
  return {
    deviceId: device.deviceId,
    title: device.deviceTitle,
    ip: device.ipAddress,
    lastActiveDate: new Date(Number(device.iat)).toISOString(),
  };
};
