import { deposits, wallets, notifications, IDepositModel } from "../models";
import logger from "../log";

export async function CrediteCompletedDeposits() {
   try {
      const result = await deposits.findAll({
         where: {
            status: "pendent",
            externalStatus: "COMPLETED",
         },
      });

      result.forEach(async (deposit: IDepositModel) => {
         let bonus = 0;
         let wallet = await wallets.findOne({ where: { userId: deposit.userId } });
         if (wallet == null) {
            wallet = await wallets.create({
               userId: deposit.userId,
               balance: 0,
               bonus: 0,
               score: 0,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }
         // % verificar se é o primeiro depósito concluído, caso seja creditar 50% do valor como bônus
         const data = await deposits.count({ where: { userId: deposit.userId, status: "completed" } });
         if (data < 1) bonus = Number(deposit.amount) * 0.5; //! 50% de bonus
         wallet.balance = Number(wallet.balance) + Number(deposit.amount) + Number(bonus);
         wallet.updatedAt = new Date();
         await wallet.save();

         const notification = [
            {
               userId: deposit.userId,
               title: "Depósito confirmado!",
               message: `Seu depósito de R$ ${deposit.amount} foi confirmado com sucesso!`,
               createdAt: new Date(),
               updatedAt: new Date(),
               unread: true,
            },
         ];
         if (bonus > 0)
            notification.push({
               userId: deposit.userId,
               title: "Bônus de depósito!",
               message: `Você recebeu um bônus de R$ ${bonus} por realizar seu primeiro depósito!`,
               createdAt: new Date(),
               updatedAt: new Date(),
               unread: true,
            });
         //? Criar as notificações necessárias para o usuário
         await notifications.bulkCreate(notification);

         deposit.status = "completed";
         deposit.externalQrCode = "";
         deposit.externalQrCodeContent = "";
         deposit.externalUrl = "";
         deposit.updatedAt = new Date();
         await deposit.save();
      });
   } catch (error) {
      logger.error(error);
   }
}




