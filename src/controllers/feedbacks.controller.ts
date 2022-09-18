import { Request, Response } from "express";
import { feedbacks } from "../models";
import { IFeedback } from "../interfaces";
import { Jwt, Token } from "../auth";

export async function GetAllFeedbacks(_req: Request, res: Response, next: any) {
   try {
      const feedback = await feedbacks.findAll();
      const response = feedback.map((feedback) => feedback as IFeedback);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function CreateFeedback(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const { message } = req.body;

      if (!message) throw new Error("Mensagem é obrigatória");
      if (message.length < 50) throw new Error("Mensagem deve ter no mínimo 50 caracteres");
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
