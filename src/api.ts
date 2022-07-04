import express, { Response, Request } from "express";
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
api.use((error: any, res: Response) => {
   logger.error(error);
   res.status(500).json({ message: "Internal Server Error!" });
});

export default api;
