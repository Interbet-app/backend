import { Request, Response } from "express";
import { Events } from "../repositories";
import logger from "../log";


export async function GetEvents(_req: Request, res: Response) {
   try {
      const events = await Events.getAll();
      res.status(200).json({events: events});
   } catch (error) {
      logger.error(error)
      res.status(500).json({ message: "Internal server error!" });
   }
}
