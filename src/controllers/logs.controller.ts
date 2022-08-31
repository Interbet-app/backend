import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function ShowLogs(req: Request, res: Response) {
   const { level } = req.query;
   if (!level) return res.status(400).json({ message: "Nível inexistente!" });
   if (level !== "error" && level !== "info") return res.status(400).json({ message: "Nível inexistente!" });
   const logs = fs.readFileSync(path.join(__dirname, `../../logs/${level}.txt`), "utf-8");
   res.status(200).json({ logs });
}

export async function FlushLogs(req: Request, res: Response) {
   const { level } = req.query;
   if(!level) return res.status(400).json({ message: "Nível inexistente!" });
   if (level !== "error" && level !== "info") return res.status(400).json({ message: "Nível inexistente!" });
   fs.writeFileSync(path.join(__dirname, `../../logs/${level}.txt`), "");
   res.status(200).json({ message: "Logs limpos com sucesso!" });
}
