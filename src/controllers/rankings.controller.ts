import { Request, Response } from "express";
import { rankings } from "../models";
import { IRanking } from "../interfaces";

export async function EventRanking(req: Request, res: Response, next: any) {
   try {
      const eventId = parseInt(req.params.id, 10);
      const { limit, offset } = req.query;

      const ranking = await rankings.findAll({
         where: { eventId },
         limit: limit ? Number(limit) : 10,
         offset: offset ? Number(offset) : 0,
         order: [["score", "DESC"]],
      });
      const response = ranking.map((pos) => pos as IRanking);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}

