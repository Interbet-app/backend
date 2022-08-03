import { Request, Response } from "express";
import { Maintenances } from "../repositories";
import AppError from "../error";
import { Jwt } from "../auth";
import { Token } from "../types";
import { IMaintenance } from "../interfaces";

export async function GetMaintenances(_req: Request, res: Response, next: any) {
   try {
      const maintenances = await Maintenances.All();
      res.status(200).json({ maintenances: maintenances });
   } catch (error) {
      next(error);
   }
}
export async function UserMaintenances(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const maintenances = await Maintenances.ByUserId(token.userId);
      res.status(200).json(maintenances);
   } catch (error) {
      next(error);
   }
}
export async function CreateMaintenance(req: Request, res: Response, next: any) {
   try {
      const { userId, path, group, method } = req.body;
      const maintenance = await Maintenances.Create({ userId, path, group, method } as IMaintenance);
      if (!maintenance) throw new AppError(500, "Internal Server Error");
      res.status(201).json(maintenance);
   } catch (error) {
      next(error);
   }
}
export async function DeleteMaintenance(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      if (!id) throw new AppError(422, "Maintenance Id is required!");
      const maintenance = await Maintenances.Destroy(id);
      if (!maintenance) throw new AppError(404, "Maintenance not found!");
      res.status(200).json({ message: "Maintenance deleted!" });
   } catch (error) {
      next(error);
   }
}
export async function FindGroupMaintenances(req: Request, res: Response, next: any) {
   try {
      const group = req.params.group;
      if (!group) throw new AppError(422, "Group is required!");
      const maintenances = await Maintenances.ByGroup(group);
      res.status(200).json({ maintenances: maintenances });
   } catch (error) {
      next(error);
   }
}
