import { Request, Response } from "express";
import { Op } from "sequelize";
import { bets, wallets, teams, events, odds, games } from "../models";
import { IGame, IOdd } from "../interfaces";
import AppError from "../error";
import logger from "../log";

export async function GetGames(_req: Request, res: Response, next: any) {
   try {
      const result = await games.findAll();
      res.status(200).json({ games: result as IGame[] });
   } catch (err) {
      next(err);
   }
}
export async function GameDetails(req: Request, res: Response, next: any) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const game = await games.findByPk(gameId);
      const options = await odds.findAll({ where: { gameId } });
      if (!game) throw new AppError(404, "Jogo não foi encontrado!");
      res.status(200).json({ game: game as IGame, odds: options as IOdd[] });
   } catch (error) {
      next(error);
   }
}
export async function GamesAndOdds(req: Request, res: Response, next: any) {
   try {
      const { modality } = req.query;
      let data;
      if (modality) data = await games.findAll({ where: { modality: { [Op.like]: `%${modality}%` } } });
      else data = await games.findAll();

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
            result: game.result,
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
export async function CreateGame(req: Request, res: Response, next: any) {
   try {
      const { eventId, name, status, modality, location, startDate } = req.body;
      const event = await events.findByPk(eventId);
      if (!event) throw new AppError(404, "Evento não foi encontrado!");
      const game = await games.create({
         eventId: eventId,
         name: name,
         status: status,
         modality: modality,
         location: location,
         startDate: new Date(startDate),
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      res.status(201).json(game as IGame);
   } catch (error) {
      next(error);
   }
}
export async function GetGame(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      const game = await games.findByPk(id);
      if (!game) throw new AppError(404, "Jogo não foi encontrado!");
      res.status(200).json(game as IGame);
   } catch (error) {
      next(error);
   }
}
export async function UpdateGame(req: Request, res: Response, next: any) {
   try {
      const { gameId, name, eventId, status, modality, location, startDate } = req.body;
      const game = await games.findByPk(gameId);
      if (!game) throw new AppError(404, "Jogo não foi encontrado!");

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
export async function DeleteGame(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      await games.destroy({ where: { id } });
      res.status(204).json({ message: "Jogo excluído com sucesso" });
   } catch (error) {
      next(error);
   }
}
export async function ProcessGame(req: Request, res: Response, next: any) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const { winnerOddId, result } = req.body;

      if (!winnerOddId) throw new AppError(422, "Parâmetro winnerOddId é obrigatório!");
      if (!result) throw new AppError(422, "Parâmetro result é obrigatório!");
      if (!gameId) throw new AppError(422, "Parâmetro gameId é obrigatório!");

      const game = await games.findByPk(gameId);
      if (!game) throw new AppError(404, "Jogo não foi encontrado!");

      let options = await odds.findAll({ where: { gameId: gameId } });
      if (!options) throw new AppError(404, "Nenhuma opção foi encontrada!");

      //% 1 -> Obter a odd ganhadora
      let winnerOdd = options.find((option) => option.id === winnerOddId);
      if (!winnerOdd) throw new AppError(404, "Odd ganhadora não foi encontrada!");

      //% 2 -> Percorrer todas as opções de aposta do jogo e proibir novas apostas
      options.forEach(async (option) => {
         option.status = "lock";
         option.updatedAt = new Date();
         await option.save();
      });

      //% 3 -> Atualizar o jogo com os dados do resultado
      game.status = "closed";
      game.winnerOddId = winnerOddId;
      game.result = result;
      game.updatedAt = new Date();
      await game.save();

      //% 4 -> Atualizar opções de aposta do jogo caso tenha ocorrido alguma mudança entre a busca inicial e a atualização que proibi novas apostas
      options = await odds.findAll({ where: { gameId: gameId } });
      winnerOdd = options.find((option) => option.id === winnerOddId);
      if (!winnerOdd) throw new AppError(404, "Odd ganhadora informada não pertence a este jogo!");

      //% 5 -> Preparar armazenamento de estatísticas dos resultados das apostas no jogo
      const Statistics = {
         sumBets: 0,
         betAmount: 0,
         winnersAmount: 0,
         lossesAmount: 0,
         profit: 0,
         commission: 0,
      };

      //% 6 -> Processar comissões do time ganhador caso nao seja empate
      if (winnerOdd.teamId != 0) {
         const winTeam = await teams.findOne({ where: { id: winnerOdd.teamId } });
         const commission = Number(winnerOdd.amount) * 0.01; //? 1% de comissão
         if (winTeam) {
            if (winTeam.adminId != null) {
               const wallet = await wallets.findOne({ where: { userId: winTeam.adminId } });
               Statistics.commission = commission;
               if (!wallet) {
                  await wallets.create({
                     userId: winTeam.adminId,
                     balance: commission,
                     bonus: 0,
                     score: 0,
                     createdAt: new Date(),
                     updatedAt: new Date(),
                  });
               } else {
                  wallet.balance += commission;
                  wallet.updatedAt = new Date();
                  await wallet.save();
               }
            }
         } else
            logger.error(`Não foi possível encontrar o time ${winnerOdd.teamId} para o jogo ${gameId},
                para pagamento de comissão.`);
      }

      //% 7 -> Obter todas as apostas do jogo
      const searchOdds = options.map((option) => option.id!);
      if (!searchOdds || searchOdds.length === 0) throw new AppError(200, "Jogo não possui apostas!");
      const apostas = await bets.findAll({ where: { oddId: { [Op.in]: searchOdds } } });

      //% 8 -> Processar resultados das apostas
      for (let i = 0; i < apostas.length; i++) {
         const aposta = apostas[i];
         aposta.status = "completed";
         aposta.result = aposta.oddId === winnerOddId ? "win" : "lose";
         aposta.updatedAt = new Date();
         await aposta.save();

         Statistics.sumBets++;
         Statistics.betAmount += aposta.amount;
         Statistics.winnersAmount += aposta.result === "win" ? Number(aposta.amount) * Number(aposta.payout) : 0;
         Statistics.lossesAmount += aposta.result === "lose" ? aposta.amount : 0;
      }

      Statistics.profit = Statistics.winnersAmount - Statistics.lossesAmount;
      res.status(200).json({ message: "Resultado do jogo processado com sucesso!", statistics: Statistics });
   } catch (error) {
      next(error);
   }
}




