export interface IGame {
   id: number;
   eventId: number;
   winnerOddId?: number;
   name: string;
   status: "open" | "pendent" | "closed" | "postponed";
   modality: string;
   location: string;
   winnerCommission?: number;
   goalsA?: number;
   goalsB?: number;
   group?: string;
   startDate: Date;
   createdAt: Date;
   updatedAt: Date;
}
