import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { bets, events, odds, games, users, teams, athletics, rankings, gamesHistory } from "../models";
import { IGame, IOdd, ITeam, TeamResult } from "../interfaces";
import AppError from "../error";

export async function GetGames(_req: Request, res: Response, next: NextFunction) {
   try {
      const result = await games.findAll();
      res.status(200).json({ games: result as IGame[] });
   } catch (err) {
      next(err);
   }
}
export async function GetGamesOdds(_req: Request, res: Response, next: NextFunction) {
   try {
      const allGames = await games.findAll();
      const gamesWithOdds: {
         game: IGame;
         name: string;
         status: "open" | "pendent" | "closed";
         modality: string;
         odds: {
            name: string;
            startPayout: number;
            payout: number;
            amount: number;
            payment: number;
         }[];
      }[] = [];

      await Promise.all(
         allGames.map(async (game) => {
            const gameOdds = await odds.findAll({ where: { gameId: game.id } });
            gamesWithOdds.push({
               game: game,
               name: game.name,
               status: game.status,
               modality: game.modality,
               odds: gameOdds.map((odd) => ({
                  name: odd.name,
                  startPayout: odd.startPayOut,
                  payout: odd.payout,
                  amount: odd.amount,
                  payment: odd.payment,
               })),
            });
         })
      );

      res.status(200).json({ games: gamesWithOdds });
   } catch (err) {
      next(err);
   }
}

export async function GameDetails(req: Request, res: Response, next: NextFunction) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const game = await games.findByPk(gameId);
      const options = await odds.findAll({ where: { gameId } });
      if (!game) return res.status(404).json({ message: `Jogo '${gameId}' não foi encontrado!` });
      res.status(200).json({ game: game as IGame, odds: options as IOdd[] });
   } catch (error) {
      next(error);
   }
}
export async function GamesFilter(req: Request, res: Response, next: NextFunction) {
   try {
      const { modality, category, athleticId, status } = req.query;
      const gamesIds = [] as number[];

      //? Filtrar os jogos po uma atlética especifica
      if (athleticId) {
         const athletic = await athletics.findByPk(Number(athleticId));
         if (!athletic) return res.status(404).json({ message: `Atlética '${athleticId}' não foi encontrada!` });
         const times = await teams.findAll({ where: { athleticId: athletic.id } });
         if (times.length > 0) {
            const teamsIds = times.map((team) => team.id!);
            const AthleticsOdds = await odds.findAll({ where: { teamId: { [Op.in]: teamsIds } } });
            if (AthleticsOdds.length > 0) gamesIds.push(...AthleticsOdds.map((odd) => odd.gameId!));
         }
      }
      const data = await games.findAll({
         where: {
            ...(modality ? { modality: { [Op.like]: `%${modality}%` } } : null),
            ...(category ? { name: { [Op.like]: `%${category}%` } } : null),
            ...(athleticId && gamesIds.length > 0 ? { id: { [Op.in]: gamesIds } } : null),
            ...(status ? { status: `${status}` } : null),
         },
      });

      const result = await odds.findAll();
      const games_odds = data.map((game) => {
         return {
            id: game.id,
            name: game.name,
            eventId: game.eventId,
            status: game.status,
            startDate: game.startDate,
            modality: game.modality,
            location: game.location,
            winnerOddId: game.winnerOddId,
            goalsA: game.goalsA,
            goalsB: game.goalsB,
            createdAt: game.createdAt,
            updatedAt: game.updatedAt,
            odds: result.filter((odd) => odd.gameId === game.id) as IOdd[],
         };
      });

      res.status(200).json(games_odds);
   } catch (error) {
      next(error);
   }
}
export async function CreateGame(req: Request, res: Response, next: NextFunction) {
   try {
      const { eventId, name, status, modality, location, startDate, winnerCommission } = req.body;
      const event = await events.findByPk(eventId);
      if (!event) return res.status(404).json({ message: `Evento '${eventId}' não foi encontrado!` });
      const game = await games.create({
         eventId: eventId,
         name: name,
         status: status,
         modality: modality,
         location: location,
         winnerCommission: winnerCommission > 0 ? winnerCommission : -1,
         startDate: new Date(startDate),
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      res.status(201).json(game as IGame);
   } catch (error) {
      next(error);
   }
}
export async function GetGame(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      const game = await games.findByPk(id);
      if (!game) return res.status(404).json({ message: `Jogo '${id}' não foi encontrado!` });
      res.status(200).json(game as IGame);
   } catch (error) {
      next(error);
   }
}
export async function UpdateGame(req: Request, res: Response, next: NextFunction) {
   try {
      const { gameId, name, eventId, status, modality, location, startDate } = req.body;
      const game = await games.findByPk(gameId);
      if (!game) return res.status(404).json({ message: `Jogo '${gameId}' não foi encontrado!` });

      game.name = name;
      game.eventId = eventId;
      game.status = status;
      game.modality = modality;
      game.location = location;
      game.startDate = new Date(startDate);
      game.updatedAt = new Date();
      await game.save();
      res.status(200).json(game as IGame);
   } catch (error) {
      next(error);
   }
}
export async function DeleteGame(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      await games.destroy({ where: { id } });
      res.status(204).json({ message: `Jogo '${id}' foi excluído com sucesso!` });
   } catch (error) {
      next(error);
   }
}
export async function ProcessGame(req: Request, res: Response, next: NextFunction) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const { winnerOddId, teamA, teamB } = req.body;

      const game = await games.findByPk(gameId);
      if (!game) return res.status(404).json({ message: `Jogo '${gameId}' não foi encontrado!` });
      if (game.winnerOddId) return res.status(400).json({ message: `Jogo '${gameId}' já foi processado!` });

      let options = await odds.findAll({ where: { gameId: gameId } });
      if (!options) return res.status(400).json({ message: `Não existem Opções de apostas cadastradas para o jogo '${gameId}'!` });

      //? processar a classificação dos times do evento do jogo
      const oddTeams = options.filter((odd) => odd.teamId === teamA.id || odd.teamId === teamB.id);
      if (oddTeams.length < 2)
         throw new AppError(400, `Não existem Opções de apostas cadastradas para os times '${teamA.id}' e '${teamB.id}'!`);

      //? processar a classificação dos times do evento do jogo
      await UpdateRanking(game.eventId, teamA, teamB, game.startDate.toISOString(), next);

      //% 1 -> Obter a odd ganhadora
      let winnerOdd = options.find((option) => option.id === winnerOddId);
      if (!winnerOdd) return res.status(404).json({ message: `Opção de aposta vencedora '${winnerOddId}' não foi encontrada!` });

      //% 2 -> Percorrer todas as opções de aposta do jogo e proibir novas apostas
      options.forEach(async (option) => {
         option.status = "lock";
         option.updatedAt = new Date();
         await option.save();
      });

      //% 3 -> Atualizar o jogo com os dados do resultado
      game.status = "closed";
      game.winnerOddId = winnerOddId;
      game.goalsA = teamA.goals;
      game.goalsB = teamB.goals;
      game.updatedAt = new Date();
      await game.save();

      //% 4 -> Atualizar opções de aposta do jogo caso tenha ocorrido alguma mudança
      options = await odds.findAll({ where: { gameId: gameId } });

      //% 7 -> Obter todas as apostas do jogo
      const searchOdds = options.map((option) => option.id!);
      if (searchOdds.length > 0) {
         const apostas = await bets.findAll({ where: { oddId: { [Op.in]: searchOdds } } });

         //% 8 -> Processar resultados das apostas
         for (let i = 0; i < apostas.length; i++) {
            const aposta = apostas[i];
            aposta.status = "completed";
            aposta.result = aposta.oddId === winnerOddId ? "win" : "lose";
            aposta.updatedAt = new Date();
            aposta.save();
         }
      }
      res.status(200).json({ message: "Resultado do jogo processado com sucesso!" });
   } catch (error) {
      next(error);
   }
}
export async function TeamLastGames(req: Request, res: Response, next: NextFunction) {
   try {
      const { teamId, limit } = req.query;
      let options = await odds.findAll({ where: { teamId: Number(teamId), status: "lock" } });
      if (!options) throw new AppError(404, "Time ainda não possui jogos concluídos!");
      const jogos = await games.findAll({
         where: { id: { [Op.in]: options.map((option) => option.gameId) }, status: "closed" },
         limit: limit ? Number(limit) : 5,
      });
      if (!jogos) throw new AppError(404, "Time ainda não possui jogos concluídos!");

      options = await odds.findAll({ where: { gameId: { [Op.in]: jogos.map((jogo) => jogo.id!) } } });
      const times = await teams.findAll({ where: { id: { [Op.in]: options.map((odd) => odd.teamId) } } });
      const response: any = [];
      jogos.forEach((jogo) => {
         const game = jogo as IGame;
         let Teams: ITeam[] = [];
         let Winner: ITeam | null = null;
         options.forEach((option) => {
            if (option.gameId === game.id) {
               const team = times.find((time) => time.id === option.teamId);
               if (team) Teams.push(team);
               if (option.id === game.winnerOddId) Winner = times.find((time) => time.id === option.teamId)!;
            }
         });
         response.push({ game: game, teams: Teams, winner: Winner });
      });
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function AthleticLastGames(req: Request, res: Response, next: NextFunction) {
   try {
      const { athleticId, teamId, limit } = req.query;
      if (!athleticId && !teamId) throw new AppError(422, "Informe ao menos um parâmetro! athleticId ou teamId");

      let athletic;
      if (teamId) {
         const team = await teams.findOne({ where: { id: Number(teamId) } });
         if (!team) return res.status(404).json({ message: `Time '${teamId}' não foi encontrado!` });
         athletic = await athletics.findByPk(team.athleticId);
      } else athletic = await athletics.findByPk(Number(athleticId));
      if (!athletic) return res.status(404).json({ message: `Atlética '${athleticId}' não foi encontrada!` });

      const times = await teams.findAll({ where: { athleticId: athletic.id } });
      const teamsIds = times.map((team) => team.id!);
      const AthleticsOdds = await odds.findAll({ where: { teamId: { [Op.in]: teamsIds } } });
      const gamesIds = AthleticsOdds.map((odd) => odd.gameId!);
      const result = await games.findAll({
         where: { id: { [Op.in]: gamesIds } },
         order: [["updatedAt", "DESC"]],
         limit: limit ? Number(limit) : 5,
      });
      res.status(200).json(result as IGame[]);
   } catch (error) {
      next(error);
   }
}
async function UpdateRanking(eventId: number, A: TeamResult, B: TeamResult, gameDate: string, next: NextFunction) {
   try {
      const event = await events.findByPk(eventId);
      if (!event) throw new AppError(404, "Evento não foi encontrado!");

      const teamA = await teams.findByPk(A.id);
      const teamB = await teams.findByPk(B.id);
      if (!teamA || !teamB) throw new AppError(404, "Times não foram encontrados!");

      //% Salvar o resultado do jogo no histórico
      await gamesHistory.create({
         gameId: eventId,
         date: gameDate,
         teamA: teamA.name,
         teamB: teamB.name,
         scoreA: A.goals,
         scoreB: B.goals,
         serie: "A",
         confrontType: "A",
         gender: teamA.gender,
         event: event.name,
      });

      const rankingA = await rankings.findOne({ where: { eventId, teamId: A.id } });
      const rankingB = await rankings.findOne({ where: { eventId, teamId: B.id } });

      if (!rankingA) {
         await rankings.create({
            eventId,
            name: teamA.name,
            teamId: A.id,
            score: A.goals > B.goals ? 3 : A.goals === B.goals ? 1 : 0,
            wins: A.goals > B.goals ? 1 : 0,
            draws: A.goals === B.goals ? 1 : 0,
            losses: A.goals < B.goals ? 1 : 0,
            goalFor: A.goals,
            goalAgainst: B.goals,
            goalDifference: A.goals - B.goals,
         });
      } else {
         rankingA.score += A.goals > B.goals ? 3 : A.goals === B.goals ? 1 : 0;
         rankingA.wins += A.goals > B.goals ? 1 : 0;
         rankingA.draws += A.goals === B.goals ? 1 : 0;
         rankingA.losses += A.goals < B.goals ? 1 : 0;
         rankingA.goalFor += A.goals;
         rankingA.goalAgainst += B.goals;
         rankingA.goalDifference += A.goals - B.goals;
         await rankingA.save();
      }

      if (!rankingB) {
         await rankings.create({
            eventId,
            name: teamB.name,
            teamId: B.id,
            score: B.goals > A.goals ? 3 : B.goals === A.goals ? 1 : 0,
            wins: B.goals > A.goals ? 1 : 0,
            draws: B.goals === A.goals ? 1 : 0,
            losses: B.goals < A.goals ? 1 : 0,
            goalFor: B.goals,
            goalAgainst: A.goals,
            goalDifference: B.goals - A.goals,
         });
      } else {
         rankingB.score += B.goals > A.goals ? 3 : B.goals === A.goals ? 1 : 0;
         rankingB.wins += B.goals > A.goals ? 1 : 0;
         rankingB.draws += B.goals === A.goals ? 1 : 0;
         rankingB.losses += B.goals < A.goals ? 1 : 0;
         rankingB.goalFor += B.goals;
         rankingB.goalAgainst += A.goals;
         rankingB.goalDifference += B.goals - A.goals;
         await rankingB.save();
      }
   } catch (error) {
      next(error);
   }
}
