export interface IUser {
   id?: number;
   name: string;
   athleticId?: number;
   betmotionUserID?: string;
   betmotionUserToken?: string;
   maxBetAmount?: number;
   createdAt: Date;
   updatedAt: Date;
}
