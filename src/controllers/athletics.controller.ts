import { Request, Response } from "express";
import { Athletics } from "../repositories";
import { IAthletic } from "../interfaces";
import multer from "multer";
import AppError from "../error";
import { S3 } from "../aws";
import { File } from "../functions";

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
export async function CreateAthletic(req: Request, res: Response, next: any) {
   try {
      const storage = multer.memoryStorage();
      multer({ storage }).single("picture")(req, res, async (error: any) => {
         try {
            const { name, abbreviation } = req.body;
            if (error) throw new AppError(400, error.message);
            if (!req.file) throw new AppError(422, "Missing file as picture!");
            if (!name) throw new AppError(422, "Missing name parameter!");
            if (!abbreviation) throw new AppError(422, "Missing abbreviation parameter!");

            if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
               throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);
            const check = File.BreakMimetype(req.file.mimetype);
            if (check?.type !== "image")
               throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);

            const bucket = new S3();
            const file_bucket_name =
               `athletics/pictures/` + Date.now().toString() + "_." + req.file.mimetype.split("/")[1];
            const result = await bucket.UploadFile(req.file.buffer, file_bucket_name);

            //Se o upload para o bucket na aws falhou, retorna o erro
            if (result instanceof AppError) throw result;
            const athletic = await Athletics.create({
               name,
               abbreviation,
               picture: result.Location,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
            if (!athletic) throw new AppError(500, "Error at save the athletic!");
            res.status(201).json({
               id: athletic.id,
               name: athletic.name,
               abbreviation: athletic.abbreviation,
               picture: athletic.picture,
               createdAt: athletic.createdAt,
               updatedAt: athletic.updatedAt,
            });
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
         if (!req.file) throw new AppError(422, "Missing file as picture!");
         const { athleticId, name, abbreviation } = req.body;
         if (!athleticId) throw new AppError(422, "Missing id parameter!");
         if (!name) throw new AppError(422, "Missing name parameter!");
         if (!abbreviation) throw new AppError(422, "Missing abbreviation parameter!");

         const athletic = await Athletics.getById(athleticId);
         if (!athletic) throw new AppError(404, "Athletic not found!");

         if (!File.FilterExtension(["image/png", "image/jpeg", "image/jpg"], req.file.mimetype))
            throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);
         const check = File.BreakMimetype(req.file.mimetype);
         if (check?.type !== "image")
            throw new AppError(422, `File format not allowed! Allowed formats: png, jpeg, jpg`);

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
         athletic.updatedAt = new Date();
         await athletic.save();

         res.status(200).json({
            id: athletic.id,
            name: athletic.name,
            abbreviation: athletic.abbreviation,
            picture: athletic.picture,
            createdAt: athletic.createdAt,
            updatedAt: athletic.updatedAt,
         });
      } catch (error) {
         next(error);
      }
   });
}
export async function DeleteAthletic(req: Request, res: Response, next: any) {
   try {
      const athleticId = parseInt(req.params.id, 10);
      if (!athleticId) throw new AppError(422, "Missing id parameter!");
      const athletic = await Athletics.getById(athleticId);
      if (!athletic) throw new AppError(404, "Athletic not found!");
      const bucket = new S3();
      const to_delete = athletic.picture.substring(athletic.picture.lastIndexOf("athletics"));
      const result = await bucket.DeleteFile(to_delete);
      if (result instanceof AppError) throw result;
      await athletic.destroy();
      res.status(204).json({ message: "Athletic deleted!" });
   } catch (error) {
      next(error);
   }
}

