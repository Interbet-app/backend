import axios, { AxiosInstance } from "axios";
import { createHmac } from "crypto";
import logger from "../log";
import AppError from "../error";
import QRCode from "qrcode";

export type OpenPixPayment = {
   value: string;
   status: "ACTIVE" | "PENDING" | "CONFIRMED" | "CANCELLED" | "EXPIRED";
   brCode: string;
   qrCode: string;
   expiresIn: string;
   createdAt: string;
   paymentLinkUrl: string;
};
export type OpenPixSend = {
   externalId: string;
   externalStatus: "PENDING" | "CONFIRMED";
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
         headers: { Authorization: this.authorization },
      });
      this.HMAC_COMPLETE = process.env.OPEN_PIX_HOOK_COMPLETE_KEY as string;
      this.HMAC_EXPIRE = process.env.OPEN_PIX_HOOK_EXPIRE_KEY as string;
   }
   private GetSignature(action: string) {
      if (action === "complete") return this.HMAC_COMPLETE;
      if (action === "expire") return this.HMAC_EXPIRE;
   }

   public async CreatePayment(correlationID: string,value: number,comment: string): Promise<OpenPixPayment | AppError> {
      try {
         const response = await this.axios.post("/v1/charge", { correlationID, value, comment });
         const qrcode = (await QRCode.toDataURL(response.data.brCode, { type: "image/jpeg" })) as string;
         return {
            value: response.data.charge.value,
            status: response.data.charge.status,
            brCode: response.data.brCode,
            qrCode: qrcode,
            expiresIn: response.data.charge.expiresIn,
            createdAt: response.data.charge.createdAt,
            paymentLinkUrl: response.data.charge.paymentLinkUrl,
         } as OpenPixPayment;
      } catch (error: any) {
         return new AppError(500, "Falha ao criar depósito via pix ", error);
      }
   }

   public async Send(correlationId: string,value: number,pixKey: string,pixKeyType: string): Promise<OpenPixSend | AppError> {
      try {
         const payment = await this.axios.post("/v1/pay/pix-key", { correlationId, value, pixKey, pixKeyType });
         const confirm = await this.axios.post("/v1/pay/confirm", { correlationId });
         return {
            externalId: confirm.data.payment.correlationID,
            externalStatus: confirm.data.payment.destination.status,
         };
      } catch (error: any) {
         return new AppError(500, "Falha ao criar retirada via pix!", error);
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


