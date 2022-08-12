import { Request, Response } from "express";
import { Op } from "sequelize";
import { Games, Events, Odds, games, odds, bets, wallets, IBetModel, teams } from "../repositories";
import { IGame } from "../interfaces";
import AppError from "../error";
import logger from "../log";

export async function GetGames(_req: Request, res: Response, next: any) {
   try {
      const games = await Games.All();
      res.status(200).json({ games: games });
   } catch (err) {
      next(err);
   }
}
export async function GameDetails(req: Request, res: Response, next: any) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const game = await Games.ById(gameId);
      const odds = await Odds.ByGameId(gameId);
      if (!game) throw new AppError(404, "Game not found");
      res.status(200).json({ game: game, odds: odds });
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

      const odds = await Odds.All();
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
      const { gameId, name, eventId, status, modality, location, startDate } = req.body;
      const game = await games.findByPk(gameId);
      if (!game) throw new AppError(404, "Game not found");

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
      if (!id) throw new AppError(422, "Missing geme id!");
      await Games.Destroy(id);
      res.status(204).json({ message: "Game deleted" });
   } catch (error) {
      next(error);
   }
}
export async function ProcessGame(req: Request, res: Response, next: any) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const { winnerOddId, result } = req.body;

      if (!winnerOddId) throw new AppError(422, "Missing winner odd id!");
      if (!result) throw new AppError(422, "Missing result!");
      if (!gameId) throw new AppError(422, "Missing game id!");

      const game = await games.findByPk(gameId);
      if (!game) throw new AppError(404, "Game not found");

      let options = await odds.findAll({ where: { gameId: gameId } });
      if (!options) throw new AppError(404, "Game have not odds!");

      //! 1 Obter a odd ganhadora
      let winnerOdd = options.find((option) => option.id === winnerOddId);
      if (!winnerOdd) throw new AppError(404, "Winner odd is not a part of the game!");

      //! 2 Percorrer todas as opções de aposta do jogo e proibir novas apostas
      options.forEach(async (option) => {
         option.status = "lock";
         option.updatedAt = new Date();
         await option.save();
      });

      //! 3 Atualizar o jogo com os dados do resultado
      game.status = "closed";
      game.winnerOddId = winnerOddId;
      game.result = result;
      game.updatedAt = new Date();
      await game.save();

      //! 4 Atualizar opções de aposta do jogo caso tenha ocorrido alguma mudança entre a busca inicial e a atualização
      options = await odds.findAll({ where: { gameId: gameId } });
      winnerOdd = options.find((option) => option.id === winnerOddId);
      if (!winnerOdd) throw new AppError(404, "Winner odd is not a part of the game!");

      //! 5 Preparar armazenamento de estáticas do jogo
      const Statistics = {
         sumBets: 0,
         betAmount: 0,
         winnersAmount: 0,
         lossesAmount: 0,
         profit: 0,
         commission: 0,
      };

      //! 6 Processar comissões do time ganhador
      if (winnerOdd.teamId != 0) {
         const winTeam = await teams.findOne({ where: { id: winnerOdd.teamId } });
         const commission = Number(winnerOdd.amount) * 0.01; //! 1% de comissão
         if (winTeam) {
            if (winTeam.adminId != null) {
               const wallet = await wallets.findOne({ where: { userId: winTeam.adminId } });
               Statistics.commission = commission;
               if (!wallet) {
                  await wallets.create({
                     userId: winTeam.adminId,
                     balance: commission,
                     blocked: 0,
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
            logger.error(
               `Team ${winnerOdd.teamId} not found by game winner odd ${winnerOddId} process the commission ${commission}!`
            );
      }

      //! Obter todas as apostas do jogo
      const searchOdds = options.map((option) => option.id!);
      if (!searchOdds || searchOdds.length === 0) throw new AppError(401, "Game not have bets!");
      const apostas = await bets.findAll({ where: { oddId: { [Op.in]: searchOdds } } });

      //! Atualizar as apostas com o resultado do jogo
      for (let i = 0; i < apostas.length; i++) {
         const aposta = apostas[i] as IBetModel;
         aposta.status = "completed";
         aposta.result = aposta.oddId === winnerOddId ? "win" : "lose";
         aposta.updatedAt = new Date();
         await aposta.save();

         Statistics.sumBets++;
         Statistics.betAmount += aposta.amount;

         const userWallet = await wallets.findOne({ where: { userId: aposta.userId } });
         //! Caso não encontre a carteira do usuário, salvar informações de erro no log para recuperação posterior
         if (!userWallet) {
            logger.error(`User ID:${aposta.userId} wallet to process the BET: ${aposta.id} in GAME: ${game.id} was not found,
            BET_AMOUNT: ${aposta.amount}, BET_PAYOUT: ${aposta.payout}, BET_RESULT: ${aposta.result}, BET_ODD_ID: ${aposta.oddId}
            GAME_WINNER_ODD_ID: ${winnerOddId}`);
            continue;
         }

         //! Atualizar o saldo do usuário de acordo com o resultado da sua aposta
         if (aposta.oddId === winnerOddId) {
            const profit = Number(aposta.amount) * Number(aposta.payout);
            userWallet.balance = Number(userWallet.balance) + profit;
            Statistics.winnersAmount += profit;
         } else Statistics.lossesAmount += aposta.amount;

         userWallet.blocked = Number(userWallet.blocked) - Number(aposta.amount);
         if (userWallet.blocked < 0) userWallet.blocked = 0;
         userWallet.updatedAt = new Date();
         await userWallet.save();
      }

      Statistics.profit = Statistics.winnersAmount - Statistics.lossesAmount;
      res.status(200).json({ message: "Game processed successfully!", statistics: Statistics });
   } catch (error) {
      next(error);
   }
}

