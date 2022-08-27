import api from "./api";
import Database from "../orm/sequelize";
import logger from "./log";
import dotenv from "dotenv";
import { TaskProcessor } from "./tasks/processor";

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
      api.listen(port);
      logger.info(`Servidor iniciado na porta ${port}!`);
   } catch (error) {
      logger.error(error);
   }
})();

