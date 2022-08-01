import { Request, Response } from "express";
import { Cache } from "../cache";
import AppError from "../error";
import { Jwt } from "../auth";
import { Token } from "../types";
import { Users } from "../repositories";
import axios from "axios";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID as string;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET as string;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI as string;

export async function GetUser(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const user = await Users.getById(token.userId);
      if (!user) throw new AppError(404, "User not found");
      res.status(200).json({
         level: user.level,
         oauth: user.oauth,
         name: user.name,
         email: user.email,
         picture: user.picture,
         teamId: user.teamId,
         affiliateId: user.affiliateId,
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function GoogleOAuth(req: Request, res: Response, next: any) {
   try {
      const affiliateId = req.body.affiliateId;
      const { email, email_verified, name, picture, sub } = res.locals.payload;
      if (!email_verified) throw new AppError(401, "Your Google account e-mail is not verified!");
      let user = await Users.getByEmail(email);
      if (!user) {
         user = await Users.create({
            name,
            email,
            externalId: sub,
            oauth: "google",
            level: 1,
            picture,
            affiliateId,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
         if (!user) throw new AppError(500, "Internal server error");
      }
      const token = await Jwt.sign(user.id!, next);
      res.status(200).json({
         token,
         name: user.name,
         email: user.email,
         picture: user.picture,
         level: user.level,
         affiliateId: user.affiliateId,
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
         oauth: user.oauth,
         teamId: user.teamId,
      });
   } catch (error) {
      next(error);
   }
}
export async function FacebookOAuth(req: Request, res: Response, next: any) {
   try {
      const { id, email, name, picture, accessToken, affiliateId } = req.body;
      //! Validar token aqui posteriormente (verificar se é valido)
      let user = await Users.getByEmail(email);
      if (!user) {
         user = await Users.create({
            name: name,
            email: email,
            externalId: id,
            oauth: "facebook",
            picture: picture,
            level: 1,
            affiliateId,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
         if (!user) throw new AppError(500, "Internal server error");
      }
      const token = await Jwt.sign(user.id!, next);
      res.status(200).json({
         token,
         name: user.name,
         email: user.email,
         picture: user.picture,
         level: user.level,
         affiliateId: user.affiliateId,
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
         oauth: user.oauth,
         teamId: user.teamId,
      });
   } catch (error) {
      next(error);
   }
}
export async function InstagramOAuth(req: Request, res: Response, next: any) {
   try {
      const { code, affiliateId } = req.body;
      if (!code) throw new AppError(400, "Missing code param!");
      const data = {
         client_id: INSTAGRAM_CLIENT_ID,
         client_secret: INSTAGRAM_CLIENT_SECRET,
         grant_type: "authorization_code",
         redirect_uri: INSTAGRAM_REDIRECT_URI,
         code: code,
      };

      axios({
         url: "/oauth/access_token",
         method: "POST",
         headers: { "Content-Type": "application/x-www-form-urlencoded" },
         data: new URLSearchParams(data),
      })
         .then((response) => {
            try {
               const { access_token } = response.data;
               axios({ url: `/me?fields=id,username&access_token=${access_token}`, method: "GET" })
                  .then(async (response) => {
                     const { id, username } = response.data;
                     let user = await Users.getExternalId(id);
                     if (!user)
                        user = await Users.create({
                           name: username,
                           email: username,
                           externalId: id,
                           oauth: "instagram",
                           level: 1,
                           affiliateId,
                           createdAt: new Date(),
                           updatedAt: new Date(),
                        });

                     const token = await Jwt.sign(user.id!, next);
                     res.status(200).json({
                        token,
                        level: user.level,
                        oauth: user.oauth,
                        name: user.name,
                        email: user.email,
                        picture: user.picture,
                        teamId: user.teamId,
                        affiliateId: user.affiliateId,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                     });
                  })
                  .catch((error) => {
                     throw new AppError(500, "Error get user id and username from ig API!", error);
                  });
            } catch (error) {
               console.log(error);
            }
         })
         .catch((error) => {
            throw new AppError(500, "Error get user access_token from ig API!", error);
         });
   } catch (error) {
      next(error);
   }
}
export async function UserUpdate(req: Request, res: Response, next: any) {
   try {
      const { name, email, picture, teamId } = req.body;
      const token = Jwt.getLocals(res, next) as Token;
      const user = await Users.getById(token.userId);
      if (!user) throw new AppError(404, "User not found!");
      if (name) user.name = name;
      if (email) user.email = email;
      if (picture) user.picture = picture;
      if (teamId) user.teamId = teamId;
      await user.save();
      res.status(200).json({
         level: user.level,
         oauth: user.oauth,
         name: user.name,
         email: user.email,
         picture: user.picture,
         teamId: user.teamId,
         affiliateId: user.affiliateId,
         createdAt: user.createdAt,
         updatedAt: user.updatedAt,
      });
   } catch (error) {
      next(error);
   }
}
export async function Logout(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      Cache.set(`${token.userId}`, token.jwt);
      res.status(200).json({ message: "Logout successful!" });
   } catch (error) {
      next(error);
   }
}

