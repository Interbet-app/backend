export interface IPlayer {
   id: number;
   teamId: number;
   name: string;
   position: string;
   holder: boolean;
   createdAt: Date;
   updatedAt: Date;
}