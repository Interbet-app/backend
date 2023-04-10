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

//Captura e processa os erros
api.use((error: Error | any, _req: Request, res: Response, _next: any) => {
   try {
      if (error instanceof AppError) {
         if (typeof error.message === "string") logger.error(error.message);
         else logger.error(JSON.stringify(error.message));
         res.status(error.statusCode).json({
            message: error.message,
            error: error.error?.message,
         });
      } else {
         console.log(error?.response.data.code);
         if (error.message.includes("jwt expired")) {
            res.status(403).json({ message: "Authorization token is expired!" });
         } else if (error.response.data.code === "service_error") {
            res.status(422).json({ message: "Invalid Token!" });
         } else {
            if (typeof error.message === "string") logger.error(error.message);
            else logger.error(JSON.stringify(error.message));
            res.status(500).json({ message: "Internal Server Error!" });
         }
      }
   } catch (error) {
      logger.error(error);
   }
});

export default api;

