export interface IBet {
   id?: number;
   userId: number;
   oddId: number;
   payout: number;
   amount: number;
   status: "pendent" | "completed";
   result: "pendent" | "win" | "lose";
   bonusPercent: number;
   paid: boolean;
   group?: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface NewBet {
   oddId: number;
   amount: number;
}