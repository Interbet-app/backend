import axios from "axios";
import logger from "../../log";
import AppError from "../../error";

export type OpenPixPayment = {
   correlationID: string;
   value: string;
   status: "ACTIVE" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
   transactionID: string;
   brCode: string;
   expiresIn: string;
   createdAt: string;
   paymentLinkUrl: string;
};
export class OpenPix {
   private readonly authorization: string;

   constructor() {
      this.authorization = process.env.OPEN_PIX_APP_ID as string;
   }

   public async CreatePayment(
      correlationID: number,
      amount: number,
      comment: string
   ): Promise<OpenPixPayment | AppError> {
      try {
         const payload = {
            correlationID: `${correlationID}`,
            value: `${Number(amount) * 100}`,
            comment: comment,
         };

         const res = await fetch("https://api.openpix.com.br/api/openpix/v1/charge", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
               Accept: "application/json",
               Authorization: this.authorization,
            },
            body: JSON.stringify(payload),
         });
         const response = await res.json();

         logger.info(response);
         return {
            correlationID: response.data.charge.correlationID,
            value: response.data.charge.value,
            status: response.data.charge.status,
            transactionID: response.data.charge.transactionID,
            brCode: response.data.charge.brCode,
            expiresIn: response.data.charge.expiresIn,
            createdAt: response.data.charge.createdAt,
            paymentLinkUrl: response.data.charge.paymentLinkUrl,
         } as OpenPixPayment;
      } catch (error: any) {
         logger.error(error);
         return new AppError(500, "Falha ao criar pix", error);
      }
   }
}



