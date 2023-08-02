import { NextFunction, Request, Response } from "express";
import { events, odds, games, teams, gamesHistory } from "../models";
import { DateTime } from "luxon";

type ITeam = {
   id?: number;
   name: string;
   abbreviation: string;
   picture: string;
   gender: string;
   score?: number;
};
type IGame = {
   id?: number;
   status: string;
   date: string;
   teams: ITeam[];
};
type IEvent = {
   id?: number;
   name: string;
   type: "stitches" | "kill";
   gender?: string;
   games: IGame[];
};
type IChronology = {
   date: number;
   events?: IEvent[];
};

export async function GetChronology(_req: Request, res: Response, next: NextFunction) {
   try {
      const data = await Promise.all([games.findAll(), gamesHistory.findAll(), odds.findAll(), teams.findAll(), events.findAll()]);
      let Chronology: IChronology[] = [];

      data[0].forEach((game) => {
         const date = DateTime.fromJSDate(game.startDate).startOf("day").toMillis();
         if (Chronology.findIndex((value) => value.date === date) === -1) {
            Chronology.push({ date });
         }
      });

      data[1].forEach((history) => {
         const date = DateTime.fromJSDate(history.date!).startOf("day").toMillis();
         if (Chronology.findIndex((value) => value.date === date) === -1) {
            Chronology.push({ date });
         }
      });

      Chronology.forEach((item) => {
         const games_of_day = data[0].filter((game) => {
            const start = DateTime.fromJSDate(game.startDate).startOf("day").toMillis();
            return item.date === start;
         });

         const histories_of_day = data[1].filter((history) => {
            const start = DateTime.fromJSDate(history.date!).startOf("day").toMillis();
            return item.date === start;
         });

         const Events: IEvent[] = [];

         data[4].forEach((event) => {
            const games_of_event = games_of_day.filter((game) => game.dataValues.eventId === event.id);
            const histories_of_event = histories_of_day.filter((history) => history.dataValues.event === event.name);
            const jogos: IGame[] = [];

            games_of_event.forEach((game) => {
               const options = data[2].filter((odd) => odd.dataValues.gameId === game.dataValues.id);
               const teamA = data[3].find((team) => options.length > 0 && team.dataValues.id === options[0].dataValues.teamId);
               const teamB = data[3].find((team) => options.length > 0 && team.dataValues.id === options[1].dataValues.teamId);

               if (teamA && teamB)
                  jogos.push({
                     id: game.dataValues.id,
                     status: game.dataValues.status,
                     date: DateTime.fromJSDate(game.startDate).toISO(),
                     teams: [
                        {
                           id: teamA!.id,
                           name: teamA!.name,
                           abbreviation: teamA!.abbreviation,
                           picture: teamA!.picture,
                           gender: teamA.gender,
                           score: game.dataValues.goalsA,
                        },
                        {
                           id: teamB!.id,
                           name: teamB!.name,
                           abbreviation: teamB!.abbreviation,
                           picture: teamB!.picture,
                           gender: teamB.gender,
                           score: game.dataValues.goalsB,
                        },
                     ],
                  });
            });

            histories_of_event.forEach((history) => {
               const teamA = data[3].find((team) => team.name === history.dataValues.teamA);
               const teamB = data[3].find((team) => team.name === history.dataValues.teamB);

               if (teamA && teamB)
                  jogos.push({
                     id: history.gameId,
                     status: "history",
                     date: DateTime.fromJSDate(history.date!).toISO(),
                     teams: [
                        {
                           id: teamA!.id,
                           name: teamA!.name,
                           abbreviation: teamA!.abbreviation,
                           picture: teamA!.picture,
                           gender: teamA.gender,
                           score: history.scoreA,
                        },
                        {
                           id: teamB!.id,
                           name: teamB!.name,
                           abbreviation: teamB!.abbreviation,
                           picture: teamB!.picture,
                           gender: teamB.gender,
                           score: history.scoreB,
                        },
                     ],
                  });
            });

            if (jogos.length > 0)
               Events.push({
                  id: event.id,
                  name: event.name,
                  type: event.type,
                  games: jogos,
                  gender: event.gender,
               });
         });

         item.events = Events;
      });

      Chronology = Chronology.filter((item) => item.events && item.events.length > 0);

      res.status(200).json({ Chronology });
   } catch (err) {
      next(err);
   }
}
