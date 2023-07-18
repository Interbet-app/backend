import { NextFunction, Request, Response } from "express";
import { events, games, odds, teams } from "../models";
import { IEvent, ITeam } from "../interfaces";
import { Op } from "sequelize";
import AppError from "../error";

export async function GetEvents(_req: Request, res: Response, next: NextFunction) {
   try {
      const data = await events.findAll();
      res.status(200).json({ events: data as IEvent[] });
   } catch (error) {
      next(error);
   }
}
export async function GetEventClassification(req: Request, res: Response, next: NextFunction) {
   try {
      const eventId = parseInt(req.params.id, 10);
      const event = await events.findByPk(eventId);
      if (!event) throw new AppError(404, "Evento não encontrado!");

      const matches = await games.findAll({ where: { eventId }, order: [["startDate", "ASC"]] });
      if (!matches) throw new AppError(200, "Evento não possui partidas!");

      const gamesIds = matches.map((match) => match.id);
      const oddsData = await odds.findAll({ where: { gameId: { [Op.in]: gamesIds } }, order: [["createdAt", "ASC"]] });
      if (!oddsData) throw new AppError(200, "Evento não possui odds!");

      const teamsIds = oddsData.filter((odd) => odd.teamId !== 0).map((odd) => odd.teamId);
      const Teams = await teams.findAll({
         where: { id: { [Op.in]: teamsIds } },
         attributes: ["id", "name", "picture", "abbreviation", "athleticId", "gender", "sport"],
      });

      const preparedMatches = matches.map((match) => {
         return {
            ...match.dataValues,
            teams: oddsData.filter((odd) => odd.teamId !== 0 && odd.gameId === match.id),
         };
      });

      if (event.type === "stitches") {
         //Classificação por pontos corridos (stitches)
         //Critérios de desempate: 1º - pontos 2º - vitórias 3º - saldo de gol 4º - gols pró
         type Position = {
            team: ITeam;
            matches: number;
            points: number;
            wins: number;
            draws: number;
            goalsFor: number;
            goalsAgainst: number;
         };
         const stitches = [] as Position[];
         Teams.forEach((team) => {
            if (stitches.findIndex((position) => position.team.id === team.id) === -1) {
               stitches.push({
                  team: team.dataValues,
                  matches: 0,
                  points: 0,
                  wins: 0,
                  draws: 0,
                  goalsFor: 0,
                  goalsAgainst: 0,
               });
            }
         });

         preparedMatches.forEach((match) => {
            const indexA = stitches.findIndex((position) => position.team.id === match.teams[0].teamId);
            const indexB = stitches.findIndex((position) => position.team.id === match.teams[1].teamId);

            if (match.goalsA! > match.goalsB!) {
               stitches[indexA].matches += 1;
               stitches[indexA].points += 3;
               stitches[indexA].wins += 1;
               stitches[indexA].goalsFor += match.goalsA!;
               stitches[indexA].goalsAgainst += match.goalsB!;
               stitches[indexB].matches += 1;
               stitches[indexB].goalsFor += match.goalsB!;
               stitches[indexB].goalsAgainst += match.goalsA!;
            } else if (match.goalsA! < match.goalsB!) {
               stitches[indexB].matches += 1;
               stitches[indexB].points += 3;
               stitches[indexB].wins += 1;
               stitches[indexB].goalsFor += match.goalsB!;
               stitches[indexB].goalsAgainst += match.goalsA!;
               stitches[indexA].matches += 1;
               stitches[indexA].goalsFor += match.goalsA!;
               stitches[indexA].goalsAgainst += match.goalsB!;
            } else {
               stitches[indexA].matches += 1;
               stitches[indexA].points += 1;
               stitches[indexA].draws += 1;
               stitches[indexA].goalsFor += match.goalsA!;
               stitches[indexA].goalsAgainst += match.goalsB!;
               stitches[indexB].matches += 1;
               stitches[indexB].points += 1;
               stitches[indexB].draws += 1;
               stitches[indexB].goalsFor += match.goalsB!;
               stitches[indexB].goalsAgainst += match.goalsA!;
            }
         });

         stitches.sort((a, b) => {
            if (a.points > b.points) return -1;
            if (a.points < b.points) return 1;
            if (a.wins > b.wins) return -1;
            if (a.wins < b.wins) return 1;
            if (a.goalsFor - a.goalsAgainst > b.goalsFor - b.goalsAgainst) return -1;
            if (a.goalsFor - a.goalsAgainst < b.goalsFor - b.goalsAgainst) return 1;
            if (a.goalsFor > b.goalsFor) return -1;
            if (a.goalsFor < b.goalsFor) return 1;
            return 0;
         });

         res.status(200).json({ classification: stitches });
      } else {
         //Classificação por mata-mata (kill)
         //Critérios de eliminação: - 1º - derrota
         type Kill = {
            date: Date;
            winnerTeamId: ITeam;
            loserTeamId: ITeam;
         };
         const kills = [] as Kill[];

         preparedMatches.forEach((match) => {
            if (match.goalsA! > match.goalsB!) {
               kills.push({
                  date: match.startDate,
                  winnerTeamId: Teams.find((team) => team.id === match.teams[0].teamId)!.dataValues,
                  loserTeamId: Teams.find((team) => team.id === match.teams[1].teamId)!.dataValues,
               });
            } else if (match.goalsA! < match.goalsB!) {
               kills.push({
                  date: match.startDate,
                  winnerTeamId: Teams.find((team) => team.id === match.teams[1].teamId)!.dataValues,
                  loserTeamId: Teams.find((team) => team.id === match.teams[0].teamId)!.dataValues,
               });
            }
         });
         kills.sort((a, b) => {
            if (a.date < b.date) return -1;
            if (a.date > b.date) return 1;
            return 0;
         });

         res.status(200).json({ classification: kills });
      }
   } catch (error) {
      next(error);
   }
}

export async function CreateEvent(req: Request, res: Response, next: NextFunction) {
   try {
      const { name, description, title, location, startDate, endDate, type } = req.body;
      const event = await events.create({
         name,
         description,
         title,
         location,
         startDate,
         endDate,
         type,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!event) throw new AppError(500, "Falha ao criar evento!");
      res.status(201).json(event as IEvent);
   } catch (error) {
      next(error);
   }
}
export async function DeleteEvent(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      const event = await events.destroy({ where: { id } });
      if (!event) throw new AppError(500, "Falha ao excluir evento!");
      res.status(200).json({ message: "Evento excluído com sucesso!" });
   } catch (error) {
      next(error);
   }
}
