import { Request, Response } from "express";
import { Athletics } from "../repositories";
import logger from "../log";

export async function GetAthletics(_req: Request, res: Response) {
   try {
      const athletics = await Athletics.getAll();
      res.status(200).json({ athletics: athletics });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function FindAthletics(req: Request, res: Response) {
   try {
      const name = req.params.name as string;
      if (!name) return res.status(422).json({ message: "Missing name!" });
      const athletics = await Athletics.findByName(name);
      res.status(200).json({ athletics: athletics });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}