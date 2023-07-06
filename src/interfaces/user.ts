export interface IUser {
   id?: number;
   name: string;
   athleticId?: number;
   betmotionUserID?: string;
   betmotionUserToken?: string;
   maxBetAmount?: number | null;
   createdAt: Date;
   updatedAt: Date;
   anonymous?: boolean;
}
