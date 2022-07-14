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