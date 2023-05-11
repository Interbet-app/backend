import { Request, Response } from "express";
import { Cache } from "../cache";
import { Settings } from "../models";
import AppError from "../error";

export async function GetSettings(req: Request, res: Response, next: any) {
   try {
      const { stage } = req.params;
      const result = await Settings.findOne({ where: { stage } });
      if (!result) throw new AppError(404, "Configurações não encontradas!");

      res.status(200).json(result);
   } catch (err) {
      next(err);
   }
}

export async function SetSettings(req: Request, res: Response, next: any) {
   try {
      const { stage } = req.params;
      const { userMaxBetAmount } = req.body;

      if (!stage) throw new AppError(422, "Parâmetro stage é obrigatório!");
      if (!userMaxBetAmount) throw new AppError(422, "Parâmetro userMaxBetAmount é obrigatório!");

      Cache.set(`settings.userMaxBetAmount`, userMaxBetAmount);

      const result = await Settings.findOne({ where: { stage } });
      if (!result) {
         const newSettings = await Settings.create({ stage, userMaxBetAmount });
         if (!newSettings) throw new AppError(500, "Falha ao criar configurações!");
         return res.status(201).json(newSettings);
      }

      result.userMaxBetAmount = userMaxBetAmount;
      await result.save();

      res.status(200).json(result);
   } catch (err) {
      next(err);
   }
}
