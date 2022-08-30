import { Request, Response } from "express";
import { Op } from "sequelize";
import { gamesHistory } from "../models";
import { IGameHistory } from "../interfaces";

export async function GamesHistory(_req: Request, res: Response, next: any) {
   try {
      const gamesHistoryList = await gamesHistory.findAll();
      const response = gamesHistoryList.map((gameHistory: IGameHistory) => gameHistory as IGameHistory);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function GamesHistorySearch(req: Request, res: Response, next: any) {
   try {
      const { event, teamA, teamB } = req.query;
      const history = await gamesHistory.findAll({
         where: {
            [Op.or]: [
               { event: { [Op.like]: `%${event}%` } },
               { teamA: { [Op.like]: `%${teamA}%` } },
               { teamB: { [Op.like]: `%${teamB}%` } },
            ],
         },
      });
      const response = history.map((item: IGameHistory) => item as IGameHistory);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function GamesHistoryCreate(req: Request, res: Response, next: any) {
   try {
      const { event, teamA, teamB, scoreA, scoreB, date } = req.body;
      const newGameHistory = await gamesHistory.create({
         event,
         teamA,
         teamB,
         scoreA,
         scoreB,
         date,
      });
      res.status(201).json(newGameHistory);
   } catch (error) {
      next(error);
   }
}
export async function GamesHistoryDelete(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      await gamesHistory.destroy({ where: { id } });
      return res.status(200).json({ message: "Histórico de jogo excluído com sucesso!" });
   } catch (error) {
      next(error);
   }
}

