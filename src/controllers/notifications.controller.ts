import { Request, Response } from "express";
import { Notifications } from "../repositories";
import { Token } from "../types";
import { Jwt } from "../auth";
import AppError from "../error";

export async function UserNotifications(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const notifications = await Notifications.getByUserId(token.userId);
      const response = notifications.map((notification) => {
         return {
            id: notification.id,
            title: notification.title,
            message: notification.message,
            createdAt: notification.createdAt,
         };
      });
      res.status(200).json({ notifications: response });
   } catch (error) {
      next(error);
   }
}
export async function NotificationMarkAsRead(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing notification id!");
      const notification = await Notifications.getById(id);
      const token = Jwt.getLocals(res, next) as Token;
      if (!notification) throw new AppError(404, "Notification not found!");
      if (notification.userId !== token.userId) throw new AppError(403, "You can't mark as read this notification!");
      notification.unread = false;
      await notification.save();
      res.status(200).json({
         id: notification.id,
         title: notification.title,
         message: notification.message,
         createdAt: notification.createdAt,
         unread: notification.unread,
      });
   } catch (error) {
      next(error);
   }
}
export async function NotificationDelete(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing notification id!");
      const notification = await Notifications.getById(id);
      if (!notification) throw new AppError(404, "Notification not found!");

      const token = Jwt.getLocals(res, next) as Token;
      if (notification.userId !== token.userId) throw new AppError(403, "You can't delete this notification!");
      await Notifications.delete(id);
      res.status(200).end();
   } catch (error) {
      next(error);
   }
}

