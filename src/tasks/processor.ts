import CronJob from "cron";
import logger from "../log";
import { CloseGames } from "./game.task";


async function FiveTasks() {

}
async function OneTasks() {
   //? fechar jogos que já terminaram
   await CloseGames();
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

