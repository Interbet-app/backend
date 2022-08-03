import { notifications } from "../models";
import { INotification } from "../interfaces";

export class Notifications {
   static async ById(id: number) {
      return await notifications.findByPk(id) as INotification;
   }
   static async ByUserId(userId: number) {
      return await notifications.findAll({ where: { userId: userId } }) as INotification[];
   }
   static async ByUnread(unread: boolean) {
      return await notifications.findAll({ where: { unread: unread } }) as INotification[];
   }
   static async All() {
      return await notifications.findAll() as INotification[];
   }
   static async Create(notification: INotification){
      return await notifications.create(notification) as INotification;
   }
   static async Destroy(id: number){
      return await notifications.destroy({ where: { id: id } });
   }
}






