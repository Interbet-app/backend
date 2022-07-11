import { notifications } from "../models";
import { INotification } from "../interfaces";

export class Notifications {
   static getById(id: number): Promise<INotification | null> {
      return notifications.findByPk(id);
   }
   static getByUserId(userId: number): Promise<INotification[]> {
      return notifications.findAll({ where: { userId: userId } });
   }
   static getByUnread(unread: boolean): Promise<INotification[]> {
      return notifications.findAll({ where: { unread: unread } });
   }
   static getAll(): Promise<INotification[]> {
      return notifications.findAll();
   }
   static create(notification: INotification): Promise<INotification> {
      return notifications.create(notification);
   }
   static update(notification: INotification): Promise<[number]> {
      return notifications.update(notification, { where: { id: notification.id } });
   }
   static delete(id: number): Promise<Number> {
      return notifications.destroy({ where: { id: id } });
   }
}

