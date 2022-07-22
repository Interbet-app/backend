import { Request, Response } from "express";
import { Teams, Athletics } from "../repositories";
import { S3 } from "../aws";
import multer from "multer";
import AppError from "../error";
import { ITeam } from "../interfaces";
import { File } from "../functions";

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

            if (!File.IsFormatAllowed(req.file, ["image/png", "image/jpeg", "image/jpg"]))
               throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);
            const check = File.breakMimetype(req.file.mimetype);
            if (check?.type !== "image")
               throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);

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
            res.status(201).json({ ...team } as ITeam);
         } catch (error) {
            next(error);
         }
      });
   } catch (error) {
      next(error);
   }
}
export async function UpdateTeam(req: Request, res: Response, next: any) {
   const storage = multer.memoryStorage();
   multer({ storage }).single("picture")(req, res, async (error: any) => {
      try {
         const { teamId, name, abbreviation, location, athleticId } = req.body;
         if (error) throw new AppError(400, error.message);
         if (!req.file) throw new AppError(422, "Missing file as picture!");
         if (!teamId) throw new AppError(422, "Missing teamId parameter!");
         if (!name) throw new AppError(422, "Missing name parameter!");
         if (!abbreviation) throw new AppError(422, "Missing abbreviation parameter!");
         if (!location) throw new AppError(422, "Missing location parameter!");
         if (!athleticId) throw new AppError(422, "Missing athleticId parameter!");
         const team = await Teams.getById(teamId);
         if (!team) throw new AppError(404, "Team not found or invalid teamId!");

          if (!File.IsFormatAllowed(req.file, ["image/png", "image/jpeg", "image/jpg"]))
             throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);
          const check = File.breakMimetype(req.file.mimetype);
          if (check?.type !== "image")
             throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);

         const bucket = new S3();
         const to_delete = team.picture.substring(team.picture.lastIndexOf("teams"));
         const result = await bucket.DeleteFile(to_delete);
         if (result instanceof AppError) throw result;

         const file_bucket_name = `teams/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
         const result2 = await bucket.UploadFile(req.file.buffer, file_bucket_name);
         if (result2 instanceof AppError) throw result2;

         team.name = name;
         team.abbreviation = abbreviation;
         team.picture = result2.Location;
         team.location = location;
         team.athleticId = athleticId;
         team.updatedAt = new Date();
         await team.save();
         res.status(200).json({ ...team } as ITeam);
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteTeam(req: Request, res: Response, next: any) {
   try {
      const teamId = parseInt(req.params.id, 10);
      if (!teamId) throw new AppError(422, "Missing id parameter!");
      const team = await Teams.getById(teamId);
      if (!team) throw new AppError(404, "Team not found or invalid teamId!");
      const bucket = new S3();
      const to_delete = team.picture.substring(team.picture.lastIndexOf("teams"));
      const result = await bucket.DeleteFile(to_delete);
      if (result instanceof AppError) throw result;
      await team.destroy();
      res.status(200).json({ message: "Team deleted!" });
   } catch (error) {
      next(error);
   }
}


