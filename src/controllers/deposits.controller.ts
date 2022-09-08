import { Request, Response } from "express";
import { users, deposits } from "../models";
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

      let { amount } = req.body;
      if (!amount) throw new AppError(400, "Forneça o valor do depósito!");
      const value = parseFloat(amount.toFixed(2));
      const amountInCents = value * 100;
      if (value < 0) throw new AppError(400, `Valor do depósito inválido! ${value} deve ser maior que 0!`);

      const expire = new Date();
      expire.setDate(expire.getDate() + 1);

      const deposit = await deposits.create({
         userId: token.userId,
         uniqueId: `DEP-${token.userId}-${new Date().getTime()}`,
         amount: value,
         externalAmount: amountInCents,
         status: "pendent",
         createdAt: new Date(),
         updatedAt: new Date(),
      });

      const Pix = new OpenPix();
      const payment = await Pix.CreatePayment(deposit.uniqueId, amountInCents, "Depósito Interbet");
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
export async function OpenPixCallbackComplete(req: Request, res: Response, next: any) {
   try {
      const { evento } = req.body;
      if (evento == "teste_webhook") return res.status(200).json({ message: "Webhook testado com sucesso!" });

      const signature = req.headers["x-openpix-signature"] as string;
      const { value, correlationID, status } = req.body.pix.charge;
      const { transactionID } = req.body.charge;

      const Pix = new OpenPix();
      if (!Pix.VerifySignature(req.body, signature, "complete")) throw new AppError(401, "Assinatura HMAC inválida!");

      const deposit = await deposits.findOne({ where: { uniqueId: correlationID } });
      if (!deposit) throw new AppError(404, `Depósito não foi encontrado! ${correlationID}`);
      if (status !== "COMPLETED") throw new AppError(400, `Status do pagamento é inválido! ${status}`);
      if (value != deposit.externalAmount!)
         throw new AppError(400, `Valor do pagamento inválido, ${value} deve ser igual a salvo no banco ${deposit.externalAmount}`);

      deposit.externalTransactionId = transactionID;
      deposit.externalStatus = status;
      deposit.updatedAt = new Date();
      await deposit.save();

      res.sendStatus(200);
   } catch (error) {
      next(error);
   }
}

export async function OpenPixCallbackExpired(req: Request, res: Response, next: any) {
   try {
      const { event, charge } = req.body;
      if (event == "teste_webhook") return res.status(200).json({ message: "Webhook testado com sucesso!" });
      if (event != "OPENPIX:CHARGE_EXPIRED") throw new AppError(400, "Evento inválido!");
      
      const Pix = new OpenPix();
      const signature = req.headers["x-openpix-signature"] as string;
      if (!Pix.VerifySignature(req.body, signature, "expire")) throw new AppError(401, "Assinatura HMAC inválida!");

      const deposit = await deposits.findOne({ where: { uniqueId: charge.correlationID } });
      if (!deposit) throw new AppError(404, `Depósito não foi encontrado! ${charge.correlationID}`);

      deposit.externalStatus = charge.status;
      deposit.externalTransactionId = charge.transactionID;
      deposit.externalQrCode = "";
      deposit.externalQrCodeContent = "";
      deposit.externalUrl = "";
      deposit.status = "canceled";
      deposit.updatedAt = new Date();
      await deposit.save();

      res.sendStatus(200);
   } catch (error) {
      next(error);
   }
}
