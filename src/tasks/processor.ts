import CronJob from "cron";
import logger from "../log";
import { CrediteUserBets } from "./bets.task";
import { CrediteCompletedDeposits } from "./deposits.task";
import { CrediteCommissions, CloseGames } from "./game.task";
import { TelegramTasks } from "./telegram.task";

async function FiveTasks() {
   //? creditar apostas vencedoras aos usuários
   await CrediteUserBets();

   //? creditar comissões aos administradores de times
   await CrediteCommissions();
}
async function OneTasks() {
   //? fechar jogos que já terminaram
   await CloseGames();

   //? creditar depósitos concluídos aos usuários
   await CrediteCompletedDeposits();

   //? enviar notificações de retiradas solicitadas para o Chat do Telegram
   await TelegramTasks();
}

export class TaskProcessor {
   private static five = new CronJob.CronJob("0,5,10,15,20,25,30,35,40,45,50,55 * * * *", FiveTasks);
   private static one = new CronJob.CronJob("* * * * *", OneTasks);

   public static start() {
      this.one.start();
      this.five.start();
      logger.info("Tarefas recorrentes iniciadas com sucesso!");
   }
   public static stop() {
      this.one.stop();
      this.five.stop();
   }
}

