export interface IOdd {
   id?: number;
   name: string;
   team: string;
   payout: number;
   amount: number;
   maxBetAmount: number;
   payment: number;
   bets: number;
   score: number;
   offer: boolean;
   status: "open" | "lock";
   createdAt: Date;
   updatedAt: Date;
}
