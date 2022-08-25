export interface IGame {
   id?: number;
   eventId: number;
   winnerOddId?: number;
   name: string;
   status: "open" | "pendent" | "closed";
   modality: string;
   location: string;
   result?: string;
   startDate: Date;
   createdAt: Date;
   updatedAt: Date;
}

