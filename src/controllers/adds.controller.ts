import {NextFunction, Request, Response } from "express";
import { adds } from "../models";
import { File } from "../functions";
import { S3 } from "../aws";
import AppError from "../error";
import multer from "multer";
import { IAdds } from "../interfaces";

export async function GetAdds(_req: Request, res: Response, next: NextFunction) {
   try {
      const data = await adds.findAll();
      res.status(200).json({ adds: data as IAdds[] });
   } catch (error) {
      next(error);
   }
}
export async function CreateAdds(req: Request, res: Response, next: NextFunction) {
   const storage = multer.memoryStorage();
   multer({ storage }).single("image")(req, res, async (error: any) => {
      try {
         const { url } = req.body;
         if (error) throw new AppError(400, error.message);
         if (!req.file) throw new AppError(422, "Missing file as image!");
         if (!url) throw new AppError(422, "Missing url parameter!");

         if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
            throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);
         const check = File.BreakMimetype(req.file.mimetype);
         if (check?.type !== "image")
            throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);

         const bucket = new S3();
         const file_bucket_name = `adds/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
         const result = await bucket.UploadFile(req.file.buffer, file_bucket_name);

         //Se o upload para o bucket na aws falhou, retorna o erro
         if (result instanceof AppError) throw result;
         const add = await adds.create({
            url,
            image: result.Location,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
         if (!adds) throw new AppError(500, "Error at save the adds!");
         res.status(201).json(add as IAdds); 
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteAdds(req: Request, res: Response, next: NextFunction) {
   try {
      const id = parseInt(req.params.id, 10);
      const add = await adds.findByPk(id);
      if (!add) throw new AppError(404, "Adds não encontrado!");

      const bucket = new S3();
      const file = add.image.substring(add.image.indexOf("adds"));
      const result = await bucket.DeleteFile(file);
      if (result instanceof AppError) throw result;
      
      await adds.destroy({ where: { id } });
      res.status(200).json({ message: "AddSense excluído!" });
   } catch (error) {
      next(error);
   }
}
