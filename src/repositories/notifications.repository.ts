import { notifications,INotificationModel } from "../models";
import { INotification } from "../interfaces";

export class Notifications {
   static getById(id: number): Promise<INotificationModel | null> {
      return notifications.findByPk(id);
   }
   static getByUserId(userId: number): Promise<INotificationModel[]> {
      return notifications.findAll({ where: { userId: userId } });
   }
   static getByUnread(unread: boolean): Promise<INotificationModel[]> {
      return notifications.findAll({ where: { unread: unread } });
   }
   static getAll(): Promise<INotificationModel[]> {
      return notifications.findAll();
   }
   static create(notification: INotification): Promise<INotificationModel> {
      return notifications.create(notification);
   }
   static delete(id: number): Promise<Number> {
      return notifications.destroy({ where: { id: id } });
   }
}






