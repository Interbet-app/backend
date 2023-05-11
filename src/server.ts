import api from "./api";
import Database from "./database";
import logger from "./log";
import dotenv from "dotenv";
import { TaskProcessor } from "./tasks/processor";
import { Settings } from "./models";
import { Cache } from "./cache";
import { WsSocket } from "./api-ws";

const stage = process.env.NODE_ENV || "development";

//Carregar variáveis de ambiente
dotenv.config();

(async () => {
   try {
      //? Conectar ao banco de dados
      await Database.authenticate();
      await Database.sync();
      logger.info("Conectado com sucesso ao banco de dados!");

      //? Iniciar tarefas recorrentes
      TaskProcessor.start();

      //? Carregar configurações para o cache
      const settings = await Settings.findOne({ where: { stage } });
      if (!settings) throw new Error("Configurações não encontradas!");
      
      //% Valor máximo global de uma aposta
      Cache.set(`settings.userMaxBetAmount`, settings.userMaxBetAmount);

      const port = process.env.PORT || 4000;
      const server = api.listen(port, () => {
         logger.info(`Servidor iniciado na porta ${port}!`);
      });

      //? Iniciar websocket
      //const wss = new WsSocket(server);
   } catch (error) {
      logger.error(error);
   }
})();
