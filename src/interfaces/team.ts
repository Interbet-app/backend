export interface ITeam {
   id?: number;
   adminId?: number;
   athleticId: number;
   name: string;
   abbreviation: string;
   location: string;
   picture: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface TeamResult {
   id: number;
   goals: number;
}