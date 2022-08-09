export interface IDeposit {
   id?: number;
   userId: number;
   amount: number;
   status: "pendent" | "completed" | "canceled";
   mp_id?: number;
   mp_status?: string;
   mp_ticker_url?: string;
   mp_qr_code?: string;
   mp_expires?: Date;
   createdAt: Date;
   updatedAt: Date;
}
