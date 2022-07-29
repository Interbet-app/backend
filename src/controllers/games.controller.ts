import { Request, Response } from "express";
import { Games, Events } from "../repositories";
import { IGame } from "../interfaces";
import AppError from "../error";

export async function GetGames(_req: Request, res: Response, next: any) {
   try {
      const games = await Games.getAll();
      const response = games.map((games) => {
         return {
            id: games.id,
            eventId: games.eventId,
            winnerOddId: games.winnerOddId,
            name: games.name,
            status: games.status,
            modality: games.modality,
            location: games.location,
            result: games.result,
            startDate: games.startDate,
            createdAt: games.createdAt,
            updatedAt: games.updatedAt,
         };
      });
      res.status(200).json({ games: response });
   } catch (err) {
      next(err);
   }
}
export async function CreateGame(req: Request, res: Response, next: any) {
   try {
      const { eventId, name, status, modality, location, startDate } = req.body;
      const event = await Events.getById(eventId);
      if (!event) throw new AppError(404, "Event not found");
      const game = await Games.create({
         eventId: eventId,
         name: name,
         status: status,
         modality: modality,
         location: location,
         startDate: startDate,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      res.status(201).json({
         id: game.id,
         eventId: game.eventId,
         winnerOddId: null,
         name: game.name,
         status: game.status,
         modality: game.modality,
         location: game.location,
         result: null,
         startDate: game.startDate,
         createdAt: game.createdAt,
         updatedAt: game.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function GetGame(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing geme id!");
      const game = await Games.getById(id);
      if (!game) throw new AppError(404, "Game not found");
      res.status(200).json({
         id: game.id,
         eventId: game.eventId,
         winnerOddId: game.winnerOddId,
         name: game.name,
         status: game.status,
         modality: game.modality,
         location: game.location,
         result: game.result,
         startDate: game.startDate,
         createdAt: game.createdAt,
         updatedAt: game.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function UpdateGame(req: Request, res: Response, next: any) {
   try {
      const { gameId, name, eventId, winnerOddId, status, modality, location, result, startDate } = req.body;
      const game = await Games.getById(gameId);
      if (!game) throw new AppError(404, "Game not found");

      game.name = name;
      game.eventId = eventId;
      game.status = status;
      game.modality = modality;
      game.location = location;
      game.startDate = startDate;
      game.updatedAt = new Date();
      if (result) game.result = result;
      if (winnerOddId) game.winnerOddId = winnerOddId;
      await game.save();
      res.status(200).json({
         id: game.id,
         eventId: game.eventId,
         winnerOddId: game.winnerOddId,
         name: game.name,
         status: game.status,
         modality: game.modality,
         location: game.location,
         result: game.result,
         startDate: game.startDate,
         createdAt: game.createdAt,
         updatedAt: game.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function DeleteGame(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing geme id!");
      const game = await Games.getById(id);
      if (!game) throw new AppError(404, "Game not found");
      await game.destroy();
      res.status(204).json({ message: "Game deleted" });
   } catch (error) {
      next(error);
   }
}
