export interface IOdd {
   id?: number;
   gameId: number;
   name: string;
   teamId: number;
   startPayOut: number;
   payout: number;
   amount: number;
   maxBetAmount: number;
   payment: number;
   bets: number;
   offer: boolean;
   status: "open" | "lock";
   createdAt: Date;
   updatedAt: Date;
}

