export interface IBet {
   id?: number;
   userId: number;
   oddId: number;
   payout: number;
   amount: number;
   status: "pendent" | "completed" | "refund" | "canceled";
   result: "pendent" | "win" | "lose";
   bonusPercent: number;
   award: "not" | "pending" | "completed";
   paid: boolean;
   betmotion: boolean;
   group?: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface NewBet {
   oddId: number;
   amount: number;
}
