import { Request, Response } from "express";
import { Events } from "../repositories";
import AppError from "../error";

export async function GetEvents(_req: Request, res: Response, next: any) {
   try {
      const events = await Events.getAll();
      const response = events.map((event) => {
         return {
            id: event.id,
            name: event.name,
            description: event.description,
            createdAt: event.createdAt,
         };
      });
      res.status(200).json({ events: response });
   } catch (error) {
      next(error);
   }
}
export async function CreateEvent(req: Request, res: Response, next: any) {
   try {
      const { name, description, title, location } = req.body;
      const event = await Events.create({ name, description, title, location, createdAt: new Date(), updatedAt: new Date()});
      if(!event) throw new AppError(500, "Event not created!");
      res.status(201).json({
         id: event.id,
         name: event.name,
         description: event.description,
         title: event.title,
         location: event.location,
         createdAt: event.createdAt,
         updatedAt: event.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function DeleteEvent(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      const event = await Events.delete(id);
      if(!event) throw new AppError(500, "Event not deleted!");
      res.status(200).json({ id });
   } catch (error) {
      next(error);
   }
}
