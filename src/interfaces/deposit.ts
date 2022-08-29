export interface IDeposit {
   id?: number;
   uniqueId: string;
   userId: number;
   amount: number;
   status: "pendent" | "completed" | "canceled";
   externalUrl?: string;
   externalStatus?: string;
   externalTransactionId?: string;
   externalQrCode?: string;
   externalQrCodeContent?: string;
   externalAmount?: number;
   expireAt?: Date;
   createdAt: Date;
   updatedAt: Date;
}
