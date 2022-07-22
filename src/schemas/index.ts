import Joi from "joi";

export const google_oauth = Joi.object({
   affiliateId: Joi.number().optional(),
});

export const facebook_oauth = Joi.object().keys({
   accessToken: Joi.string().required(),
   id: Joi.string().required(),
   email: Joi.string().required(),
   name: Joi.string().required(),
   picture: Joi.string().required(),
   affiliateId: Joi.number().optional(),
});

export const instagram_oauth = Joi.object().keys({
   code: Joi.string().required(),
   affiliateId: Joi.number().optional(),
});

export const update_user = Joi.object({
   name: Joi.string().max(60).required(),
   teamId: Joi.number().required(),
});

export const create_maintenance = Joi.object({
   userId: Joi.number().required(),
   path: Joi.string().required(),
   method: Joi.string().valid("ALL", "DELETE", "GET", "POST", "PUT", "PATCH").required(),
   group: Joi.string().optional(),
});

export const create_event = Joi.object({
   name: Joi.string().max(60).required(),
   description: Joi.string().max(255).required(),
   title: Joi.string().max(40).required(),
   location: Joi.string().max(80).required(),
});

export const create_game = Joi.object({
   eventId: Joi.number().required(),
   name: Joi.string().max(40).required(),
   status: Joi.string().valid("open", "pendent", "closed").required(),
   modality: Joi.string().max(60).required(),
   location: Joi.string().max(60).required(),
   startDate: Joi.date().required(),
});

export const update_game = Joi.object({
   gameId: Joi.number().required(),
   name: Joi.string().max(60).required(),
   status: Joi.string().valid("open", "pendent", "closed").required(),
   modality: Joi.string().max(70).required(),
   location: Joi.string().max(60).required(),
   startDate: Joi.date().required(),
   winnerOddId: Joi.number().optional(),
   result: Joi.string().max(60).optional(),
});

export const create_odd = Joi.object({
   gameId: Joi.number().required(),
   teamId: Joi.number().required(),
   name: Joi.string().max(60).required(),
   payout: Joi.number().required(),
   maxBetAmount: Joi.number().required(),
   score: Joi.number().required(),
   offer: Joi.boolean().required(),
   status: Joi.string().valid("open", "lock").optional(),
});

export const update_odd = Joi.object({
   oddId: Joi.number().required(),
   gameId: Joi.number().required(),
   teamId: Joi.number().required(),
   name: Joi.string().max(60).required(),
   payout: Joi.number().required(),
   maxBetAmount: Joi.number().required(),
   score: Joi.number().required(),
   offer: Joi.boolean().required(),
   status: Joi.string().valid("open", "lock").optional(),
});

export const update_wallet = Joi.object({
   walletId: Joi.number().required(),
   balance: Joi.number().optional(),
   score: Joi.number().optional(),
   blocked: Joi.number().optional(),
   updatedAt: Joi.date().required(),
});
