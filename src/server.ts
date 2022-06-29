import api from "./api";
import logger from "./log";
import dotenv from "dotenv";

//Carregar variáveis de ambiente
dotenv.config();

async () => {
   try {
      const port = process.env.PORT || 4000;
      api.listen(port);
      logger.info(`Server running on port ${port}`);
   } catch (error) {
      logger.error(error);
   }
};
