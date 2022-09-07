export interface INotification {
   id?: number;
   userId: number;
   title: string;
   message: string;
   unread?: boolean;
   createdAt: Date;
   updatedAt: Date;
}
