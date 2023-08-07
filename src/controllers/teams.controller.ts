import { NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { athletics, teams } from "../models";
import { ITeam } from "../interfaces";
import { Storage } from "../aws";
import { File } from "../functions";
import multer from "multer";
import AppError from "../error";

export async function GetTeams(_req: Request, res: Response, next: NextFunction) {
   try {
      const data = await teams.findAll();
      res.status(200).json({ teams: data as ITeam[] });
   } catch (error) {
      next(error);
   }
}
export async function GetTeam(req: Request, res: Response, next: NextFunction) {
   try {
      const teamId = parseInt(req.params.id);
      const team = await teams.findByPk(teamId);
      res.status(200).json(team as ITeam);
   } catch (error) {
      next(error);
   }
}
export async function FindTeams(req: Request, res: Response, next: NextFunction) {
   try {
      const name = req.params.name as string;
      if (!name) return res.status(422).json({ message: "Informe o nome pelo qual deseja pesquisar!" });
      const data = await teams.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
      res.status(200).json({ teams: data as ITeam[] });
   } catch (error) {
      next(error);
   }
}
export async function CreateTeam(req: Request, res: Response, next: NextFunction) {
   try {
      const storage = multer.memoryStorage();
      multer({ storage }).single("picture")(req, res, async (error: any) => {
         try {
            const { name, abbreviation, athleticId, gender, adminId, sport } = req.body;
            if (error) throw new AppError(400, error.message);
            if (!req.file) throw new AppError(422, "Foto do time é obrigatória!");
            if (!name) throw new AppError(422, "Nome do time é obrigatório!");
            if (!abbreviation) throw new AppError(422, "Sigla do time é obrigatória!");
            if (!athleticId) throw new AppError(422, "Id da atlética é obrigatório!");
            if (!gender) throw new AppError(422, "Gênero do time é obrigatório!");
            if (!sport) throw new AppError(422, "Esporte do time é obrigatório!");

            const athletic = await athletics.findByPk(athleticId);
            if (!athletic) throw new AppError(404, "Atlética informada não foi encontrada!");

            if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
               throw new AppError(422, "Formato de arquivo inválido!, somente png, jpeg e jpg são permitidos!");
            const check = File.BreakMimetype(req.file.mimetype);
            if (check?.type !== "image") throw new AppError(422, "Formato de arquivo inválido!, somente png, jpeg e jpg são permitidos!");

            const bucket = new Storage();
            const file_bucket_name = `teams/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
            const result = await bucket.UploadFile(req.file.buffer, file_bucket_name);

            //Se o upload para o bucket na aws falhou, retorna o erro
            if (result instanceof AppError) throw result;
            const team = await teams.create({
               name,
               abbreviation,
               athleticId,
               sport,
               picture: result.ETag!,
               adminId: adminId ? adminId : null,
               gender,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
            if (!athletic) throw new AppError(500, "Falha ao criar time!");
            res.status(201).json(team as ITeam);
         } catch (error) {
            next(error);
         }
      });
   } catch (error) {
      next(error);
   }
}
export async function UpdateTeam(req: Request, res: Response, next: NextFunction) {
   const storage = multer.memoryStorage();
   multer({ storage }).single("picture")(req, res, async (error: any) => {
      try {
         const { teamId, name, abbreviation, location, gender, athleticId, adminId } = req.body;
         if (error) throw new AppError(400, error.message);
         if (!req.file) throw new AppError(422, "Foto do time é obrigatória!");
         if (!teamId) throw new AppError(422, "Id do time é obrigatório!");
         if (!name) throw new AppError(422, "Nome do time é obrigatório!");
         if (!abbreviation) throw new AppError(422, "Sigla do time é obrigatória!");
         if (!athleticId) throw new AppError(422, "Id da atlética é obrigatório!");
         if (!gender) throw new AppError(422, "Gênero é obrigatório!");

         const team = await teams.findByPk(teamId);
         if (!team) return res.status(404).json({ message: "Time não encontrado!" });

         if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
            throw new AppError(422, "Formato de arquivo inválido!, somente png, jpeg e jpg são permitidos!");
         const check = File.BreakMimetype(req.file.mimetype);
         if (check?.type !== "image") throw new AppError(422, "Formato de arquivo inválido!, somente png, jpeg e jpg são permitidos!");

         const bucket = new Storage();
         const to_delete = team.picture.substring(team.picture.lastIndexOf("teams"));
         const result = await bucket.DeleteFile(to_delete);
         if (result instanceof AppError) throw result;

         const file_bucket_name = `teams/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
         const result2 = await bucket.UploadFile(req.file.buffer, file_bucket_name);
         if (result2 instanceof AppError) throw result2;

         team.name = name;
         team.abbreviation = abbreviation;
         team.picture = result2.Location;
         team.gender = gender;
         team.athleticId = athleticId;
         if (adminId) team.adminId = adminId;
         team.updatedAt = new Date();
         await team.save();
         res.status(200).json(team as ITeam);
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteTeam(req: Request, res: Response, next: NextFunction) {
   try {
      const teamId = parseInt(req.params.id, 10);
      const team = await teams.findByPk(teamId);
      if (!team) return res.status(404).json({ message: "Time não encontrado!" });
      const bucket = new Storage();
      const to_delete = team.picture.substring(team.picture.lastIndexOf("teams"));
      const result = await bucket.DeleteFile(to_delete);
      if (result instanceof AppError) throw result;
      await team.destroy();
      res.status(200).json({ message: "Time excluído com sucesso!" });
   } catch (error) {
      next(error);
   }
}
