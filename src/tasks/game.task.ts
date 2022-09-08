import { Op } from "sequelize";
import { games, notifications, odds, teams, wallets } from "../models";
import logger from "../log";

export async function CrediteCommissions() {
   try {
      const jogos = await games.findAll({
         where: {
            status: "closed",
            winnerCommission: {
               [Op.ne]: -1,
            },
         },
      });

      for (let i = 0; i < jogos.length; i++) {
         if (jogos[i].winnerOddId) {
            const odd = await odds.findOne({ where: { id: jogos[i].winnerOddId } });
            if (!odd) continue;

            const team = await teams.findOne({ where: { id: odd.teamId } });
            if (!team || team.adminId == null) return;

            const commission = Number(odd.amount) * (Number(jogos[i].winnerCommission) / 100);
            if (commission > 0) {
               const wallet = await wallets.findOne({ where: { userId: team.adminId } });
               if (!wallet) {
                  await wallets.create({
                     userId: team.adminId,
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
               //? notificar administrador do time sobre a comissão recebida
               await notifications.create({
                  userId: team.adminId,
                  title: "Bonificação por vitória",
                  message: `Seu time recebeu R$ ${commission} referente a vitória no jogo ${jogos[i].name}.`,
                  createdAt: new Date(),
                  updatedAt: new Date(),
               });

               jogos[i].winnerCommission = -1;
               await jogos[i].save();
            }
         }
      }
   } catch (error) {
      logger.error("Erro processar comissões do jogo " + error);
   }
}

export async function CloseGames() {
   try {
      const jogos = await games.findAll({ where: { status: "open" } });
      jogos.forEach(async (jogo) => {
         if (jogo.startDate < new Date()) {
            jogo.status = "pendent";
            jogo.updatedAt = new Date();
            await jogo.save();
         }
      });
   } catch (error) {
      console.log(error);
   }
}

