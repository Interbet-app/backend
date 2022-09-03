import { Op } from "sequelize";
import { bets, notifications, odds, wallets } from "../models";
import logger from "../log";

export async function CrediteUserBets() {
   try {
      //% 1-> processar apostas únicas
      let apostas = await bets.findAll({
         where: { paid: false, result: { [Op.not]: "pendent" }, group: "0" },
      });

      apostas.forEach(async (aposta) => {
         if (aposta.result === "win") {
            let profit = 0; //? lucro para saldo
            let bonus = 0; //? lucro para bônus

            const bonusAmount = Number(aposta.amount) * (Number(aposta.bonusPercent) / 100); //? valor da aposta que é bonus
            const balanceAmount = Number(aposta.amount) - Number(bonusAmount); //? valor da aposta que é saldo

            bonus = bonusAmount * Number(aposta.payout); //? lucro do bonus
            profit = balanceAmount * Number(aposta.payout); //? lucro do saldo

            profit += bonus * 0.25; //? 25% do bonus vira saldo
            bonus = bonus * 0.75; //? 75% do bonus continua bonus

            const wallet = await wallets.findOne({ where: { userId: aposta.userId } });
            if (wallet) {
               wallet.balance = Number(wallet.balance) + profit;
               wallet.bonus = Number(wallet.bonus) + bonus;
               wallet.updatedAt = new Date();
               await wallet.save();
            } else {
               wallets.create({
                  userId: aposta.userId,
                  balance: profit,
                  bonus: bonus,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  score: 0,
               });
            }

            const odd = await odds.findOne({ where: { id: aposta.oddId } });

            let message = `Parabéns, você ganhou R$${profit.toFixed(2)} reais`;
            if (bonus > 0) message += `, e R$${bonus.toFixed(2)} de bônus`;

            //? criar um notificação para o usuário sobre a vitoria
            await notifications.create({
               userId: aposta.userId,
               title: bonus <= 0 ? "Vitória" : "Vitória com Bônus",
               message: message + `, na aposta em ${odd?.name}`,
               createdAt: new Date(),
               updatedAt: new Date(),
               unread: true,
            });
         }

         aposta.paid = true;
         aposta.updatedAt = new Date();
         await aposta.save();
      });

      //% -> processar apostas múltiplas
      apostas = await bets.findAll({
         where: { paid: false, group: { [Op.not]: "0" } },
      });

      const groups = apostas.map((aposta) => aposta.group);
      const filterGroups = groups;

      groups.forEach((group) => {
         apostas.forEach((aposta) => {
            if (aposta.group === group && aposta.result === "pendent") filterGroups.splice(groups.indexOf(group), 1);
         });
      });

      filterGroups.forEach(async (group) => {
         let isWinner = true;
         let payoutSum = 0;
         let amountSum = 0;
         let bonusSum = 0;
         let userId = -1;
         let name = "";

         for (let i = 0; i < apostas.length; i++) {
            if (apostas[i].group === group) {
               if (apostas[i].result != "win") {
                  isWinner = false;
                  break;
               }

               bonusSum += Number(apostas[i].amount) * (Number(apostas[i].bonusPercent) / 100); //? valor da aposta que é bonus
               amountSum += Number(apostas[i].amount) - Number(bonusSum); //? valor da aposta que é saldo
               payoutSum += Number(apostas[i].payout);
               userId = apostas[i].userId;

               const odd = await odds.findOne({ where: { id: apostas[i].oddId } });
               if (odd) name += " '" + odd.name + "' ";

               apostas[i].paid = true;
               apostas[i].updatedAt = new Date();
               await apostas[i].save();
            }
         }

         if (!isWinner) {
            let profit = 0; //? lucro para saldo
            let bonus = 0; //? lucro para bônus

            bonus = bonusSum * Number(payoutSum); //? lucro do bonus
            profit = amountSum * Number(payoutSum); //? lucro do saldo

            profit += bonus * 0.25; //? 25% do bonus vira saldo
            bonus = bonus * 0.75; //? 75% do bonus continua bonus

            const wallet = await wallets.findOne({ where: { userId: userId } });
            if (wallet) {
               wallet.balance = Number(wallet.balance) + profit;
               wallet.bonus = Number(wallet.bonus) + bonus;
               wallet.updatedAt = new Date();
               await wallet.save();
            } else {
               wallets.create({
                  userId: userId,
                  balance: profit,
                  bonus: bonus,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  score: 0,
               });
            }

            let message = `Parabéns, você ganhou R$${profit.toFixed(2)} reais`;
            if (bonus > 0) message += `, e R$${bonus.toFixed(2)} de bônus`;

            //? criar um notificação para o usuário sobre a vitoria
            await notifications.create({
               userId: userId,
               title: bonus <= 0 ? "Vitória" : "Vitória com Bônus",
               message: message + `, na aposta em ${name}`,
               createdAt: new Date(),
               updatedAt: new Date(),
               unread: true,
            });
         }
      });
   } catch (error) {
      logger.error(error);
   }
}






