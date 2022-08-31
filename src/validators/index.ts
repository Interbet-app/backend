import Joi from "joi";
import { Response } from "express";
import logger from "../log";

export function ValidateSchema(schema: Joi.ObjectSchema | Joi.ArraySchema, object: any, res: Response, next: any) {
   try {
      let { error } = schema.validate(object);
      if (error == null) return next();
      let message = error?.details.map((item) => item.message).join(",");
      res.status(422).json({ message: message });
   } catch (error) {
      if (error instanceof Error) logger.error(error.message);
      res.status(500).json({ message: "Internal Server Error!" });
   }
}

