import { Request, Response } from "express";
import { ValidateSchema } from "../validators";
import * as Schemas from "../schemas";

export function GoogleOAuthSchema(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.google_oauth, req.body, res, next);
}
export function FacebookOAuthSchema(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.facebook_oauth, req.body, res, next);
}
export function InstagramOAuthSchema(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.instagram_oauth, req.body, res, next);
}
export function CreateMaintenance(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.create_maintenance, req.body, res, next);
}