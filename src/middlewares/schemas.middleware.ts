import { Request, Response } from "express";
import { ValidateSchema } from "../validators";
import * as Schemas from "../schemas";

export function ID(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.ID, req.params, res, next);
}
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
export function CreateEvent(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.create_event, req.body, res, next);
}
export function CreateGame(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.create_game, req.body, res, next);
}
export function UpdateGame(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.update_game, req.body, res, next);
}
export function CreateOdd(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.create_odd, req.body, res, next);
}
export function UpdateOdd(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.update_odd, req.body, res, next);
}
export function UpdateWallet(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.update_wallet, req.body, res, next);
}
export function CreatePlayer(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.create_player, req.body, res, next);
}
export function UpdatePlayer(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.update_player, req.body, res, next);
}
export function MultipleBets(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.multiple_bets, req.body, res, next);
}
export function CreateDeposit(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.create_deposit, req.body, res, next);
}
export function ProcessGame(req: Request, res: Response, next: any) {
   return ValidateSchema(Schemas.process_game, req.body, res, next);
}