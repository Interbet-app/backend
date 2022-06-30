export interface IGame {
   id?: number;
   eventId: number;
   allowOdds: Array<number>;
   name: string;
   status: "open" | "pendent" | "closed";
   modality: string;
   winnerOdd: number;
   result: string;
   createdAt: Date;
   updatedAt: Date;
}
