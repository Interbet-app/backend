import { Request, Response } from "express";
import { Adds } from "../repositories";
import logger from "../log";


export async function GetAdds(_req: Request, res: Response) {
   try {
      const adds = await Adds.getAll();
      res.status(200).json({adds: adds});
   } catch (error) {
      logger.error(error)
      res.status(500).json({ message: "Internal server error!" });
   }
}