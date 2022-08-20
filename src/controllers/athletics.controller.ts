import { Request, Response } from "express";
import { Op } from "sequelize";
import { odds, teams, games, athletics } from "../models";
import { IAthletic, IGame } from "../interfaces";
import { S3 } from "../aws";
import { File } from "../functions";
import multer from "multer";
import AppError from "../error";

export async function GetAthletics(_req: Request, res: Response, next: any) {
   try {
      const data = await athletics.findAll();
      res.status(200).json({ athletics: data as IAthletic[] });
   } catch (error) {
      next(error);
   }
}
export async function FindAthletics(req: Request, res: Response, next: any) {
   try {
      const name = req.params.name as string;
      if (!name) throw new AppError(422, "Parâmetro 'name' é obrigatório!");
      const result = await athletics.findAll({ where: { name: { [Op.like]: `%${name}%` } } });
      res.status(200).json({ athletics: result as IAthletic[] });
   } catch (error) {
      next(error);
   }
}
export async function CreateAthletic(req: Request, res: Response, next: any) {
   try {
      const storage = multer.memoryStorage();
      multer({ storage }).single("picture")(req, res, async (error: any) => {
         try {
            const { name, abbreviation, adminId } = req.body;
            if (error) throw new AppError(400, error.message);
            if (!req.file) throw new AppError(422, "Foto é obrigatória!");
            if (!name) throw new AppError(422, "Nome é obrigatório!");
            if (!abbreviation) throw new AppError(422, "Sigla é obrigatória!");

            if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
               throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");
            const check = File.BreakMimetype(req.file.mimetype);
            if (check?.type !== "image")
               throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");

            const bucket = new S3();
            const file_bucket_name =
               `athletics/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
            const result = await bucket.UploadFile(req.file.buffer, file_bucket_name);

            //! Se o upload para o bucket na aws falhou, retorna o erro
            if (result instanceof AppError) throw result;
            const athletic = await athletics.create({
               name,
               abbreviation,
               picture: result.Location,
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
export async function UpdateAthletic(req: Request, res: Response, next: any) {
   const storage = multer.memoryStorage();
   multer({ storage }).single("picture")(req, res, async (error: any) => {
      try {
         if (error) throw new AppError(400, error.message);
         if (!req.file) throw new AppError(422, "Foto é obrigatória!");
         const { athleticId, name, abbreviation, adminId } = req.body;
         if (!athleticId) throw new AppError(422, "Id da atlética é obrigatório!");
         if (!name) throw new AppError(422, "Nome é obrigatório!");
         if (!abbreviation) throw new AppError(422, "Sigla é obrigatória!");

         const athletic = await athletics.findByPk(athleticId);
         if (!athletic) throw new AppError(404, "Athletic not found!");

         if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
            throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");
         const check = File.BreakMimetype(req.file.mimetype);
         if (check?.type !== "image")
            throw new AppError(422, "Extensão de arquivo inválida, somente png, jpeg e jpg!");

         const bucket = new S3();
         const to_delete = athletic.picture.substring(athletic.picture.lastIndexOf("athletics"));
         const result = await bucket.DeleteFile(to_delete);
         if (result instanceof AppError) throw result;

         const file_bucket_name =
            `athletics/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
         const result2 = await bucket.UploadFile(req.file.buffer, file_bucket_name);
         if (result2 instanceof AppError) throw result2;

         athletic.name = name;
         athletic.abbreviation = abbreviation;
         athletic.picture = result2.Location;
         if (adminId) athletic.adminId = adminId;
         athletic.updatedAt = new Date();
         await athletic.save();

         res.status(200).json(athletic as IAthletic);
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteAthletic(req: Request, res: Response, next: any) {
   try {
      const athleticId = parseInt(req.params.id, 10);
      if (!athleticId) throw new AppError(422, "!");
      const athletic = await athletics.findByPk(athleticId);
      if (!athletic) throw new AppError(404, "Atlética nao foi encontrada!");
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
export async function LastGamesResults(req: Request, res: Response, next: any) {
   try {
      const { athleticId, teamId, limit } = req.body;
      if (!athleticId && !teamId) throw new AppError(422, "Informe ao menos um parâmetro! athleticId ou teamId");

      let athletic;
      if (teamId) {
         const team = await teams.findOne({ where: { id: teamId } });
         if (!team) throw new AppError(404, "Time não foi encontrado!");
         athletic = await athletics.findByPk(team.athleticId);
      } else athletic = await athletics.findByPk(athleticId);
      if (!athletic) throw new AppError(404, "Atlética nao foi encontrada!");

      const times = await teams.findAll({ where: { athleticId: athleticId } });
      const teamsIds = times.map((team) => team.id!);
      const AthleticsOdds = await odds.findAll({ where: { teamId: { [Op.in]: teamsIds } } });
      const gamesIds = AthleticsOdds.map((odd) => odd.gameId!);
      const result = await games.findAll({
         where: {
            id: {
               [Op.in]: gamesIds,
            },
         },
         order: [["updatedAt", "DESC"]],
         limit: limit ? limit : 5,
      });
      res.status(200).json(result as IGame[]);
   } catch (error) {
      next(error);
   }
}





