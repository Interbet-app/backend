export interface IDeposit {
   id?: number;
   userId: number;
   clientSecret: string;
   amount: number;
   status: "created" | "pendent" | "completed" | "canceled";
   createdAt: Date;
   updatedAt: Date;
}
