import { Request, Response } from "express";
import { Adds } from "../repositories";
import AppError from "../error";
import { IAdds } from "../interfaces";
import multer from "multer";
import { File } from "../functions";
import { S3 } from "../aws";

export async function GetAdds(_req: Request, res: Response, next: any) {
   try {
      const adds = await Adds.getAll();
      const response = adds.map((add: IAdds) => {
         return {
            id: add.id,
            image: add.image,
            url: add.url,
            createdAt: add.createdAt,
            updatedAt: add.updatedAt,
         };
      });
      res.status(200).json({ adds: response });
   } catch (error) {
      next(error);
   }
}
export async function CreateAdds(req: Request, res: Response, next: any) {
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
         const adds = await Adds.create({
            url,
            image: result.Location,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
         if (!adds) throw new AppError(500, "Error at save the adds!");

         res.status(201).json({
            id: adds.id,
            url: adds.url,
            image: adds.image,
            createdAt: adds.createdAt,
            updatedAt: adds.updatedAt,
         });
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteAdds(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Missing id parameter!");
      const adds = await Adds.getById(id);
      if (!adds) throw new AppError(404, "Adds not found!");

      const bucket = new S3();
      const file = adds.image.substring(adds.image.indexOf("adds"));
      const result = await bucket.DeleteFile(file);
      if (result instanceof AppError) throw result;

      const rows = await Adds.delete(id);
      if (!rows) throw new AppError(500, "Error at delete the adds!");
      res.status(200).json({ message: "Adds deleted!" });
   } catch (error) {
      next(error);
   }
}

