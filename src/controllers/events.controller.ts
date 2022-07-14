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

