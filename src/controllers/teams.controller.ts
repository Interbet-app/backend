import { Request, Response } from "express";
import { Teams, Athletics } from "../repositories";
import { S3 } from "../aws";
import multer from "multer";
import AppError from "../error";

export async function GetTeams(_req: Request, res: Response, next: any) {
   try {
      const teams = await Teams.getAll();
      const response = teams.map((team) => {
         return {
            id: team.id,
            name: team.name,
            athleticId: team.athleticId,
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
export async function CreateTeam(req: Request, res: Response, next: any) {
   try {
      const storage = multer.memoryStorage();
      multer({ storage }).single("picture")(req, res, async (error: any) => {
         try {
            const { name, abbreviation, athleticId, location } = req.body;
            if (error) throw new AppError(400, error.message);
            if (!req.file) throw new AppError(422, "Missing file as picture!");
            if (!name) throw new AppError(422, "Missing name parameter!");
            if (!abbreviation) throw new AppError(422, "Missing abbreviation parameter!");
            if (!athleticId) throw new AppError(422, "Missing athleticId parameter!");
            if (!location) throw new AppError(422, "Missing location parameter!");

            const athletic = await Athletics.getById(athleticId);
            if (!athletic) throw new AppError(404, "Athletic not found or invalid athleticId!");

            const bucket = new S3();
            const file_bucket_name = `teams/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
            const result = await bucket.UploadFile(req.file.buffer, file_bucket_name);

            //Se o upload para o bucket na aws falhou, retorna o erro
            if (result instanceof AppError) throw result;
            const team = await Teams.create({
               name,
               abbreviation,
               athleticId,
               picture: result.Location,
               location,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
            if (!athletic) throw new AppError(500, "Error at save the team!");
            res.status(201).json({
               id: team.id,
               name: team.name,
               abbreviation: team.abbreviation,
               picture: team.picture,
               athleticId: team.athleticId,
               location: team.location,
               createdAt: team.createdAt,
               updatedAt: team.updatedAt,
            });
         } catch (error) {
            next(error);
         }
      });
   } catch (error) {
      next(error);
   }
}

