export interface IUser {
   id?: number;
   affiliateId?: number;
   externalId: string;
   teamId?: number;
   name: string;
   oauth: "google" | "instagram" | "facebook";
   email: string;
   level: number;
   picture?: string;
   document?: string;
   pixAddress?: string;
   pixKeyType?: string;
   createdAt: Date;
   updatedAt: Date;
}

