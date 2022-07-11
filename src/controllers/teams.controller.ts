import { Request, Response } from "express";
import { Teams } from "../repositories";
import logger from "../log";

export async function GetTeams(_req: Request, res: Response) {
   try {
      const teams = await Teams.getAll();
      res.status(200).json({ teams: teams });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function FindTeams(req: Request, res: Response) {
   try {
      const name = req.params.name as string;
      if(!name) return res.status(422).json({ message: "Missing name!" });
      const teams = await Teams.findByName(name);
      res.status(200).json({ teams: teams });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}