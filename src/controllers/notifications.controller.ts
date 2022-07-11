import { Request, Response } from "express";
import { Notifications } from "../repositories";
import { Token } from "../types";
import { Jwt } from "../utils/jwt";
import logger from "../log";


export async function UserNotifications(_req: Request, res: Response) {
   try {
      const token = Jwt.getLocals(res) as Token;
      const notifications = await Notifications.getByUserId(token.userId);
      res.status(200).json({notifications: notifications});
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function NotificationMarkAsRead(req: Request, res: Response) {
   try {
      const id = parseInt(req.params.id, 10);
      if(!id) res.status(422).json({message: "Invalid id!"});
      const notification = await Notifications.getById(id);
      const token = Jwt.getLocals(res) as Token;
      if (!notification) return res.status(404).json({ message: "Notification not found!" });
      if (notification.userId !== token.userId) return res.status(403).json({ message: "You are not authorized to perform this action!" });
      notification.unread = false;
      await Notifications.update(notification);
      res.status(200).end();
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function NotificationDelete(req: Request, res: Response) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) res.status(422).json({ message: "Invalid id!" });
      const notification = await Notifications.getById(id);
      const token = Jwt.getLocals(res) as Token;
      if (!notification) return res.status(404).json({ message: "Notification not found!" });
      if (notification.userId !== token.userId) return res.status(403).json({ message: "You are not authorized to perform this action!" });
      await Notifications.delete(id);
      res.status(200).end();
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}