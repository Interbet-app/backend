export interface IWithdrawal {
   id?: number;
   userId: number;
   amount: number;
   status: "created" | "pendent" | "completed"| "canceled";
   createdAt: Date;
   updatedAt: Date;
}