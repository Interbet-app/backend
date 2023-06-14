import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { ITeamModel, gamesHistory, teams } from "../models";
import { IGameHistory } from "../interfaces";

export async function GamesHistory(_req: Request, res: Response, next: NextFunction) {
   try {
      const games = await gamesHistory.findAll();
      const team = (await teams.findAll({ attributes: ["name", "picture", "abbreviation"] })) as ITeamModel[];
      const response = games.map((item) => {
         const teamA = team.find((team) => team.name.includes(item.teamA) || team.abbreviation.includes(item.teamA));
         const teamB = team.find((team) => team.name.includes(item.teamB) || team.abbreviation.includes(item.teamB));
         return {
            A: {
               name: teamA?.name,
               abbreviation: teamA?.abbreviation,
               picture: teamA?.picture,
               score: item.scoreA,
            },
            B: {
               name: teamB?.name,
               abbreviation: teamB?.abbreviation,
               picture: teamB?.picture,
               score: item.scoreB,
            },
            gameId: item.gameId,
            gender: item.gender,
            event: item.event,
            confrontType: item.confrontType,
            serie: item.serie,
            date: item.date,
         };
      });

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function GamesHistorySearch(req: Request, res: Response, next: NextFunction) {
   try {
      const { event, teamA, teamB, gender } = req.query;
      const history = await gamesHistory.findAll({
         where: {
            gender: gender as string,
            event: event as string,
            [Op.or]: [{ teamA: { [Op.like]: `%${teamA}%` } }, { teamB: { [Op.like]: `%${teamB}%` } }],
         },
      });
      const response = history.map((item: IGameHistory) => item as IGameHistory);

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
