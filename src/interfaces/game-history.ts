
export interface IGameHistory {
   id?: number;
   event: string;
   teamA: string;
   teamB: string;
   scoreA: number;
   scoreB: number;
   ref_table?: string;
   date?: string;

}