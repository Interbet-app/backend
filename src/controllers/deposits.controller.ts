import { Request, Response } from "express";
import { wallets, users, deposits } from "../models";
import { IDeposit } from "../interfaces";
import AppError from "../error";
import logger from "../log";
import { Jwt } from "../auth";
import { Token } from "../types";
import mercadopago from "../payments";

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

      const { amount, email, document, document_type } = req.body;

      const expire = new Date();
      expire.setDate(expire.getDate() + 1);

      const deposit = await deposits.create({
         userId: token.userId,
         amount: Number(amount),
         status: "pendent",
         createdAt: new Date(),
         updatedAt: new Date(),
      });

      mercadopago.payment
         .create({
            payment_method_id: "pix",
            transaction_amount: Number(amount),
            external_reference: `${deposit.id}`,
            installments: 1,
            date_of_expiration: expire,
            statement_descriptor: "INTERBET",
            payer: {
               email,
               identification: {
                  type: document_type,
                  number: document,
               },
            },
         })
         .then(async (payment: any) => {
            try {
               deposit.mp_id = payment.response.id;
               deposit.mp_status = payment.response.status;
               deposit.mp_ticker_url = payment.response.point_of_interaction.transaction_data.ticket_url;
               deposit.mp_qr_code = payment.response.point_of_interaction.transaction_data.qr_code;
               deposit.mp_expires = expire;
               await deposit.save();
               res.status(200).json(deposit as IDeposit);
            } catch (error: any) {
               logger.error(error);
               res.status(500).json(error);
            }
         })
         .catch((error: any) => {
            logger.error(error);
            res.status(500).json(error);
         });
   } catch (error) {
      next(error);
   }
}
export async function MercadoPagoCallback(req: Request, res: Response, next: any) {
   try {
      const { id, topic } = req.query;
      if (id == "123456") return res.status(200).end(); //! Test
      if (!id) throw new AppError(422, "ID do pagamento não informado!");
      if (!topic) throw new AppError(422, "Tópico do pagamento não informado!");
      if (topic !== "payment") throw new AppError(400, "Tópico da notificação inválido!");

      mercadopago.payment
         .get(id)
         .then(async (payment: any) => {
            try {
               const { status } = payment.response;
               const deposit = await deposits.findOne({ where: { mp_id: payment.response.id } });
               if (deposit == null) throw new AppError(404, "Id de pagamento nao encontrado!");
               switch (status) {
                  case "approved":
                     deposit.status = "completed";
                     deposit.mp_status = status;
                     deposit.updatedAt = new Date();
                     await deposit.save();
                     const wallet = await wallets.findOne({ where: { userId: deposit.userId } });
                     if (wallet == null) {
                        await wallets.create({
                           userId: deposit.userId,
                           balance: deposit.amount,
                           blocked: 0,
                           score: 0,
                           createdAt: new Date(),
                           updatedAt: new Date(),
                        });
                     } else {
                        wallet.balance = Number(wallet.balance) + Number(deposit.amount);
                        wallet.updatedAt = new Date();
                        await wallet.save();
                     }
                     return res.sendStatus(200);
                  case "cancelled": {
                     deposit.status = "canceled";
                     deposit.mp_status = status;
                     deposit.updatedAt = new Date();
                     await deposit.save();
                  }
                  default: {
                     deposit.mp_status = status;
                     deposit.updatedAt = new Date();
                     await deposit.save();
                     return res.sendStatus(200);
                  }
               }
            } catch (error) {
               logger.error(error);
               res.sendStatus(400);
            }
         })
         .catch((error: any) => {
            logger.error(error);
            res.sendStatus(500);
         });
   } catch (error) {
      next(error);
   }
}

