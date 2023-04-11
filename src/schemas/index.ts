import Joi from "joi";

export const ID = Joi.object({
   id: Joi.number().required().messages({
      "any.required": "Parâmetro 'id' é obrigatório!",
   }),
});
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
   athleticId: Joi.number().required(),
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
   winnerCommission: Joi.number().required(),
   status: Joi.string().valid("open", "pendent", "closed").required(),
   modality: Joi.string().max(60).required(),
   location: Joi.string().max(60).required(),
   startDate: Joi.date().required(),
});

export const update_game = Joi.object({
   gameId: Joi.number().required(),
   eventId: Joi.number().required(),
   name: Joi.string().max(60).required(),
   winnerCommission: Joi.number().required(),
   status: Joi.string().valid("open", "pendent", "closed").required(),
   modality: Joi.string().max(70).required(),
   location: Joi.string().max(60).required(),
   startDate: Joi.date().required(),
});

export const create_odd = Joi.object({
   gameId: Joi.number().required(),
   teamId: Joi.number().required(),
   name: Joi.string().max(60).required(),
   payout: Joi.number().required(),
   maxBetAmount: Joi.number().required(),
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
   offer: Joi.boolean().required(),
   status: Joi.string().valid("open", "lock").optional(),
});

export const update_wallet = Joi.object({
   walletId: Joi.number().required(),
   balance: Joi.number().required(),
   score: Joi.number().required(),
   bonus: Joi.number().required(),
   updatedAt: Joi.date().required(),
});

export const create_player = Joi.object({
   teamId: Joi.number().required(),
   name: Joi.string().max(40).required(),
   position: Joi.string().max(40).required(),
   holder: Joi.boolean().required(),
});

export const update_player = Joi.object({
   playerId: Joi.number().required(),
   teamId: Joi.number().required(),
   name: Joi.string().max(40).required(),
   position: Joi.string().max(40).required(),
   holder: Joi.boolean().required(),
});

export const multiple_bets = Joi.array().items(
   Joi.object({
      oddId: Joi.number().required(),
      amount: Joi.number().required(),
   })
);

export const create_deposit = Joi.object({
   amount: Joi.number().required(),
});

export const process_game = Joi.object({
   winnerOddId: Joi.number().required(),
   teamA: Joi.object({
      id: Joi.number().required(),
      goals: Joi.number().required(),
   }),
   teamB: Joi.object({
      id: Joi.number().required(),
      goals: Joi.number().required(),
   }),
});

export const create_game_history = Joi.object({
   event: Joi.string().required(),
   teamA: Joi.string().required(),
   teamB: Joi.string().required(),
   scoreA: Joi.number().required(),
   scoreB: Joi.number().required(),
   ref_table: Joi.string().optional(),
   date: Joi.date().optional(),


});