import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt } from "../utils/jwt";
import { Token } from "../types";
import { Users } from "../repositories";
import axios from "axios";
import logger from "../log";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID as string;
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET as string;
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI as string;

export async function GetUser(_req: Request, res: Response) {
   try {
      const token = Jwt.getLocals(res) as Token;
      const user = await Users.getById(token.userId);
      if (!user) return res.status(404).json({ message: "User not found!" });
      return res.status(200).json({ ...user, externalId: "" });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function GoogleOAuth(req: Request, res: Response) {
   try {
      const affiliateId = parseInt(req.body.affiliateId, 10);
      const { email, email_verified, name, picture, sub } = res.locals.payload;
      if (!email_verified) return res.status(403).json({ message: "Your Google account e-mail is not verified!" });
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
         if (!user) return res.status(500).json({ message: "Internal server error!" });
      }
      const token = await Jwt.sign(user.id!);
      res.status(200).json({ token, ...user, externalId: "" });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function FacebookOAuth(req: Request, res: Response) {
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
         if (!user) return res.status(500).json({ message: "Internal server error!" });
      }
      const token = await Jwt.sign(user.id!);
      return res.status(200).json({ token, ...user, externalId: "" });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function InstagramOAuth(req: Request, res: Response) {
   try {
      const { code, affiliateId } = req.body;
      if (!code) return res.status(422).send("Missing code");
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
            const { access_token } = response.data;
            axios({ url: `/me?fields=id,username&access_token=${access_token}`, method: "GET" })
               .then(async (response) => {
                  const { id, username } = response.data;
                  let user = await Users.getExternalId(id);
                  if (!user) {
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
                  }
                  const token = await Jwt.sign(user.id!);
                  res.status(200).json({ token, ...user, externalId: "" });
               })
               .catch(() => res.status(500).json({ message: "Error get user id and username from ig API!" }));
         })
         .catch(() => res.status(500).json({ message: "Error get user access_token from ig API!" }));
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal Server Error" });
   }
}
export async function UserUpdate(req: Request, res: Response) {
   try {
      const { name, email, picture, teamId, affiliateId } = req.body;
      const token = Jwt.getLocals(res) as Token;
      const user = await Users.getById(token.userId);
      if (!user) return res.status(404).json({ message: "User not found!" });
      if (name) user.name = name;
      if (email) user.email = email;
      if (picture) user.picture = picture;
      if (teamId) user.teamId = teamId;
      await Users.update(user);
      res.status(200).json({ ...user, externalId: "" });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function Logout(_req: Request, res: Response) {
   try {
      const token = Jwt.getLocals(res) as Token;
      if (!token) return res.status(401).json({ message: "Token not found!" });
      Cache.set(`${token.userId}`, token.jwt);
      return res.status(200).json({ message: "Logout successful!" });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal Server Error!" });
   }
}



