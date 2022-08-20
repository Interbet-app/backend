import { Request, Response } from "express";
import { Op } from "sequelize";
import { maintenances } from "../models";
import { Jwt, Token} from "../auth";
import { IMaintenance } from "../interfaces";
import AppError from "../error";

export async function GetMaintenances(_req: Request, res: Response, next: any) {
   try {
      const result = await maintenances.findAll();
      res.status(200).json({ maintenances: result as IMaintenance[] });
   } catch (error) {
      next(error);
   }
}
export async function UserMaintenances(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const result = await maintenances.findAll({ where: { userId: token.userId } });
      res.status(200).json(result);
   } catch (error) {
      next(error);
   }
}
export async function CreateMaintenance(req: Request, res: Response, next: any) {
   try {
      const { userId, path, group, method } = req.body;
      const maintenance = await maintenances.create({ userId, path, group, method,createdAt: new Date(), updatedAt: new Date() });
      if (!maintenance) throw new AppError(500, "Falha ao criar regra!");
      res.status(201).json(maintenance as IMaintenance);
   } catch (error) {
      next(error);
   }
}
export async function DeleteMaintenance(req: Request, res: Response, next: any) {
   try {
      const id = parseInt(req.params.id, 10);
      await maintenances.destroy({ where: { id } });
      res.status(200).json({ message: "Regra de acesso excluída!" });
   } catch (error) {
      next(error);
   }
}
export async function FindGroupMaintenances(req: Request, res: Response, next: any) {
   try {
      const group = req.params.group;
      if (!group) throw new AppError(422, "Parâmetro group é obrigatório!");
      const result = await maintenances.findAll({
         where: {
            group: {
               [Op.like]: `%${group}%`
      } } });
      res.status(200).json({ maintenances: result as IMaintenance[] });
   } catch (error) {
      next(error);
   }
}




