import logger from "../log";
import { odds, bets, games, users } from "../models";
import { BetWinner, BetLoss } from "../services/betmotion";

export async function BetmotionNotificationTask() {
   try {
      const bets_to_process = await bets.findAll({ where: { betmotion: false } });

      for (const bet of bets_to_process) {
         const user = await users.findByPk(bet.userId);
         if (!user) {
            logger.error(
               `Usuário '${bet.userId}' não foi encontrado para atualizar BetMotion! BetId:${bet.id}, OddId:${bet.oddId} Amount:${bet.amount} Result:${bet.result}`
            );
            continue;
         }

         const odd = await odds.findOne({ where: { id: bet.oddId } });
         const game = await games.findOne({ where: { id: odd?.gameId } });

         if (!game || !odd) {
            logger.error(`Jogo ou Odd não encontrado para atualizar BetMotion! BetId:${bet.id}, OddId:${bet.oddId} Amount:${bet.amount} Result:${bet.result}`);
            continue;
         }

         //! -> atualizar BetMotion
         const amount = (Number(bet.amount) * Number(bet.payout)) as number;
         try {
            if (bet.result === "win") await BetWinner(bet.id!, user.betmotionUserID!, amount, game.name);
            else await BetLoss(bet.id!, user.betmotionUserID!, game.name);
            bet.betmotion = true;
            await bet.save();
         } catch (error) {
            logger.error(`Erro ao atualizar BetMotion! BetId:${bet.id}, OddId:${bet.oddId} Amount:${bet.amount} Result:${bet.result}`);
             logger.error(error);
             continue;
         }
      }
   } catch (error) {
      logger.error(error);
   }
}
