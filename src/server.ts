import api from "./api";
import Database from "../orm/sequelize";
import logger from "./log";
import dotenv from "dotenv";

//Carregar variáveis de ambiente
dotenv.config();

(async () => {
   try {
      await Database.authenticate();
      logger.info("Database success connected!");

      const port = process.env.PORT || 4000;
      api.listen(port);

      logger.info(`Server running on port ${port}`);
   } catch (error) {
      logger.error(error);
   }
})();
