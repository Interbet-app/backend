import { Request, Response } from "express";
import { Op } from "sequelize";
import { athletics, wallets, teams, odds, bets } from "../models";
import { IBet, NewBet } from "../interfaces";
import { Jwt, Token } from "../auth";
import AppError from "../error";

export async function GetUserBets(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const result = await bets.findAll({ where: { userId: token.userId } });
      res.status(200).json({ bets: result as IBet[] });
   } catch (error) {
      next(error);
   }
}
export async function GetBets(_req: Request, res: Response, next: any) {
   try {
      const result = await bets.findAll();
      res.status(200).json({ bets: result as IBet[] });
   } catch (error) {
      next(error);
   }
}
export async function CreateBet(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const wallet = await wallets.findOne({ where: { userId: token.userId } });
      if (!wallet) throw new AppError(404, "Carteira do usuário não encontrada!");

      const { oddId, amount } = req.body;
      const odd = await odds.findByPk(oddId);
      if (!odd) throw new AppError(404, "Opção não encontrada!");
      if (odd.status !== "open") throw new AppError(400, "Opção não está mais disponível");
      if (parseFloat(amount) > Number(wallet.balance)) throw new AppError(400, "Usuário não tem saldo suficiente!");
      if (parseFloat(amount) > Number(odd.maxBetAmount)) throw new AppError(400, "Valor máximo de aposta excedido!");

      const bet = await bets.create({
         userId: token.userId,
         oddId: oddId,
         amount: amount,
         payout: odd.payout,
         status: "pendent",
         result: "pendent",
         group: "0",
         paid: false,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      if (!bet) throw new AppError(500, "Aposta não foi criada!");

      odd.amount = Number(odd.amount) + parseFloat(amount);
      odd.payment = Number(odd.payment) + (parseFloat(amount) + parseFloat(amount) * odd.payout);
      odd.bets = Number(odd.bets) + 1;
      odd.updatedAt = new Date();
      await odd.save();

      //% atualizar carteira do usuário
      let resAmount = Number(amount);
      //? Se o usuário tiver bonus, usar ele primeiro
      if (wallet.bonus > 0) {
         const rest = Number(wallet.bonus) - resAmount;
         if (rest >= 0) {
            wallet.bonus = rest;
            resAmount = 0;
         } else {
            wallet.bonus = 0;
            resAmount = Math.abs(rest);
         }
      }
      wallet.balance = Number(wallet.balance) - resAmount;
      wallet.updatedAt = new Date();
      await wallet.save();

      //! Não é odd de empate
      if (odd.teamId > 0) {
         const team = await teams.findOne({ where: { id: odd.teamId } });
         if (team) {
            const athletic = await athletics.findByPk(team.athleticId);
            if (athletic && athletic.adminId) {
               const wallet = await wallets.findOne({ where: { userId: athletic.adminId } });
               const commission = Number(amount) * 0.01; //! 1% de comissão para a atlética
               if (wallet) {
                  wallet.balance = Number(wallet.balance) + Number(commission);
                  wallet.updatedAt = new Date();
                  await wallet.save();
               }
            }
         }
      }
      res.status(201).json(bet as IBet);
   } catch (error) {
      next(error);
   }
}
export async function CreateMultipleBets(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const wallet = await wallets.findOne({ where: { userId: token.userId } });
      if (!wallet) throw new AppError(404, "Carteira do usuário não encontrada!");

      const Bets = req.body as NewBet[];
      const sumAmount = Bets.reduce((prev, cur) => prev + cur.amount, 0);
      if (sumAmount > (Number(wallet.balance) + Number(wallet.bonus))) throw new AppError(400, "Usuário não tem saldo suficiente!");

      const oddsIds = Bets.map((bet) => bet.oddId);
      const options = await odds.findAll({ where: { id: { [Op.in]: oddsIds } } });
      const gameIds = options.map((option) => option.gameId);

      //! Evitar apostas em duas opções de um mesmo jogo, ja que não haveria chance de vitória neste caso
      const removeDuplicateGames = [...new Set(gameIds)];
      if (gameIds.length != removeDuplicateGames.length)
         throw new AppError(400, "Voce não pode apostar em duas opções do mesmo jogo!");

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

         //% atualizar carteira do usuário
         let resAmount = Number(bet.amount);
         //? Se o usuário tiver bonus, usar ele primeiro
         if (wallet.bonus > 0) {
            const rest = Number(wallet.bonus) - resAmount;
            if (rest >= 0) {
               wallet.bonus = rest;
               resAmount = 0;
            } else {
               wallet.bonus = 0;
               resAmount = Math.abs(rest);
            }
         }
         wallet.balance = Number(wallet.balance) - resAmount;
         wallet.updatedAt = new Date();
         await wallet.save();

         //% atualizar a odd com os valores da aposta
         odd.amount = Number(odd.amount) + Number(bet.amount);
         odd.payment = Number(odd.payment) + (Number(bet.amount) + Number(bet.amount) * odd.payout);
         odd.bets = Number(odd.bets) + 1;
         odd.updatedAt = new Date();
         await odd.save();

         //% creditar comissão para a atlética
         if (odd.teamId > 0) {
            const team = await teams.findOne({ where: { id: odd.teamId } });
            if (team) {
               const athletic = await athletics.findByPk(team.athleticId);
               if (athletic && athletic.adminId) {
                  const wallet = await wallets.findOne({ where: { userId: athletic.adminId } });
                  const commission = Number(bet.amount) * 0.01; //! 1% de comissão para a atlética
                  if (wallet) {
                     wallet.balance = Number(wallet.balance) + Number(commission);
                     wallet.updatedAt = new Date();
                     await wallet.save();
                  }
               }
            }
         }

         //% Salvar aposta
         const result = await bets.create({
            userId: token.userId,
            oddId: bet.oddId,
            amount: Number(bet.amount),
            payout: Number(odd.payout),
            status: "pendent",
            result: "pendent",
            paid: false,
            group: group,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
         return created.push(result as IBet);
      });

      res.status(200).json(created);
   } catch (error) {
      next(error);
   }
}
export async function DeleteBet(req: Request, res: Response, next: any) {
   try {
      const betId = parseInt(req.params.id, 10);
      await bets.destroy({ where: { id: betId } });
      res.status(200).json({
         message:
            "Aposta excluída com sucesso!, mas o saldo do usuário não foi retornado! se necessário, pode ser feito manualmente.",
      });
   } catch (error) {
      next(error);
   }
}
export async function GetBetsByGame(req: Request, res: Response, next: any) {
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
