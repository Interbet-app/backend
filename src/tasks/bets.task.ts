import { Op } from "sequelize";
import { bets, IBetModel, notifications, odds, wallets } from "../models";
import logger from "../log";
import { INotification } from "../interfaces";

type Wallet = {
   userId: number;
   balance: number;
   bonus: number;
};

const WALLETS = [] as Wallet[];
const NOTIFICATIONS = [] as INotification[];

export async function CrediteUserBets() {
   try {
      //% 1 -> processar apostas únicas
      const apostas = await bets.findAll({ where: { paid: false, result: { [Op.not]: "pendent" }, group: "0" } });
      const result = await bets.findAll({ where: { paid: false, group: { [Op.not]: "0" }, result: { [Op.not]: "pendent" } } });

      apostas.forEach(async (bet: IBetModel) => {
         if (bet.result === "win") {
            let profit = 0; //? lucro em saldo da aposta
            let bonus = 0; //? lucro em bônus da aposta

            const BonusValue = Number(bet.amount) * (Number(bet.bonusPercent) / 100); //? valor da aposta que é bonus
            const BalanceValue = Number(bet.amount) - Number(BonusValue); //? valor da aposta que é saldo

            bonus = BonusValue * Number(bet.payout); //? lucro total do bonus
            profit = BalanceValue * Number(bet.payout); //? lucro total do saldo
            profit += (Number(bonus) - Number(BonusValue)) * 0.25; //? 25% do lucro em bônus vira saldo
            bonus = (Number(bonus) - Number(BonusValue)) * 0.75; //? 75% do lucro em bônus permanece como bônus

            //? memorizar atualização de saldo do usuário
            logger.warn(`Usuário ${bet.userId} ganhou ${profit} de saldo e ${bonus} de bonus na aposta de ID ${bet.id}`);
            const index = WALLETS.findIndex((wallet) => wallet.userId === bet.userId);
            if (index === -1) WALLETS.push({ userId: bet.userId, balance: profit, bonus });
            else {
               WALLETS[index].balance += profit;
               WALLETS[index].bonus += bonus;
            }
            const odd = await odds.findOne({ where: { id: bet.oddId } });
            let msg = `Parabéns, você ganhou R$${profit.toFixed(2)} reais`;
            if (bonus > 0) msg += `, e R$${bonus.toFixed(2)} de bônus`;

            //? memorizar um notificação para o usuário sobre a vitoria
            NOTIFICATIONS.push({
               userId: Number(bet.userId),
               title: bonus <= 0 ? "Vitória" : "Vitória com Bônus",
               message: msg + ` na aposta ${odd?.name}!`,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }
         bet.paid = true;
         bet.updatedAt = new Date();
         await bet.save();
      });

      //% 2 -> processar apostas múltiplas
      let groups = result.map((aposta) => aposta.group);
      groups = [...new Set(groups)];
      groups.forEach(async (group) => {
         let isWinner = true;
         let payoutSum = 0;
         let amountSum = 0;
         let bonusSum = 0;
         let userId = -1;

         result.forEach(async (bet: IBetModel) => {
            if (bet.group !== group) {
               if (bet.result !== "win") isWinner = false;
               bonusSum += Number(bet.amount) * (Number(bet.bonusPercent) / 100); //? valor da aposta que é bonus
               amountSum += Number(bet.amount) - Number(bonusSum); //? valor da aposta que é saldo
               payoutSum += Number(bet.payout);
               userId = bet.userId;

               bet.paid = true;
               bet.updatedAt = new Date();
               await bet.save();
            }
         });

         if (isWinner) {
            let profit = 0; //? lucro
            let bonus = 0; //? bônus

            bonus = Number(bonusSum) * Number(payoutSum); //? lucro + bônus
            profit = Number(amountSum) * Number(payoutSum); //? lucro + saldo * payout
            profit += (Number(bonus) - Number(bonusSum)) * 0.25; //? 25% do lucro no bônus vira saldo
            bonus = (Number(bonus) - Number(bonusSum)) * 0.75; //? 75% do lucro no bônus continua bônus

            //? memorizar atualização de saldo do usuário
            logger.warn(`Usuário ${userId} ganhou ${profit} de saldo e ${bonus} de bônus na aposta múltipla do grupo ${group}`);
            const index = WALLETS.findIndex((wallet) => wallet.userId === userId);
            if (index === -1) WALLETS.push({ userId, balance: profit, bonus });
            else {
               WALLETS[index].balance += profit;
               WALLETS[index].bonus += bonus;
            }

            let msg = `Parabéns, você ganhou R$${profit.toFixed(2)} reais`;
            if (bonus > 0) msg += `, e R$${bonus.toFixed(2)} de bônus`;

            //? memorizar um notificação para o usuário sobre a vitoria
            NOTIFICATIONS.push({
               userId: Number(userId),
               title: bonus <= 0 ? "Vitória" : "Vitória com Bônus",
               message: msg + ` na sua aposta múltipla!`,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }
      });

      //% 3 -> atualizar saldo dos usuários
      WALLETS.forEach(async (wallet) => {
         const userWallet = await wallets.findOne({ where: { userId: Number(wallet.userId) } });
         if (userWallet) {
            userWallet.balance = Number(userWallet.balance) + Number(wallet.balance);
            userWallet.bonus = Number(userWallet.bonus) + Number(wallet.bonus);
            userWallet.updatedAt = new Date();
            await userWallet.save();
         } else 
            await wallets.create({
               userId: Number(wallet.userId),
               balance: Number(wallet.balance),
               bonus: Number(wallet.bonus),
               score: 0,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         
         //! salvar log
         logger.warn(`Saldo do usuário ${wallet.userId} foi adicionado em ${wallet.balance} reais e ${wallet.bonus} de bônus`);
      });
      WALLETS.length = 0;

      //% 4 -> enviar notificações para os usuários
      await notifications.bulkCreate(NOTIFICATIONS);

      //% 5 -> limpando cache
      NOTIFICATIONS.length = 0;
   } catch (error) {
      logger.error(error);
   }
}
