import { Op } from "sequelize";
import { bets, IBetModel, notifications, odds, wallets } from "../models";
import logger from "../log";

export async function CrediteUserBets() {
   try {
      //% 1-> processar apostas únicas
      const apostas = await bets.findAll({ where: { paid: false, result: { [Op.not]: "pendent" }, group: "0" }});
      const usersIds = [] as number[];

      apostas.forEach(async (aposta: IBetModel) => {
         if (aposta.result === "win") {
            if (usersIds.indexOf(aposta.userId) === -1) {
               usersIds.push(aposta.userId);

               let balance = 0; //? lucro em saldo da aposta
               let bonus = 0; //? lucro em bônus da aposta

               const BonusValue = Number(aposta.amount) * (Number(aposta.bonusPercent) / 100); //? valor da aposta que é bonus
               const BalanceValue = Number(aposta.amount) - Number(BonusValue); //? valor da aposta que é saldo

               bonus = BonusValue * Number(aposta.payout); //? lucro do bonus
               balance = BalanceValue * Number(aposta.payout); //? lucro do saldo

               balance += Number(bonus) * 0.25; //? 25% do lucro em bônus vira saldo
               bonus = Number(bonus) * 0.75; //? 75% do lucro em bônus permanece como bônus

               const wallet = await wallets.findOne({ where: { userId: Number(aposta.userId) } });
               if (wallet != null) {
                  wallet.balance = Number(wallet.balance) + Number(balance);
                  wallet.bonus = Number(wallet.bonus) + Number(bonus);
                  wallet.updatedAt = new Date();
                  await wallet.save();
               } else {
                  await wallets.create({
                     userId: aposta.userId,
                     balance: Number(balance),
                     bonus: Number(bonus),
                     createdAt: new Date(),
                     updatedAt: new Date(),
                     score: 0,
                  });
               }

               const odd = await odds.findOne({ where: { id: aposta.oddId } });
               let msg = `Parabéns, você ganhou R$${balance.toFixed(2)} reais`;
               if (bonus > 0) msg += `, e R$${bonus.toFixed(2)} de bônus`;

               //? criar um notificação para o usuário sobre a vitoria
               await notifications.create({
                  userId: aposta.userId,
                  title: bonus <= 0 ? "Vitória" : "Vitória com Bônus",
                  message: msg + `, na aposta em ${odd?.name}`,
                  createdAt: new Date(),
                  updatedAt: new Date(),
               });
            }
         }

         aposta.paid = true;
         aposta.updatedAt = new Date();
         await aposta.save();
      });

      // //% -> processar apostas múltiplas
      // apostas = await bets.findAll({
      //    where: { paid: false, group: { [Op.not]: "0" }, result: { [Op.not]: "pendent" } },
      // });

      // const groups = apostas.map((aposta) => aposta.group);
      // const filterGroups = groups;

      // groups.forEach((group) => {
      //    apostas.forEach((aposta: IBetModel) => {
      //       if (aposta.group === group && aposta.result === "pendent") filterGroups.splice(groups.indexOf(group), 1);
      //    });
      // });

      // filterGroups.forEach(async (group) => {
      //    let isWinner = true;
      //    let payoutSum = 0;
      //    let amountSum = 0;
      //    let bonusSum = 0;
      //    let userId = -1;
      //    let name = "";

      //    for (let i = 0; i < apostas.length; i++) {
      //       if (apostas[i].group === group) {
      //          if (apostas[i].result != "win") {
      //             isWinner = false;
      //             break;
      //          }

      //          bonusSum += Number(apostas[i].amount) * (Number(apostas[i].bonusPercent) / 100); //? valor da aposta que é bonus
      //          amountSum += Number(apostas[i].amount) - Number(bonusSum); //? valor da aposta que é saldo
      //          payoutSum += Number(apostas[i].payout);
      //          userId = apostas[i].userId;

      //          const odd = await odds.findOne({ where: { id: apostas[i].oddId } });
      //          if (odd) name += " '" + odd.name + "' ";

      //          apostas[i].paid = true;
      //          apostas[i].updatedAt = new Date();
      //          await apostas[i].save();
      //       }
      //    }

      //    if (!isWinner) {
      //       let profit = 0; //? lucro para saldo
      //       let bonus = 0; //? lucro para bônus

      //       bonus = Number(bonusSum) * Number(payoutSum); //? lucro do bonus
      //       profit = Number(amountSum) * Number(payoutSum); //? lucro do saldo

      //       profit += Number(bonus) * 0.25; //? 25% do bonus vira saldo
      //       bonus = Number(bonus) * 0.75; //? 75% do bônus continua bônus

      //       const wallet = await wallets.findOne({ where: { userId: userId } });
      //       if (wallet) {
      //          wallet.balance = Number(wallet.balance) + Number(profit);
      //          wallet.bonus = Number(wallet.bonus) + Number(bonus);
      //          wallet.updatedAt = new Date();
      //          await wallet.save();
      //       } else {
      //          await wallets.create({
      //             userId: userId,
      //             balance: Number(profit),
      //             bonus: Number(bonus),
      //             createdAt: new Date(),
      //             updatedAt: new Date(),
      //             score: 0,
      //          });
      //       }

      //       let message = `Parabéns, você ganhou R$${profit.toFixed(2)} reais`;
      //       if (bonus > 0) message += `, e R$${bonus.toFixed(2)} de bônus`;

      //       //? criar um notificação para o usuário sobre a vitoria
      //       await notifications.create({
      //          userId: userId,
      //          title: bonus <= 0 ? "Vitória" : "Vitória com Bônus",
      //          message: message + `, na aposta em ${name}`,
      //          createdAt: new Date(),
      //          updatedAt: new Date(),
      //       });
      //    }
      // });
   } catch (error) {
      logger.error(error);
   }
}
