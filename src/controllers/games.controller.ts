import { Request, Response } from "express";
import { Games, Events, Odds, games } from "../repositories";
import { IGame } from "../interfaces";
import AppError from "../error";

export async function GetGames(_req: Request, res: Response, next: any) {
   try {
      const games = await Games.All();
      res.status(200).json({ games: games });
   } catch (err) {
      next(err);
   }
}
export async function GamesAndOdds(_req: Request, res: Response, next: any) {
   try {
      const games = await Games.All();
      const odds = await Odds.All();

      const games_odds = games.map((game) => {
         return {
            id: game.id,
            name: game.name,
            eventId: game.eventId,
            status: game.status,
            startDate: game.startDate,
            modality: game.modality,
            location: game.location,
            winnerOddId: game.winnerOddId,
            result: game.result,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            odds: odds.filter((odd) => odd.gameId === game.id),
         };
      });

      res.status(200).json(games_odds);
   } catch (error) {
      next(error);
   }
}
export async function CreateGame(req: Request, res: Response, next: any) {
   try {
      const { eventId, name, status, modality, location, startDate } = req.body;
      const event = await Events.ById(eventId);
      if (!event) throw new AppError(404, "Event not found");
      const game = await Games.Create({
         eventId: eventId,
         name: name,
         status: status,
         modality: modality,
         location: location,
         startDate: new Date(startDate),
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      res.status(201).json(game);
   } catch (error) {
      next(error);
   }
}
export async function GetGame(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing game id!");
      const game = await Games.ById(id);
      if (!game) throw new AppError(404, "Game not found");
      res.status(200).json(game);
   } catch (error) {
      next(error);
   }
}
export async function UpdateGame(req: Request, res: Response, next: any) {
   try {
      const { gameId, name, eventId, winnerOddId, status, modality, location, result, startDate } = req.body;
      const game = await games.findByPk(gameId);
      if (!game) throw new AppError(404, "Game not found");

      game.name = name;
      game.eventId = eventId;
      game.status = status;
      game.modality = modality;
      game.location = location;
      game.startDate = new Date(startDate);
      game.updatedAt = new Date();
      if (result) game.result = result;
      if (winnerOddId) game.winnerOddId = winnerOddId;
      await game.save();
      res.status(200).json(game as IGame);
   } catch (error) {
      next(error);
   }
}
export async function DeleteGame(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing geme id!");
      await Games.Destroy(id);
      res.status(204).json({ message: "Game deleted" });
   } catch (error) {
      next(error);
   }
}

