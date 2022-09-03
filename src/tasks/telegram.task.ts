import { Telegraf } from "telegraf";
import { Withdrawals } from "../models";

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN!);

export async function TelegramTasks() {
   try {
      const data = await Withdrawals.findAll({ where: { status: "pendent" } });
      data.forEach(async (withdrawal) => {
         bot.telegram.sendMessage(
            process.env.TELEGRAM_CHAT_ID!,
            `Retirada solicitada pelo usuário ${withdrawal.userId} no valor de R$${withdrawal.amount} para a chave ${withdrawal.pixKey} do tipo ${withdrawal.pixKeyType}`
         );
         withdrawal.status = "completed";
         await withdrawal.save();
      });
   } catch (error) {
      console.log(error);
   }
}

