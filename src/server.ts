import api from "./api";
import Database from "./database";
import logger from "./log";
import dotenv from "dotenv";
import { TaskProcessor } from "./tasks/processor";
import { WsSocket } from "./api-ws";

//Carregar variáveis de ambiente
dotenv.config();

(async () => {
   try {
      //? Conectar ao banco de dados
      await Database.authenticate();
      logger.info("Conectado com sucesso ao banco de dados!");

      //? iniciar tarefas recorrentes
      TaskProcessor.start();

      const port = process.env.PORT || 4000;
      const server = api.listen(port, () => {
         logger.info(`Servidor iniciado na porta ${port}!`);
      });

      //? iniciar websocket
      //const wss = new WsSocket(server);
   } catch (error) {
      logger.error(error);
   }
})();






