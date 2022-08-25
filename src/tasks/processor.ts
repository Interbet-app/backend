import CronJob from "cron";
import { CrediteUserBets } from "./bets.task";

export const TaskProcessor = new CronJob.CronJob("0,5,10,15,20,25,30,35,40,45,50,55 * * * *", Tasks);

function Tasks() {
   //? creditar apostas vencedoras aos usuários
   CrediteUserBets();
}
