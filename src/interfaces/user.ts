export interface IUser {
   id?: number;
   name: string;
   externalId: string;
   oauth: "google" | "ig" | "facebook";
   email: string;
   team?: string;
   picture?: string;
   affiliateId?: number;
   createdAt: Date;
   updatedAt: Date;
}

