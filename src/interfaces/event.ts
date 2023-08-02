export interface IEvent {
   id?: number;
   name: string;
   title: string;
   description: string;
   location: string;
   createdAt: Date;
   type: "stitches" | "kill";
   gender?: string;
   updatedAt: Date;
}