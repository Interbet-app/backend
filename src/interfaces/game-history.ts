
export interface IGameHistory {
   id?: number;
   gameId: number;
   event: string;
   teamA: string;
   teamB: string;
   scoreA: number;
   scoreB: number;
   confrontType?: string;
   gender: string;
   serie: string;
   date?: Date;
}