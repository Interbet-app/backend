import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt, Token } from "../auth";
import { users } from "../models";
import { IUser } from "../interfaces";
import axios from "axios";
import AppError from "../error";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID as string;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET as string;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI as string;

export async function GetUser(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const user = await users.findByPk(token.userId);
      if (!user) throw new AppError(404, "Usuário não encontrado");
      res.status(200).json(user as IUser);
   } catch (error) {
      next(error);
   }
}
export async function GoogleOAuth(req: Request, res: Response, next: any) {
   try {
      const affiliateId = req.body.affiliateId;
      const { email, email_verified, name, picture, sub } = res.locals.payload;
      if (!email_verified) throw new AppError(401, "Seu email do Google não foi verificado!");
      let user = await users.findOne({ where: { email } });
      if (!user) {
         user = await users.create({
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
      let user = await users.findOne({ where: { email } });
      if (!user) {
         user = await users.create({
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
      if (!code) throw new AppError(400, "Código de autorização não encontrado");
      const data = {
         client_id: INSTAGRAM_CLIENT_ID,
         client_secret: INSTAGRAM_CLIENT_SECRET,
         grant_type: "authorization_code",
         redirect_uri: INSTAGRAM_REDIRECT_URI,
         code: code,
      };

      axios({
         url: "https://api.instagram.com/oauth/access_token",
         method: "POST",
         headers: { "Content-Type": "application/x-www-form-urlencoded" },
         data: new URLSearchParams(data),
      })
         .then((response) => {
            const { access_token } = response.data;
            axios({
               url: `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`,
               method: "GET",
            })
               .then(async (response) => {
                  const { id, username } = response.data;
                  let user = await users.findOne({ where: { externalId: id } });
                  if (!user)
                     user = await users.create({
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
                  res.status(500).json({ message: "Internal server error", error });
               });
         })
         .catch((error) => {
            res.status(500).json({ message: "Erro ao obter o token de acesso", error });
         });
   } catch (error) {
      next(error);
   }
}
export async function UserUpdate(req: Request, res: Response, next: any) {
   try {
      const { name, email, picture, teamId } = req.body;
      const token = Jwt.getLocals(res, next) as Token;
      const user = await users.findByPk(token.userId);
      if (!user) throw new AppError(404, "Usuário não encontrado");
      if (name) user.name = name;
      if (email) user.email = email;
      if (picture) user.picture = picture;
      if (teamId) user.teamId = teamId;
      user.updatedAt = new Date();
      await user.save();
      res.status(200).json(user as IUser);
   } catch (error) {
      next(error);
   }
}
export async function Logout(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      Cache.set(`${token.userId}`, token.jwt, 1800);
      res.status(200).json({ message: "Logout realizado com sucesso" });
   } catch (error) {
      next(error);
   }
}

