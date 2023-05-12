import {NextFunction, Request, Response } from "express";
import { feedbacks } from "../models";
import { IFeedback } from "../interfaces";
import { Jwt, Token } from "../auth";
import AppError from "../error";

export async function GetAllFeedbacks(_req: Request, res: Response, next: NextFunction) {
   try {
      const feedback = await feedbacks.findAll();
      const response = feedback.map((feedback) => feedback as IFeedback);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function CreateFeedback(req: Request, res: Response, next: NextFunction) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const { message } = req.body;
      if (!message) throw new AppError(422, "Mensagem é obrigatória");

      const feedback = await feedbacks.create({
         userId: token.userId,
         message,
         createdAt: new Date(),
      });
      res.status(201).json(feedback as IFeedback);
   } catch (error) {
      next(error);
   }
}
