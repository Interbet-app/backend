import express, { Response, Request } from "express";
import helmet from "helmet";
import cors from "cors";
import logger from "./log";

const api = express();
const corsOptions = {
   origin: process.env.CORS_ALLOW_ORIGIN || "*",
   methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
   allowedHeaders: ["Content-Type", "Authorization"],
   optionsSuccessStatus: 200,
};

api.use(cors(corsOptions));
api.use(helmet());
api.use(express.json());
api.use(express.urlencoded({ extended: true }));

api.use("/", (_req: Request, res: Response) => {
   res.status(403).json({ message: "Acesso não autorizado!" });
});
api.use((error: any, res: Response) => {
   logger.error(error);
   res.status(500).json({ message: "Erro interno do servidor!" });
});

export default api;
