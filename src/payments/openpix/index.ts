import axios, { AxiosInstance } from "axios";
import { createHmac } from "crypto";
import logger from "../../log";
import AppError from "../../error";

export type OpenPixPayment = {
   correlationID: string;
   value: string;
   status: "ACTIVE" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
   brCode: string;
   expiresIn: string;
   createdAt: string;
   paymentLinkUrl: string;
};

export type HookAction = "complete" | "receive" | "expire";
export class OpenPix {
   private readonly authorization: string;
   public HMAC_COMPLETE: string;
   public HMAC_EXPIRE: string;
   private axios: AxiosInstance;

   constructor() {
      this.authorization = process.env.OPEN_PIX_APP_ID as string;
      this.axios = axios.create({
         baseURL: "https://api.openpix.com.br/api/openpix",
         headers: {
            Authorization: this.authorization,
         },
      });
      this.HMAC_COMPLETE = process.env.OPEN_PIX_HOOK_COMPLETE_KEY as string;
      this.HMAC_EXPIRE = process.env.OPEN_PIX_HOOK_EXPIRE_KEY as string;
   }
   private GetSignature(action: string) {
      if (action === "complete") return this.HMAC_COMPLETE;
      if (action === "expire") return this.HMAC_EXPIRE;
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

         const response = await this.axios.post("/v1/charge?return_existing=true", payload);
         return {
            correlationID: response.data.charge.correlationID,
            value: response.data.charge.value,
            status: response.data.charge.status,
            brCode: response.data.charge.brCode,
            expiresIn: response.data.charge.expiresIn,
            createdAt: response.data.charge.createdAt,
            paymentLinkUrl: response.data.charge.paymentLinkUrl,
         } as OpenPixPayment;
      } catch (error: any) {
         return new AppError(500, "Falha ao criar pix", error);
      }
   }

   public VerifySignature(body: object, key: string, action: HookAction): boolean {
      try {
         const hmac = createHmac("sha1", this.GetSignature(action)!);
         const signature = hmac.update(JSON.stringify(body)).digest("base64");
         return signature === key;
      } catch (error) {
         logger.error(error);
         return false;
      }
   }
}


