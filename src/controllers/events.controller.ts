import { Request, Response } from "express";
import { events } from "../models";
import { IEvent } from "../interfaces";
import AppError from "../error";

export async function GetEvents(_req: Request, res: Response, next: any) {
   try {
      const data = await events.findAll();
      res.status(200).json({ events: data as IEvent[] });
   } catch (error) {
      next(error);
   }
}
export async function CreateEvent(req: Request, res: Response, next: any) {
   try {
      const { name, description, title, location } = req.body;
      const event = await events.create({
         name,
         description,
         title,
         location,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!event) throw new AppError(500, "Falha ao criar evento!");
      res.status(201).json(event as IEvent);
   } catch (error) {
      next(error);
   }
}
export async function DeleteEvent(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      const event = await events.destroy({ where: { id } });
      if (!event) throw new AppError(500, "Falha ao excluir evento!");
      res.status(200).json({ message: "Evento excluído com sucesso!" });
   } catch (error) {
      next(error);
   }
}
