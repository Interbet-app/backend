import { Request, Response } from "express";
import { players } from "../models";
import { IPlayer } from "../interfaces";
import AppError from "../error";

export async function TeamPlayers(req: Request, res: Response, next: any) {
   try {
      const teamId = parseInt(req.params.id, 10);
      const result = await players.findAll({ where: { teamId } });
      res.status(200).json(result as IPlayer[]);
   } catch (error) {
      next(error);
   }
}

export async function CreatePlayer(req: Request, res: Response, next: any) {
   try {
      const { name, position, teamId, holder } = req.body;
      const player = await players.create({
         name,
         position,
         teamId,
         holder,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      res.status(200).json(player as IPlayer);
   } catch (error) {
      next(error);
   }
}

export async function UpdatePlayer(req: Request, res: Response, next: any) {
   try {
      const { playerId, name, position, teamId, holder } = req.body;
      const player = await players.findByPk(playerId);
      if (!player) throw new AppError(404, "Jogador não encontrado!");
      player.name = name;
      player.position = position;
      player.teamId = teamId;
      player.holder = holder;
      player.updatedAt = new Date();
      await player.save();
      res.status(200).json(player as IPlayer);
   } catch (error) {
      next(error);
   }
}

export async function DeletePlayer(req: Request, res: Response, next: any) {
   try {
      const playerId = req.params.id;
      await players.destroy({ where: { id: playerId } });
      res.status(200).json({ message: "Jogador excluído com sucesso!" });
   } catch (error) {
      next(error);
   }
}

