import { Request, Response } from "express";
import { Maintenances } from "../repositories";
import AppError from "../error";
import { IMaintenance } from "../interfaces";

export async function GetMaintenances(_req: Request, res: Response, next: any) {
   try {
      const maintenances = await Maintenances.getAll();
      const response = maintenances.map((maintenance) => {
         return {
            id: maintenance.id,
            userId: maintenance.userId,
            path: maintenance.path,
            method: maintenance.method,
            group: maintenance.group,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
         };
      });
      res.status(200).json({ maintenances: response });
   } catch (error) {
      next(error);
   }
}
export async function CreateMaintenance(req: Request, res: Response, next: any) {
   try {
      const { userId, path, group, method } = req.body;
      const result = await Maintenances.create({ userId, path, group, method } as IMaintenance);
      if (!result) throw new AppError(500, "Internal Server Error");
      res.status(201).end();
   } catch (error) {
      next(error);
   }
}
export async function DeleteMaintenance(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Maintenance Id is required!");
      const maintenance = await Maintenances.getById(id);
      if (!maintenance) throw new AppError(404, "Maintenance not found!");
      res.sendStatus(200);
   } catch (error) {
      next(error);
   }
}
export async function FindGroupMaintenances(req: Request, res: Response, next: any) {
 try {
      const group = req.params.group;
      if (!group) throw new AppError(422, "Group is required!");
      const maintenances = await Maintenances.getByGroup(group);
      const response = maintenances.map((maintenance) => {
         return {
            id: maintenance.id,
            userId: maintenance.userId,
            path: maintenance.path,
            method: maintenance.method,
            group: maintenance.group,
            createdAt: maintenance.createdAt,
            updatedAt: maintenance.updatedAt,
         };
      });
    res.status(200).json({ maintenances: response });
 } catch (error) {
   next(error);
 }

}