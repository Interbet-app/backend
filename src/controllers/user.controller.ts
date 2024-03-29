import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt, Token } from "../auth";
// import { users, wallets, notifications } from "../models";
import { users } from "../models";
import { IUser } from "../interfaces";
//import axios from "axios";
import AppError from "../error";
// import logger from "../log";
import { getAccountDetails, getBalance } from "../services";
import axios from "axios";

export type UserToken = {
   userId: number;
};

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

export async function GetMotionUser(req: Request, res: Response, next: any) {
   try {
      const authorization = req.headers["authorization"] as string;
      if (!authorization) throw new AppError(422, "Authorization header is required!");

      const [_, token] = authorization.split(" ");
      const response = await axios({
         method: "POST",
         url: "https://bmapi-staging.salsaomni.com/games/start.do?language=BR&platform=DESKTOP",
         data: {
            id: 7164,
            mode: "REAL",
            platform: "DESKTOP",
            language: "BR",
         },
         headers: {
            Authorization: `Bearer ${token}`,
         },
      });

      const userInfo = await getAccountDetails({ token: response.data.token });
      if (!userInfo) throw new AppError(422, "Invalid token!");

      const userBalanceInfo = await getBalance({ userToken: userInfo.token });
      if (!userBalanceInfo?.externalUserID) throw new AppError(400, "Erro");

      const userExists = await users.findOne({ where: { name: userBalanceInfo?.externalUserID } });
      if (!userExists) {
         const user = await users.create({
            name: userBalanceInfo.externalUserID,
            betMotionId: userInfo.externalUserID,
            createdAt: new Date(),
            updatedAt: new Date(),
         });

         return res.status(200).json({
            token: userBalanceInfo?.token,
            betMotionId: userInfo.externalUserID,
            balance: Number(userBalanceInfo?.balance) / 100,
            name: user.name,
            athleticId: null,
         });
      }

      res.status(200).json({
         token: userBalanceInfo?.token,
         betMotionId: userInfo.externalUserID,
         balance: Number(userBalanceInfo?.balance) / 100,
         name: userExists.name,
         athleticId: userExists.athleticId,
      });
   } catch (error) {
      console.log(error);
      next(error);
   }
}

export async function GetAllUsers(_req: Request, res: Response, next: any) {
   try {
      const accounts = await users.findAll();
      const response = accounts.map((account) => account as IUser);
      res.status(200).json(response);
   } catch (error) {
      next(error);
   }
}
// export async function GoogleOAuth(req: Request, res: Response, next: any) {
//    try {
//       const { affiliateId } = req.body;
//       const { email, email_verified, name, picture, sub } = res.locals.payload;
//       if (!email_verified) throw new AppError(401, "Seu email do Google não foi verificado!");
//       let user = await users.findOne({ where: { email } });
//       if (!user) {
//          user = await users.create({
//             name,
//             email,
//             externalId: sub,
//             oauth: "google",
//             level: 1,
//             picture,
//             affiliateId,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//          });
//          if (!user) throw new AppError(500, "Internal server error");

//          //% creditar os bonus de indicação para o afiliado e o novo usuário
//          logger.info(`User ${user.id} created with affiliateId ${affiliateId}`);
//          if (affiliateId) await CrediteBonus(next, affiliateId, user.id!, user.email);
//       }
//       const token = await Jwt.sign(user.id!, next);
//       res.status(200).json({
//          token,
//          name: user.name,
//          email: user.email,
//          picture: user.picture,
//          level: user.level,
//          affiliateId: user.affiliateId,
//          createdAt: user.createdAt,
//          updatedAt: user.updatedAt,
//          oauth: user.oauth,
//          teamId: user.teamId,
//       });
//    } catch (error) {
//       next(error);
//    }
// }
// export async function FacebookOAuth(req: Request, res: Response, next: any) {
//    try {
//       const { id, email, name, picture, accessToken, affiliateId } = req.body;
//       res.status(200).json({ message: "Desligado temporariamente" });
//       // //! Validar token aqui posteriormente (verificar se é valido)
//       // let user = await users.findOne({ where: { email } });
//       // if (!user) {
//       //    user = await users.create({
//       //       name: name,
//       //       email: email,
//       //       externalId: id,
//       //       oauth: "facebook",
//       //       picture: picture,
//       //       level: 1,
//       //       affiliateId,
//       //       createdAt: new Date(),
//       //       updatedAt: new Date(),
//       //    });
//       //    if (!user) throw new AppError(500, "Internal server error");

//       //% creditar os bonus de indicação para o afiliado e o novo usuário
//       //if (affiliateId) await CrediteBonus(next, affiliateId, user.id!, user.email);

//       // const token = await Jwt.sign(user.id!, next);
//       // res.status(200).json({
//       //    token,
//       //    name: user.name,
//       //    email: user.email,
//       //    picture: user.picture,
//       //    level: user.level,
//       //    affiliateId: user.affiliateId,
//       //    createdAt: user.createdAt,
//       //    updatedAt: user.updatedAt,
//       //    oauth: user.oauth,
//       //    teamId: user.teamId,
//       // });
//    } catch (error) {
//       next(error);
//    }
// }
// export async function InstagramOAuth(req: Request, res: Response, next: any) {
//    try {
//       const { code, affiliateId } = req.body;
//       res.status(200).json({ message: "Desligado temporariamente" });
//       // if (!code) throw new AppError(400, "Código de autorização não encontrado");
//       // const data = {
//       //    client_id: INSTAGRAM_CLIENT_ID,
//       //    client_secret: INSTAGRAM_CLIENT_SECRET,
//       //    grant_type: "authorization_code",
//       //    redirect_uri: INSTAGRAM_REDIRECT_URI,
//       //    code: code,
//       // };

//       // axios({
//       //    url: "https://api.instagram.com/oauth/access_token",
//       //    method: "POST",
//       //    headers: { "Content-Type": "application/x-www-form-urlencoded" },
//       //    data: new URLSearchParams(data),
//       // })
//       //    .then((response) => {
//       //       const { access_token } = response.data;
//       //       axios({
//       //          url: `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`,
//       //          method: "GET",
//       //       })
//       //          .then(async (response) => {
//       //             const { id, username } = response.data;
//       //             let user = await users.findOne({ where: { externalId: id } });
//       //             if (!user) {
//       //                user = await users.create({
//       //                   name: username,
//       //                   email: username,
//       //                   externalId: id,
//       //                   oauth: "instagram",
//       //                   level: 1,
//       //                   affiliateId,
//       //                   createdAt: new Date(),
//       //                   updatedAt: new Date(),
//       //                });
//       //% creditar os bonus de indicação para o afiliado e o novo usuário
//       //if (affiliateId) await CrediteBonus(next, affiliateId, user.id!, user.email);

//       //             const token = await Jwt.sign(user.id!, next);
//       //             res.status(200).json({
//       //                token,
//       //                level: user.level,
//       //                oauth: user.oauth,
//       //                name: user.name,
//       //                email: user.email,
//       //                picture: user.picture,
//       //                teamId: user.teamId,
//       //                affiliateId: user.affiliateId,
//       //                createdAt: user.createdAt,
//       //                updatedAt: user.updatedAt,
//       //             });
//       //          })
//       //          .catch((error) => {
//       //             res.status(500).json({ message: "Internal server error", error });
//       //          });
//       //    })
//       //    .catch((error) => {
//       //       res.status(500).json({ message: "Erro ao obter o token de acesso", error });
//       //    });
//    } catch (error) {
//       next(error);
//    }
// }
export async function UserUpdate(req: Request, res: Response, next: any) {
   try {
      const { athleticId } = req.body;
      // const token = Jwt.getLocals(res, next) as Token;
      const { id } = req.user;
      const user = await users.findByPk(id);
      if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
      if (athleticId) user.athleticId = athleticId;
      user.updatedAt = new Date();
      await user.save();
      res.status(200).json(user as IUser);
   } catch (error) {
      next(error);
   }
}
export async function UserSetMaxBet(req: Request, res: Response, next: any) {
   try {
      const { maxBetAmount, userId } = req.body;
      const user = await users.findByPk(userId);
      if (!user) return res.status(401).json({ message: "Usuário não encontrado" });
      if (maxBetAmount) user.maxBetAmount = maxBetAmount;
      user.updatedAt = new Date();
      await user.save();
      res.status(200).json({ message: "Valor máximo de aposta alterado com sucesso!" });
   } catch (error) {
      next(error);
   }
}
// export async function UserProfile(req: Request, res: Response, next: any) {
//    try {
//       const token = Jwt.getLocals(res, next) as Token;
//       const { document, pixAddress, pixKeyType, name } = req.body;
//       const user = await users.findByPk(token.userId);
//       if (!user) return res.status(401).json({ message: "Usuário não encontrado" });

//       if (document && user.document != null)
//          return res.status(401).json({ message: "Você já cadastrou um CPF, para altera-lo entre em contato com o suporte!" });
//       if (document) {
//          document.replace(".", "");
//          document.replace("-", "");
//          const validator = new RegExp(/^[0-9]{11}$/);
//          if (!validator.test(document)) return res.status(401).json({ message: "CPF inválido" });
//          const search = await users.findOne({ where: { document } });
//          if (search) return res.status(401).json({ message: "CPF já informado ja esta cadastrado!" });
//          user.document = document;
//       }
//       user.pixAddress = pixAddress;
//       user.pixKeyType = pixKeyType;
//       user.name = name;
//       user.updatedAt = new Date();
//       await user.save();

//       res.status(200).json(user as IUser);
//    } catch (error) {
//       next(error);
//    }
// }
export async function Logout(_req: Request, res: Response, next: any) {
   try {
      const token = Jwt.getLocals(res, next) as Token;
      Cache.set(`${token.userId}`, token.jwt, 1800);
      res.status(200).json({ message: "Logout realizado com sucesso" });
   } catch (error) {
      next(error);
   }
}

export async function DeleteUser(req: Request, res: Response, next: any) {
   try {
      const userId = parseInt(req.params.id, 10);
      await users.destroy({ where: { id: userId } });
      res.status(200).json({
         message: "Usuário excluído com sucesso!",
      });
   } catch (error) {
      next(error);
   }
}
// async function CrediteBonus(next: any, affiliateId: number, userId: number, userEmail: string) {
//    try {
//       //% creditar os bonus de indicação para o afiliado e o novo usuário
//       await wallets.create({
//          userId: userId,
//          balance: 0,
//          bonus: 10,
//          score: 0,
//          createdAt: new Date(),
//          updatedAt: new Date(),
//       });
//       const wallet = await wallets.findOne({ where: { userId: affiliateId } });
//       if (wallet) {
//          wallet.bonus = Number(wallet.bonus) + 10;
//          wallet.updatedAt = new Date();
//          await wallet.save();
//       } else {
//          await wallets.create({
//             userId: affiliateId,
//             balance: 0,
//             bonus: 10,
//             score: 0,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//          });
//       }

//       //% notificar o afiliado e o novo usuário
//       await notifications.bulkCreate([
//          {
//             userId: userId,
//             title: "Bonus de indicação",
//             message: "Parabéns, você ganhou R$ 10,00 de bonus por se cadastrar com o link de indicação de um amigo.",
//             createdAt: new Date(),
//             updatedAt: new Date(),
//          },
//          {
//             userId: affiliateId,
//             title: "Bônus de indicação",
//             message: `Parabéns, você ganhou R$ 10,00 de bônus por indicar o usuário ${userEmail}!`,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//          },
//       ]);
//    } catch (error) {
//       next(error);
//    }
// }
