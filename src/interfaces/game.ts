export interface IGame {
   id?: number;
   eventId: number;
   winnerOddId: number;
   name: string;
   status: "open" | "pendent" | "closed";
   modality: string;
   result: string;
   createdAt: Date;
   updatedAt: Date;
}
