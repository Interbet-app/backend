import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt, Token } from "../auth";
import { users, wallets, notifications } from "../models";
import { IUser } from "../interfaces";
//import axios from "axios";
import AppError from "../error";

// const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID as string;
// const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET as string;
// const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI as string;

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
      const { affiliateId } = req.body;
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

         //% creditar os bonus de indicação para o afiliado e o novo usuário
         if (affiliateId) await CrediteBonus(next, affiliateId, user.id!, user.email);
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
      res.status(200).json({ message: "Desligado temporariamente" });
      // //! Validar token aqui posteriormente (verificar se é valido)
      // let user = await users.findOne({ where: { email } });
      // if (!user) {
      //    user = await users.create({
      //       name: name,
      //       email: email,
      //       externalId: id,
      //       oauth: "facebook",
      //       picture: picture,
      //       level: 1,
      //       affiliateId,
      //       createdAt: new Date(),
      //       updatedAt: new Date(),
      //    });
      //    if (!user) throw new AppError(500, "Internal server error");

      //% creditar os bonus de indicação para o afiliado e o novo usuário
      //if (affiliateId) await CrediteBonus(next, affiliateId, user.id!, user.email);

      // const token = await Jwt.sign(user.id!, next);
      // res.status(200).json({
      //    token,
      //    name: user.name,
      //    email: user.email,
      //    picture: user.picture,
      //    level: user.level,
      //    affiliateId: user.affiliateId,
      //    createdAt: user.createdAt,
      //    updatedAt: user.updatedAt,
      //    oauth: user.oauth,
      //    teamId: user.teamId,
      // });
   } catch (error) {
      next(error);
   }
}
export async function InstagramOAuth(req: Request, res: Response, next: any) {
   try {
      const { code, affiliateId } = req.body;
      res.status(200).json({ message: "Desligado temporariamente" });
      // if (!code) throw new AppError(400, "Código de autorização não encontrado");
      // const data = {
      //    client_id: INSTAGRAM_CLIENT_ID,
      //    client_secret: INSTAGRAM_CLIENT_SECRET,
      //    grant_type: "authorization_code",
      //    redirect_uri: INSTAGRAM_REDIRECT_URI,
      //    code: code,
      // };

      // axios({
      //    url: "https://api.instagram.com/oauth/access_token",
      //    method: "POST",
      //    headers: { "Content-Type": "application/x-www-form-urlencoded" },
      //    data: new URLSearchParams(data),
      // })
      //    .then((response) => {
      //       const { access_token } = response.data;
      //       axios({
      //          url: `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`,
      //          method: "GET",
      //       })
      //          .then(async (response) => {
      //             const { id, username } = response.data;
      //             let user = await users.findOne({ where: { externalId: id } });
      //             if (!user) {
      //                user = await users.create({
      //                   name: username,
      //                   email: username,
      //                   externalId: id,
      //                   oauth: "instagram",
      //                   level: 1,
      //                   affiliateId,
      //                   createdAt: new Date(),
      //                   updatedAt: new Date(),
      //                });
      //% creditar os bonus de indicação para o afiliado e o novo usuário
      //if (affiliateId) await CrediteBonus(next, affiliateId, user.id!, user.email);

      //             const token = await Jwt.sign(user.id!, next);
      //             res.status(200).json({
      //                token,
      //                level: user.level,
      //                oauth: user.oauth,
      //                name: user.name,
      //                email: user.email,
      //                picture: user.picture,
      //                teamId: user.teamId,
      //                affiliateId: user.affiliateId,
      //                createdAt: user.createdAt,
      //                updatedAt: user.updatedAt,
      //             });
      //          })
      //          .catch((error) => {
      //             res.status(500).json({ message: "Internal server error", error });
      //          });
      //    })
      //    .catch((error) => {
      //       res.status(500).json({ message: "Erro ao obter o token de acesso", error });
      //    });
   } catch (error) {
      next(error);
   }
}
export async function UserUpdate(req: Request, res: Response, next: any) {
   try {
      const { name, email, picture, teamId } = req.body;
      const token = Jwt.getLocals(res, next) as Token;
      const user = await users.findByPk(token.userId);
      if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
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
export async function UserProfile(req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      const { document, pixAddress, pixKeyType, name } = req.body;
      const user = await users.findByPk(token.userId);
      if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
       
      if (document && user.document != null) return res.status(401).json({ message: "Você já cadastrou um CPF, para altera-lo entre em contato com o suporte!" });
      if (document) {
         const validator = new RegExp(/^[0-9]{11}$/);
         if (!validator.test(document)) return res.status(401).json({ message: "CPF inválido" });
         const search = await users.findOne({ where: { document } });
         if (search) return res.status(401).json({ message: "CPF já informado ja esta cadastrado!" });
         user.document = document;
      }
      user.pixAddress = pixAddress;
      user.pixKeyType = pixKeyType;
      user.name = name;
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
async function CrediteBonus(next: any, affiliateId: number, userId: number, userEmail: string) {
   try {
      //% creditar os bonus de indicação para o afiliado e o novo usuário
      wallets.create({
         userId: userId,
         balance: 0,
         bonus: 10,
         score: 0,
         createdAt: new Date(),
         updatedAt: new Date(),
      });
      const wallet = await wallets.findOne({ where: { userId: affiliateId } });
      if (wallet) {
         wallet.bonus += 10;
         wallet.updatedAt = new Date();
         await wallet.save();
      }

      //% notificar o afiliado e o novo usuário
      await notifications.bulkCreate([
         {
            userId: userId,
            title: "Bonus de indicação",
            message: "Parabéns, você ganhou R$ 10,00 de bonus por se cadastrar com o link de indicação de um amigo.",
            createdAt: new Date(),
            updatedAt: new Date(),
            unread: true,
         },
         {
            userId: affiliateId,
            title: "Bônus de indicação",
            message: `Parabéns, você ganhou R$ 10,00 de bônus por indicar o usuário ${userEmail}!`,
            unread: true,
            createdAt: new Date(),
            updatedAt: new Date(),
         },
      ]);
   } catch (error) {
      next(error);
   }
}
