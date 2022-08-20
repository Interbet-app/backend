import { Op } from "sequelize";
import { bets, notifications, odds, wallets } from "../models";
import logger from "../log";

export async function CrediteUserBets() {
   try {
      //% 1-> processar apostas únicas
      let apostas = await bets.findAll({
         where: { paid: false, result: { [Op.not]: "pendent" }, group: { [Op.eq]: undefined } },
      });
      apostas.forEach(async (aposta) => {
         if (aposta.result === "win") {
            const wallet = await wallets.findOne({ where: { userId: aposta.userId } });
            if (wallet) {
               wallet.balance += Number(aposta.amount) * Number(aposta.payout);
               wallet.updatedAt = new Date();
               await wallet.save();
            } else {
               wallets.create({
                  userId: aposta.userId,
                  balance: aposta.amount,
                  bonus: 0,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  score: 0,
               });
            }

            const odd = await odds.findOne({ where: { id: aposta.oddId } });
            //? criar um notificação para o usuário sobre a vitoria
            await notifications.create({
               userId: aposta.userId,
               title: "Vitória",
               message: `Parabéns, você ganhou ${aposta.amount} reais, na aposta em ${odd?.name}`,
               unread: true,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }

         aposta.paid = true;
         aposta.updatedAt = new Date();
         await aposta.save();
      });

      //% -> processar apostas múltiplas
      apostas = await bets.findAll({
         where: { paid: false, group: { [Op.not]: undefined } },
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
         let userId = -1;
         let names = "";

         for (let i = 0; i < apostas.length; i++) {
            if (apostas[i].group === group) {
               if (apostas[i].result != "win") {
                  isWinner = false;
                  break;
               }
               payoutSum += Number(apostas[i].payout);
               amountSum += Number(apostas[i].amount);
               userId = apostas[i].userId;

               const odd = await odds.findOne({ where: { id: apostas[i].oddId } });
               if (odd) names += " '"+ odd.name + "' ";

               apostas[i].paid = true;
               apostas[i].updatedAt = new Date();
               await apostas[i].save();
            }
         }

         if (!isWinner) {
            const profit = Number(amountSum) * Number(payoutSum);
            const wallet = await wallets.findOne({ where: { userId: userId } });
            if (wallet) {
               wallet.balance += profit;
               wallet.updatedAt = new Date();
               await wallet.save();
            } else {
               wallets.create({
                  userId: userId,
                  balance: profit,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  score: 0,
                  bonus: 0,
               });
            }

            //? criar um notificação para o usuário sobre a vitória
            await notifications.create({
               userId: userId,
               title: "Vitória Múltiplas",
               message: `Parabéns, você ganhou ${profit} reais, nas apostas em ${names}`,
               unread: true,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }
      });
   } catch (error) {
      logger.error(error);
   }
}




