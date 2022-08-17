import { Request, Response } from "express";
import { wallets, users, deposits } from "../models";
import { IDeposit } from "../interfaces";
import AppError from "../error";
import logger from "../log";
import { Jwt } from "../auth";
import { Token } from "../types";
import { OpenPix } from "../payments/openpix";

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

export async function CreateDeposit(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const user = await users.findOne({ where: { id: token.userId } });
      if (!user) throw new AppError(404, "User not found!");

      const { amount } = req.body;
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
      const payment = await Pix.CreatePayment(deposit.id!, amount, "interbet deposit");
      if (payment instanceof AppError) throw payment;
      deposit.externalStatus = payment.status;
      deposit.externalUrl = payment.paymentLinkUrl;
      deposit.externalQrCode = payment.brCode;
      deposit.expireAt = expire;
      await deposit.save();
      res.status(200).json(deposit as IDeposit);
   } catch (error) {
      next(error);
   }
}

export async function OpenPixCallback(req: Request, res: Response, next: any) {
   try {
      const signature = req.headers["x-openpix-signature"] as string;
      const { value, correlationID, transactionID, status } = req.body.pix.charge;

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

      const wallet = await wallets.findOne({ where: { userId: deposit.userId } });
      if (!wallet) {
         logger.error(
            `Carteira referente ao deposito do usuário nao encontrada usuário:${deposit.userId} valor: ${deposit.amount}!`
         );
         return res.sendStatus(200);
      }
      wallet.balance = Number(wallet.balance) + Number(deposit.amount);
      wallet.updatedAt = new Date();
      await wallet.save();

      deposit.status = "completed";
      deposit.externalId = transactionID;
      deposit.externalStatus = status;
      deposit.externalQrCode = "";
      deposit.externalUrl = "";
      deposit.updatedAt = new Date();
      await deposit.save();

      res.status(200).end();
   } catch (error) {
      next(error);
   }
}


