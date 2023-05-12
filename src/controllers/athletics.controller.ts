import {NextFunction, Request, Response } from "express";
import { Op } from "sequelize";
import { athletics, teams } from "../models";
import { IAthletic } from "../interfaces";
import { S3 } from "../aws";
import { File } from "../functions";
import multer from "multer";
import AppError from "../error";

export async function GetAthletics(_req: Request, res: Response, next: NextFunction) {
   try {
      const data = await athletics.findAll();
      res.status(200).json({ athletics: data as IAthletic[] });
   } catch (error) {
      next(error);
   }
}
export async function FindAthletics(req: Request, res: Response, next: NextFunction) {
   try {
      const name = req.params.name as string;
      if (!name) throw new AppError(422, "Informe o nome pelo qual deseja pesquisar!");
      const result = await athletics.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
      res.status(200).json({ athletics: result as IAthletic[] });
   } catch (error) {
      next(error);
   }
}
export async function CreateAthletic(req: Request, res: Response, next: NextFunction) {
   try {
      const storage = multer.memoryStorage();
      multer({ storage }).single("picture")(req, res, async (error: any) => {
         try {
            const { name, abbreviation, adminId, instagram } = req.body;
            if (error) throw new AppError(400, error.message);
            if (!req.file) throw new AppError(422, "Foto é obrigatória!");
            if (!name) throw new AppError(422, "Nome é obrigatório!");
            if (!instagram) throw new AppError(422, "Instagram é obrigatório!");
            if (!abbreviation) throw new AppError(422, "Parâmetro abbreviation é obrigatório!");

            if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
               throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");
            const check = File.BreakMimetype(req.file.mimetype);
            if (check?.type !== "image") throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");

            const bucket = new S3();
            const file_bucket_name = `athletics/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
            const result = await bucket.UploadFile(req.file.buffer, file_bucket_name);

            //! Se o upload para o bucket na aws falhou, retorna o erro
            if (result instanceof AppError) throw result;
            const athletic = await athletics.create({
               name,
               abbreviation,
               picture: result.Location,
               instagram,
               createdAt: new Date(),
               updatedAt: new Date(),
               adminId: adminId ? adminId : null,
            });
            if (!athletic) throw new AppError(500, "Erro ao salvar atlética!");
            res.status(201).json(athletic as IAthletic);
         } catch (error) {
            next(error);
         }
      });
   } catch (error) {
      next(error);
   }
}
export async function UpdateAthletic(req: Request, res: Response, next: NextFunction) {
   const storage = multer.memoryStorage();
   multer({ storage }).single("picture")(req, res, async (error: any) => {
      try {
         if (error) throw new AppError(400, error.message);
         if (!req.file) throw new AppError(422, "Foto é obrigatória!");
         const { athleticId, name, abbreviation, adminId, instagram } = req.body;
         if (!athleticId) throw new AppError(422, "Id da atlética é obrigatório!");
         if (!name) throw new AppError(422, "Nome é obrigatório!");
         if (!abbreviation) throw new AppError(422, "Parâmetro abbreviation é obrigatório!");

         const athletic = await athletics.findByPk(athleticId);
         if (!athletic) throw new AppError(404, "Athletic not found!");

         if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
            throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");
         const check = File.BreakMimetype(req.file.mimetype);
         if (check?.type !== "image") throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");

         const bucket = new S3();
         const to_delete = athletic.picture.substring(athletic.picture.lastIndexOf("athletics"));
         const result = await bucket.DeleteFile(to_delete);
         if (result instanceof AppError) throw result;

         const file_bucket_name = `athletics/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
         const result2 = await bucket.UploadFile(req.file.buffer, file_bucket_name);
         if (result2 instanceof AppError) throw result2;

         athletic.name = name;
         athletic.abbreviation = abbreviation;
         athletic.picture = result2.Location;
         athletic.instagram = instagram;

         if (adminId) athletic.adminId = adminId;
         athletic.updatedAt = new Date();
         await athletic.save();

         res.status(200).json(athletic as IAthletic);
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteAthletic(req: Request, res: Response, next: NextFunction) {
   try {
      const athleticId = parseInt(req.params.id, 10);
      if (!athleticId) throw new AppError(422, "!");
      const athletic = await athletics.findByPk(athleticId);
      if (!athletic) return res.status(404).json({ message: "Atlética não foi encontrada" });
      const bucket = new S3();
      const to_delete = athletic.picture.substring(athletic.picture.lastIndexOf("athletics"));
      const result = await bucket.DeleteFile(to_delete);
      if (result instanceof AppError) throw result;
      await athletic.destroy();
      res.status(204).json({ message: "Atlética excluída com sucesso!" });
   } catch (error) {
      next(error);
   }
}
export async function SetAthleticAndTeamAdminId(req: Request, res: Response, next: NextFunction) {
   try {
      const { teamId, athleticId, adminId } = req.body;
      if (!teamId) throw new AppError(422, "Id do time é obrigatório!");
      if (!athleticId) throw new AppError(422, "Id da atlética é obrigatório!");
      if (!adminId) throw new AppError(422, "Id do administrador é obrigatório!");

      const team = await teams.findByPk(teamId);
      if (!team) throw new AppError(404, "Time não encontrado!");
      const athletic = await athletics.findByPk(athleticId);
      if (!athletic) throw new AppError(404, "Atlética não encontrada!");
      athletic.adminId = adminId;
      team.adminId = adminId;
      await team.save();
      await athletic.save();
      res.status(200).json({ message: "Administrador definido com sucesso!" });
   } catch (error) {
      next(error);
   }
}

