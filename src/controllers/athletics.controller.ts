import { Request, Response } from "express";
import { Athletics } from "../repositories";
import AppError from "../error";

export async function GetAthletics(_req: Request, res: Response, next: any) {
   try {
      const athletics = await Athletics.getAll();
      const response = athletics.map((athletic) => {
         return {
            id: athletic.id,
            name: athletic.name,
            abbreviation: athletic.abbreviation,
            picture: athletic.picture,
         };
      });
      res.status(200).json({ athletics: response });
   } catch (error) {
      next(error);
   }
}
export async function FindAthletics(req: Request, res: Response, next: any) {
   try {
      const name = req.params.name as string;
      if (!name) throw new AppError(422, "Missing search parameter!");
      const athletics = await Athletics.findByName(name);
      const response = !athletics
         ? []
         : athletics.map((athletic) => {
              return {
                 id: athletic.id,
                 name: athletic.name,
                 abbreviation: athletic.abbreviation,
                 picture: athletic.picture,
              };
           });
      res.status(200).json({ athletics: response });
   } catch (error) {
      next(error);
   }
}

