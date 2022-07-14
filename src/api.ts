import express, { Response, Request } from "express";
import AppError from "./error";
import helmet from "helmet";
import cors from "cors";
import logger from "./log";
import routes from "./routes";

const api = express();
const corsOptions = {
   origin: process.env.CORS_ALLOW_ORIGIN || "*",
   methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "authorization", "google_authentication"],
   optionsSuccessStatus: 200,
};

api.use(cors(corsOptions));
api.use(helmet());
api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(routes);

//Rotas não encontradas
api.use("/", (_req: Request, res: Response) => {
   res.status(403).json({ message: "Unauthorized access!" });
});

//Captura de erros
api.use((error: Error, _req: Request, res: Response, _next: any) => {
   if (error instanceof AppError) {
      logger.error(error.message);
      res.status(error.statusCode).json({
         message: error.message,
         error: error.error?.message,
      });
   } else {
      logger.error(error.message);
      res.status(500).json({ message: "Internal Server Error!" });
   }
});

export default api;


