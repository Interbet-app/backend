import { NextFunction, Request, Response } from "express";
import { Jwt, Token } from "../auth";
import sequelize, { Op } from "sequelize";
import { odds, bets, games, users } from "../models";
import { IBet, IGame, NewBet } from "../interfaces";
import { RefreshOddsPayout } from "../functions";
import { PlaceBet, GetBalance } from "../services/betmotion";
import { Cache } from "../cache";
import AppError from "../error";

export async function GetUserBets(_req: Request, res: Response, next: NextFunction) {
   try {
      const { userId } = (await Jwt.getLocals(res, next)) as Token;
      const result = await bets.findAll({ where: { userId: userId } });
      res.status(200).json({ bets: result as IBet[] });
   } catch (error) {
      next(error);
   }
}
export async function GetAnyUserBets(req: Request, res: Response, next: NextFunction) {
   try {
      const id = req.params.userId;
      const result = await bets.findAll({ where: { userId: id } });
      res.status(200).json({ bets: result as IBet[] });
   } catch (error) {
      next(error);
   }
}
export async function GetBets(_req: Request, res: Response, next: NextFunction) {
   try {
      const result = await bets.findAll();
      res.status(200).json({ bets: result as IBet[] });
   } catch (error) {
      next(error);
   }
}
export async function BetPlaceBet(req: Request, res: Response, next: NextFunction) {
   try {
      const { amount, betId, gameId, oddValue, userToken } = req.body;
      const response = await PlaceBet({
         amount,
         betId,
         gameId,
         oddValue,
         userToken,
      });
      res.status(201).json(response);
   } catch (error) {
      next(error);
   }
}
export async function CreateBet(req: Request, res: Response, next: NextFunction) {
   try {
      const { oddId, amount } = req.body;
      const { userId } = Jwt.getLocals(res, next) as Token;

      const user = await users.findByPk(userId);
      if (!user) throw new AppError(404, "Usuário não encontrado!");
      if(user.name == "root") throw new AppError(400, "Usuário administrador não pode apostar!");

      const userBalance = await GetBalance(user.betmotionUserToken!);
      const balance = Number(userBalance?.balance) / 100;
      const globalMaxBetAmount = parseFloat(Cache.get(`settings.userMaxBetAmount`) || "0");

      const odd = await odds.findByPk(oddId);
      if (!odd) throw new AppError(404, "Opção não encontrada!");
      if (odd.status !== "open") throw new AppError(400, "Opção não está mais disponível");
      if (parseFloat(amount) > Number(balance)) throw new AppError(400, "Usuário não tem saldo suficiente!");
      if (parseFloat(amount) > Number(odd.maxBetAmount)) throw new AppError(400, "Essa aposta excede o limite");
      if (user.maxBetAmount && parseFloat(amount) > Number(user.maxBetAmount)) throw new AppError(400, "Essa aposta excede o limite");
      if (parseFloat(amount) > globalMaxBetAmount) throw new AppError(400, "Essa aposta excede o limite");

      const gameOdds = await odds.findAll({ where: { gameId: odd.gameId } });
      const ids = gameOdds.map((odd) => odd.id!);
      const userGameBetAmount = await bets.sum("amount", { where: { userId: userId, oddId: { [Op.in]: ids } } }) as number;
      if (user.maxBetAmount && (userGameBetAmount + amount) > Number(user.maxBetAmount)) throw new AppError(400, "Essa aposta excede o limite");

      const game = await games.findByPk(odd.gameId);
      if (!game) return res.status(404).json({ message: "Jogo não encontrado!" });
      if (game.status !== "open") return res.status(400).json({ message: "Jogo não está mais disponível" });
      if (game.startDate < new Date()) return res.status(400).json({ message: "Jogo não está mais disponível" });

      const bet = await bets.create({
         userId: user.id!,
         oddId: oddId,
         amount: Number(amount),
         payout: Number(odd.payout),
         status: "pendent",
         result: "pendent",
         bonusPercent: 30,
         group: "0",
         paid: false,
         award: amount > 15 ? "pending" : "not",
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!bet) throw new AppError(500, "Aposta não foi criada!");

      const response = await PlaceBet({
         amount: Number(amount),
         betId: Number(bet.id),
         gameId: Number(game.id),
         oddValue: odd.payout,
         userToken: user.betmotionUserID! + new Date().getTime(),
      });

      odd.amount = Number(odd.amount) + parseFloat(amount);
      odd.payment = Number(odd.payment) + (parseFloat(amount) + parseFloat(amount) * odd.payout);
      odd.bets = Number(odd.bets) + 1;
      odd.updatedAt = new Date();
      await odd.save();

      //! atualizar payout das odds
      const oddToUpdate = await odds.findAll({ where: { gameId: odd.gameId, teamId: { [Op.not]: 0 } } });
      const balances = oddToUpdate.map((odd) => Number(odd.payment));
      const startPayOuts = oddToUpdate.map((odd) => Number(odd.startPayOut));
      if (balances.length == 2) {
         const newPayout = RefreshOddsPayout(balances);
         oddToUpdate.forEach((odd, index) => {
            odd.payout = startPayOuts[index] ? (newPayout[index] + startPayOuts[index]) / 2 : newPayout[index];
            odd.updatedAt = new Date();
            odd.save();
         });
      }

      res.status(201).json({ ...response, id: bet.id });
   } catch (error) {
      next(error);
   }
}
export async function CreateMultipleBets(req: Request, res: Response, next: NextFunction) {
   try {
      const Bets = req.body as NewBet[];
      const { userId } = Jwt.getLocals(res, next) as Token;

      const user = await users.findByPk(userId);
      if (!user) throw new AppError(404, "Usuário não encontrado!");

      const userBalance = await GetBalance(user.betmotionUserToken!);
      const balance = Number(userBalance?.balance) / 100;
      const globalMaxBetAmount = parseFloat(Cache.get(`settings.userMaxBetAmount`) || "0");

      const sumAmount = Bets.reduce((prev, cur) => Number(prev) + Number(cur.amount), 0);
      if (sumAmount > Number(balance)) throw new AppError(400, "Usuário não tem saldo suficiente!");
      if (user.maxBetAmount && sumAmount > Number(user.maxBetAmount))
         throw new AppError(400, "Valor máximo de aposta do usuário excedido!");
      if (sumAmount > globalMaxBetAmount) throw new AppError(400, "Valor máximo de aposta da plataforma excedido!");

      const oddsIds = Bets.map((bet) => bet.oddId);
      const options = await odds.findAll({ where: { id: { [Op.in]: oddsIds } } });
      const gameIds = options.map((option) => option.gameId);

      //! Evitar apostas em duas opções de um mesmo jogo, ja que não haveria chance de vitória neste caso
      const removeDuplicateGames = [...new Set(gameIds)];
      if (gameIds.length != removeDuplicateGames.length) throw new AppError(400, "Voce não pode apostar em duas opções do mesmo jogo!");

      //! Verificar se os jogos estão abertos
      const jogos = await games.findAll({ where: { id: { [Op.in]: gameIds } } });
      jogos.forEach((jogo) => {
         if (jogo.status !== "open") return res.status(400).json({ message: "Jogo não está mais disponível" });
         if (jogo.startDate < new Date()) return res.status(400).json({ message: "Jogo não está mais disponível" });
      });

      //! Verificar se os valores das apostas são menores que o valor máximo de opção
      Bets.forEach((bet) => {
         const odd = options.find((option) => option.id === bet.oddId);
         if (odd) {
            if (bet.amount > Number(odd.maxBetAmount)) throw new AppError(400, "Valor máximo de aposta excedido!");
            if (odd.status !== "open") throw new AppError(400, "Opção não está mais disponível");
         }
      });

      //? Criar apostas
      const created = [] as IBet[];
      const group = Date.now().toString();

      Bets.forEach(async (bet: NewBet) => {
         //% Obter valor atualizado da odd
         const odd = await odds.findByPk(bet.oddId);
         if (!odd) throw new AppError(404, "Opção não encontrada!");

         //% atualizar a odd com os valores da aposta
         odd.amount = Number(odd.amount) + Number(bet.amount);
         odd.payment = Number(odd.payment) + (Number(bet.amount) + Number(bet.amount) * odd.payout);
         odd.bets = Number(odd.bets) + 1;
         odd.updatedAt = new Date();
         await odd.save();

         //! atualizar payout das odds
         const oddToUpdate = await odds.findAll({ where: { gameId: odd.gameId, teamId: { [Op.not]: 0 } } });
         const balances = oddToUpdate.map((odd) => Number(odd.payment));
         const startPayOuts = oddToUpdate.map((odd) => Number(odd.startPayOut));
         if (balances.length == 2) {
            const newPayout = RefreshOddsPayout(balances);
            oddToUpdate.forEach((odd, index) => {
               odd.payout = startPayOuts[index] ? (newPayout[index] + startPayOuts[index]) / 2 : newPayout[index];
               odd.updatedAt = new Date();
               odd.save();
            });
         }

         //% Salvar aposta
         const result = await bets.create({
            userId: user.id!,
            oddId: bet.oddId,
            amount: Number(bet.amount),
            payout: Number(odd.payout),
            status: "pendent",
            result: "pendent",
            award: bet.amount > 15 ? "pending" : "not",
            bonusPercent: 30,
            paid: false,
            group: group,
            createdAt: new Date(),
            updatedAt: new Date(),
         });

         //% Enviar aposta para a Betmotion
         await PlaceBet({
            amount: Number(bet.amount),
            betId: Number(result.id),
            gameId: Number(odd.gameId),
            oddValue: odd.payout,
            userToken: user.betmotionUserToken!,
         });

         return created.push(result as IBet);
      });

      res.status(200).json(created);
   } catch (error) {
      next(error);
   }
}
export async function DeleteBet(req: Request, res: Response, next: NextFunction) {
   try {
      const betId = parseInt(req.params.id, 10);
      await bets.destroy({ where: { id: betId } });
      res.status(200).json({
         message: "Aposta excluída com sucesso!, mas o saldo do usuário não foi retornado! se necessário, pode ser feito manualmente.",
      });
   } catch (error) {
      next(error);
   }
}
export async function GetBetsSum(_req: Request, res: Response, next: NextFunction) {
   try {
      const amount = await bets.sum("amount");
      res.status(200).json({ amount: amount });
   } catch (error) {
      next(error);
   }
}
export async function GetBetsByGame(req: Request, res: Response, next: NextFunction) {
   try {
      const gameId = parseInt(req.params.id, 10);
      const data = await odds.findAll({ where: { gameId: gameId } });
      if (!data) throw new AppError(404, "Opções não encontradas!");
      const searchOdds = data.map((odd) => odd.id!);
      const result = await bets.findAll({ where: { oddId: { [Op.in]: searchOdds } } });
      res.status(200).json({ bets: result as IBet[] });
   } catch (error) {
      next(error);
   }
}
export async function GetUsersBetsInfo(req: Request, res: Response, next: NextFunction) {
   try {
      const orderBy = req.query.orderBy || "totalBet";
      const result = await bets.findAll({
         attributes: [
            "userId",
            [sequelize.fn("COUNT", sequelize.col("userId")), "totalBet"],
            [sequelize.fn("SUM", sequelize.cast(sequelize.col("amount"), "FLOAT")), "totalAmount"],
            [
               sequelize.literal(`
             CAST(
               (SELECT SUM(CASE WHEN result = 'win' THEN amount * payout ELSE 0 END)
               FROM bets AS b
               WHERE b.userId = bets.userId
               GROUP BY b.userId
               ) AS FLOAT
             )`),
               "totalEarn",
            ],
            [
               sequelize.literal(`
           CONCAT(
            CAST(
              COALESCE(
                (SELECT COUNT(*) 
                FROM bets AS b
                WHERE b.userId = bets.userId AND result = 'win'
                GROUP BY b.userId
                ), 0
              ) AS FLOAT
            ),
            '/',
            CAST(
              COALESCE(
                (SELECT COUNT(*) 
                FROM bets AS b
                WHERE b.userId = bets.userId AND result = 'lose'
                GROUP BY b.userId
                ), 0
              ) AS FLOAT
            )
          )
           `),
               "winLoseRatio",
            ],
         ],
         group: ["userId"],
         order: sequelize.literal(`${orderBy} DESC`),
         limit: 10,
      });

      const response = await Promise.all(
         result.map(async (data) => {
            const user = await users.findByPk(data.userId);
            return {
               userId: data.userId,
               totalBet: data.get("totalBet"),
               totalAmount: data.get("totalAmount"),
               totalEarn: data.get("totalEarn"),
               winLoseRatio: data.get("winLoseRatio"),
               userName: user?.name,
            };
         })
      );

      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function GetProfit(_req: Request, res: Response, next: NextFunction) {
   try {
      const result = await bets.findAll({
         attributes: [
            [
               sequelize.literal(`
            SUM(CASE WHEN result = 'win' THEN -amount * payout
            WHEN result = 'lose' THEN amount
            ELSE 0 END
            )`),
               "profit",
            ],
         ],
      });
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
}
export async function GetTotalAmountBetByGame(_req: Request, res: Response, next: NextFunction) {
   try {
      const gameData = await games.findAll();

      const result = await Promise.all(
         gameData.map(async (game: IGame) => {
            const gameId = game.id;
            const data = await odds.findAll({ where: { gameId: gameId } });
            if (!data) throw new AppError(404, "Opções não encontradas!");
            const searchOdds = data.map((odd) => odd.id!);

            const betsData: IBet[] = await bets.findAll({ where: { oddId: { [Op.in]: searchOdds } } });
            const totalAmount = betsData.reduce((acc, bet) => acc + Number(bet.amount), 0);
            const profit = betsData.reduce((acc, bet) => {
               if (bet.result === "win") return acc - Number(bet.amount) * bet.payout;
               else if (bet.result === "lose") return acc + Number(bet.amount);
               else return acc;
            }, 0);
            return {
               game: game as IGame,
               totalAmount,
               profit,
            };
         })
      );

      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
}
