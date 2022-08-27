export interface IDeposit {
   id?: number;
   userId: number;
   amount: number;
   status: "pendent" | "completed" | "canceled";
   externalUrl?: string;
   externalStatus?: string;
   externalId?: string;
   externalQrCode?: string;
   externalQrCodeContent?: string;
   externalAmount?: number;
   expireAt?: Date;
   createdAt: Date;
   updatedAt: Date;
}
