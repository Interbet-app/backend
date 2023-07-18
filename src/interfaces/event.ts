export interface IEvent {
   id?: number;
   name: string;
   title: string;
   description: string;
   location: string;
   startDate: Date;
   endDate: Date;
   createdAt: Date;
   type: "stitches" | "kill";
   updatedAt: Date;
}