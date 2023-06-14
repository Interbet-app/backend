import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { ITeamModel, gamesHistory, teams } from "../models";
import { IGameHistory } from "../interfaces";

export async function GamesHistory(_req: Request, res: Response, next: NextFunction) {
   try {
      gamesHistory
         .findAll()
         .then((response) => res.status(200).json(response))
         .catch((err) => console.log(err));
   } catch (error) {
      next(error);
   }
}
export async function GamesHistorySearch(req: Request, res: Response, next: NextFunction) {
   try {
      const { event, teamA, teamB, gender } = req.query;
      const games = await gamesHistory.findAll({
         where: {
            gender: gender as string,
            [Op.or]: [
               { event: { [Op.like]: `%${event}%` } },
               { teamA: { [Op.like]: `%${teamA}%` } },
               { teamB: { [Op.like]: `%${teamB}%` } },
            ],
         },
      });

      const team = await teams.findAll({
         where: {
            [Op.or]: [
               { name: { [Op.like]: `%${teamA}%` } },
               { name: { [Op.like]: `%${teamB}%` } },
               { abbreviation: { [Op.like]: `%${teamA}%` } },
               { abbreviation: { [Op.like]: `%${teamB}%` } },
            ],
         },
      });
      const history = games.map((item: IGameHistory) => item as IGameHistory);
      const pictures = team.map((item: any) => item as ITeamModel);

      const response = history.map((item: IGameHistory) => {
         const teamA = pictures.find((team) => team.name === item.teamA || team.abbreviation === item.teamA);
         const teamB = pictures.find((team) => team.name === item.teamB || team.abbreviation === item.teamB);
         return {
            ...item,
            teamA: teamA?.picture,
            teamB: teamB?.picture,
         };
      });

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function GamesHistoryCreate(req: Request, res: Response, next: NextFunction) {
   try {
      const { gameId, event, teamA, teamB, scoreA, scoreB, date, confrontType, gender, serie } = req.body;
      const newGameHistory = await gamesHistory.create({
         gameId,
         event,
         teamA,
         teamB,
         scoreA,
         scoreB,
         confrontType,
         serie,
         gender,
         date,
      });
      res.status(201).json(newGameHistory);
   } catch (error) {
      next(error);
   }
}
export async function GamesHistoryDelete(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      await gamesHistory.destroy({ where: { id } });
      return res.status(200).json({ message: "Histórico de jogo excluído com sucesso!" });
   } catch (error) {
      next(error);
   }
}
