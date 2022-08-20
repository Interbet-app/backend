import { Request, Response } from "express";
import { notifications } from "../models";
import { Jwt, Token } from "../auth";
import AppError from "../error";
import { INotification } from "../interfaces";

export async function UserNotifications(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const data = await notifications.findAll({ where: { userId: token.userId } });
      res.status(200).json({ notifications: data as INotification[] });
   } catch (error) {
      next(error);
   }
}
export async function NotificationMarkAsRead(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      const notification = await notifications.findByPk(id);
      const token = Jwt.getLocals(res, next) as Token;
      if (!notification) throw new AppError(404, "Notificação não encontrada");
      if (notification.userId !== token.userId)
         throw new AppError(403, "Voce não tem permissão para marcar esta notificação como lida");
      notification.unread = false;
      notification.updatedAt = new Date();
      await notification.save();
      res.status(200).json(notification as INotification);
   } catch (error) {
      next(error);
   }
}
export async function NotificationDelete(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      const notification = await notifications.findByPk(id);
      if (!notification) throw new AppError(404, "Notificação não encontrada");

      const token = Jwt.getLocals(res, next) as Token;
      if (notification.userId !== token.userId)
         throw new AppError(403, "Voce não tem permissão para excluir esta notificação");
      await notification.destroy();
      res.status(200).end();
   } catch (error) {
      next(error);
   }
}

