import { Request, Response } from "express";
import { wallets, users, deposits, notifications } from "../models";
import { IDeposit } from "../interfaces";
import { Jwt, Token } from "../auth";
import { OpenPix } from "../payments";
import AppError from "../error";
import logger from "../log";

export async function UserDeposits(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const data = await deposits.findAll({
         where: { userId: token.userId },
         order: [["createdAt", "DESC"]],
      });
      const response = data.map((deposit: any) => deposit as IDeposit);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
export async function UserDepositDetails(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const depositId = parseInt(req.params.id, 10);
      const deposit = await deposits.findOne({
         where: { userId: token.userId, id: depositId },
      });
      if (!deposit) throw new AppError(404, "Depósito não foi encontrado");
      res.status(200).json(deposit as IDeposit);
   } catch (error) {
      next(error);
   }
}
export async function CreateDeposit(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const user = await users.findOne({ where: { id: token.userId } });
      if (!user) throw new AppError(404, "Usuário não encontrado!");

      const { amount } = req.body;
      if (!amount) throw new AppError(400, "Forneça o valor do depósito!");
      if (amount < 0) throw new AppError(400, "Valor do depósito inválido!");

      const expire = new Date();
      expire.setDate(expire.getDate() + 1);

      const deposit = await deposits.create({
         userId: token.userId,
         amount: Number(amount),
         status: "pendent",
         createdAt: new Date(),
         updatedAt: new Date(),
      });

      const Pix = new OpenPix();
      const payment = await Pix.CreatePayment(deposit.id!, amount, "Depósito Interbet");
      if (payment instanceof AppError) throw payment;
      deposit.externalStatus = payment.status;
      deposit.externalUrl = payment.paymentLinkUrl;
      deposit.externalQrCode = payment.qrCode;
      deposit.externalQrCodeContent = payment.brCode;
      deposit.expireAt = expire;
      await deposit.save();
      res.status(200).json(deposit as IDeposit);
   } catch (error) {
      next(error);
   }
}
export async function OpenPixCallback(req: Request, res: Response, next: any) {
   try {
      const { evento } = req.body;
      if (evento == "teste_webhook") return res.status(200).end(); //! Test

      const signature = req.headers["x-openpix-signature"] as string;
      const { value, correlationID, status } = req.body.pix.charge;
      const { transactionID } = req.body.charge;

      const Pix = new OpenPix();
      if (!Pix.VerifySignature(req.body, signature, "complete")) {
         logger.error("Invalid signature ->", signature);
         return res.sendStatus(401);
      }
      const deposit = await deposits.findOne({ where: { id: correlationID } });
      if (deposit == null) throw new AppError(404, "Id de pagamento nao encontrado!");
      if (status !== "COMPLETED") throw new AppError(400, "Status do pagamento inválido!");

      const amount = Number(value) / 100;
      if (Number(deposit.amount) != Number(amount)) throw new AppError(400, "Valor do pagamento inválido!");

      if (deposit.status == "pendent") {
         let wallet = await wallets.findOne({ where: { userId: deposit.userId } });
         if (!wallet) {
            wallet = await wallets.create({
               userId: deposit.userId,
               balance: Number(deposit.amount),
               bonus: 0,
               score: 0,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }
         // % verificar se é o primeiro depósito, caso seja creditar 10% do valor como bônus
         let bonus = 0;
         const data = await deposits.findAll({ where: { userId: deposit.userId } });
         if (data.length == 1) bonus = Number(deposit.amount) * 0.5; //! 50% de bonus
         wallet.balance = Number(wallet.balance) + Number(deposit.amount) + Number(bonus);
         wallet.updatedAt = new Date();
         await wallet.save();

         //? Criar uma notificação para o usuário
         await notifications.create({
            userId: deposit.userId,
            title: "Depósito confirmado",
            message: `Seu depósito de ${deposit.amount} foi aprovado! e já foi creditado na sua carteira!`,
            unread: true,
            createdAt: new Date(),
            updatedAt: new Date(),
         });

         if (bonus > 0) {
            await notifications.create({
               userId: deposit.userId,
               title: "Bônus de depósito",
               message: `Você recebeu um bônus de ${bonus} por ser o primeiro depósito!`,
               unread: true,
               createdAt: new Date(),
               updatedAt: new Date(),
            });
         }
      }

      deposit.status = "completed";
      deposit.externalId = transactionID;
      deposit.externalStatus = status;
      deposit.externalQrCode = "";
      deposit.externalQrCodeContent = "";
      deposit.externalUrl = "";
      deposit.updatedAt = new Date();
      await deposit.save();

      res.status(200).end();
   } catch (error) {
      next(error);
   }
}
