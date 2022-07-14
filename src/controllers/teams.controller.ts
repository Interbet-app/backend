import { Request, Response } from "express";
import { Teams } from "../repositories";
import AppError from "../error";

export async function GetTeams(_req: Request, res: Response, next: any) {
   try {
      const teams = await Teams.getAll();
      const response = teams.map((team) => {
         return {
            id: team.id,
            name: team.name,
            abbreviation: team.abbreviation,
            picture: team.picture,
            created: team.createdAt,
         };
      });
      res.status(200).json({ teams: response });
   } catch (error) {
      next(error);
   }
}
export async function FindTeams(req: Request, res: Response, next: any) {
   try {
      const name = req.params.name as string;
      if (!name) throw new AppError(422, "Missing search parameter!");
      const teams = await Teams.findByName(name);
      const response = !teams
         ? []
         : teams.map((team) => {
              return {
                 id: team.id,
                 name: team.name,
                 abbreviation: team.abbreviation,
                 picture: team.picture,
                 created: team.createdAt,
              };
           });
      res.status(200).json({ teams: response });
   } catch (error) {
      next(error);
   }
}

