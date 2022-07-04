export interface IBet {
   id?: number;
   userId: number;
   oddId: number;
   payout: number;
   amount: number;
   status: "pendent" | "completed";
   result: "pendent" | "win" | "lose";
   createdAt: Date;
   updatedAt: Date;
}
