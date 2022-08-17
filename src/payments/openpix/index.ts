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
   private axios: any;

   constructor() {
      this.authorization = process.env.OPEN_PIX_APP_ID as string;
      this.axios = axios.create({
         baseURL: "https://api.openpix.com.br/api",
         headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: this.authorization,
         },
      });
   }

   public async CreatePayment(
      correlationID: number,
      amount: number,
      comment: string
   ): Promise<OpenPixPayment | AppError> {
      try {
         const body = {
            correlationID: `${correlationID}`,
            amount: `${Number(amount) * 100}`,
            comment: comment,
         };
         const response = await this.axios.post("/openpix/v1/charge?return_existing=true", JSON.stringify(body));
         logger.info(response.data);
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



