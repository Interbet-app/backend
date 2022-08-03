import { Request, Response } from "express";
import { Events } from "../repositories";
import AppError from "../error";

export async function GetEvents(_req: Request, res: Response, next: any) {
   try {
      const events = await Events.All();
      res.status(200).json({ events: events });
   } catch (error) {
      next(error);
   }
}
export async function CreateEvent(req: Request, res: Response, next: any) {
   try {
      const { name, description, title, location } = req.body;
      const event = await Events.Create({ name, description, title, location, createdAt: new Date(), updatedAt: new Date()});
      if(!event) throw new AppError(500, "Event not created!");
      res.status(201).json(event);
   } catch (error) {
      next(error);
   }
}
export async function DeleteEvent(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      const event = await Events.Destroy(id);
      if(!event) throw new AppError(500, "Event not deleted!");
      res.status(200).json({ id });
   } catch (error) {
      next(error);
   }
}
