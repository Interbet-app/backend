import { Request, Response } from "express";
import { Notifications,notifications } from "../repositories";
import { Token } from "../types";
import { Jwt } from "../auth";
import AppError from "../error";

export async function UserNotifications(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const data = await Notifications.ByUserId(token.userId);
      res.status(200).json({ notifications: data });
   } catch (error) {
      next(error);
   }
}
export async function NotificationMarkAsRead(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing notification id!");
      const notification = await notifications.findByPk(id);
      const token = Jwt.getLocals(res, next) as Token;
      if (!notification) throw new AppError(404, "Notification not found!");
      if (notification.userId !== token.userId) throw new AppError(403, "You can't mark as read this notification!");
      notification.unread = false;
      notification.updatedAt = new Date();
      await notification.save();
      res.status(200).json(notification);
   } catch (error) {
      next(error);
   }
}
export async function NotificationDelete(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing notification id!");
      const notification = await Notifications.ById(id);
      if (!notification) throw new AppError(404, "Notification not found!");

      const token = Jwt.getLocals(res, next) as Token;
      if (notification.userId !== token.userId) throw new AppError(403, "You can't delete this notification!");
      await Notifications.Destroy(id);
      res.status(200).end();
   } catch (error) {
      next(error);
   }
}


