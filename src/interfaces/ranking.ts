export interface IRanking {
   id?: number;
   eventId?: number;
   teamId: number;
   name: string;
   score: number;
   goalFor: number;
   goalAgainst: number;
   goalDifference: number;
   wins: number;
   draws: number;
   losses: number;
}