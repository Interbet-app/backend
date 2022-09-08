import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function ShowLogs(req: Request, res: Response, next: any) {
   try {
      const { level } = req.query;
      if (!level) return res.status(400).json({ message: "Nível inexistente!" });
      if (level !== "error" && level !== "info") return res.status(400).json({ message: "Nível inexistente!" });

      fs.open(path.join(__dirname, "..", "..", "logs", `${level}.log`), "r", (err, fd) => {
         if (err?.code === "ENOENT") return res.status(400).json({ message: "Nível inexistente!" });
         const log = fs.readFileSync(fd, "utf-8");
         res.status(200).json({ log });
      });
   } catch (error) {
      next(error);
   }
}

export async function FlushLogs(req: Request, res: Response, next: any) {
   try {
      const { level } = req.query;
      if (!level) return res.status(400).json({ message: "Nível inexistente!" });
      if (level !== "error" && level !== "info") return res.status(400).json({ message: "Nível inexistente!" });
      fs.open(path.join(__dirname, "..", "..", "logs", `${level}.log`), "w", (err, fd) => {
         if (err?.code === "ENOENT") return res.status(400).json({ message: "Nível inexistente!" });
         fs.writeFileSync(fd, "");
         res.status(200).json({ message: "Logs limpos com sucesso!" });
      });
   } catch (error) {
      next(error);
   }
}
