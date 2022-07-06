import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt } from "../utils/jwt";
import { Token } from "../types";
import { Users } from "../repositories";
import axios from "axios";
import logger from "../log";

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID as string;
export async function GoogleOAuth(_req: Request, res: Response) {
   try {
      const { email, email_verified, name, picture, sub } = res.locals.payload;
      if (!email_verified) return res.status(403).json({ message: "Your Google account e-mail is not verified!" });
      const user = await Users.getByEmail(email);
      if (!user) {
         const newUser = await Users.create({
            name,
            email,
            externalId: sub,
            oauth: "google",
            picture,
            createdAt: new Date(),
            updatedAt: new Date(),
         });
         if (!newUser) return res.status(500).json({ message: "Internal server error!" });
         const token = await Jwt.sign(newUser.id!);
         res.status(200).json({
            token,
            name: newUser.name,
            email: newUser.email,
            picture: newUser.picture,
            oauth: newUser.oauth,
            team: newUser.team,
            affiliateId: newUser.affiliateId,
         });
      } else {
         const token = await Jwt.sign(user.id!);
         res.status(200).json({
            token,
            name: user.name,
            email: user.email,
            picture: user.picture,
            oauth: user.oauth,
            team: user.team,
            affiliateId: user.affiliateId,
         });
      }
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function FacebookOAuth(req: Request, res: Response) {
   try {
      const { id,email,name,picture,accessToken } = req.body;
      const user = await Users.getByEmail(email);
      if (!user) {
         const newUser = await Users.create({
            name: name,
            email: email,
            externalId: id,
            oauth: "facebook",
            picture: picture,
            createdAt: new Date(),
            updatedAt: new Date(),
         });

         if (!newUser) return res.status(500).json({ message: "Internal server error!" });
         const token = await Jwt.sign(newUser.id!);
         return res.status(200).json({ token, ...newUser, externalId: "" });
      } else {
         const token = await Jwt.sign(user.id!);
         return res.status(200).json({ token, ...user, externalId: "" });
      }
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function InstagramOAuth(req: Request, res: Response) {
   try {
      const code = req.params.code as string;
      if (!code) return res.status(422).send("Missing code");
      const data = {
         client_id: `${INSTAGRAM_CLIENT_ID}`,	
         client_secret: "fc74264bbd409c00bfc0e1fc607e1a5d",
         grant_type: "authorization_code",
         redirect_uri: "https://social-login-ig.herokuapp.com/oauth/ig/",
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
                  const user = await Users.getExternalId(id);
                  if (!user) return res.status(200).json({ id, username });
                  const token = await Jwt.sign(user.id!);
                  res.status(200).json({
                     token,
                     name: user.name,
                     email: user.email,
                     picture: user.picture,
                     oauth: user.oauth,
                     team: user.team,
                     affiliateId: user.affiliateId,
                  });
               })
               .catch(() => res.status(500).json({ message: "Error get user id and username from ig API!" }));
         })
         .catch(() => res.status(500).json({ message: "Error get user access_token from ig API!" }));
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal Server Error" });
   }
}
export async function InstagramUserRegister(req: Request, res: Response) {
   try {
      const { name, email, id, picture, team, affiliateId } = req.body;
      let user;
      user = await Users.getByEmail(email);
      if (!user) {
         user = await Users.create({
            name,
            email,
            externalId: id,
            oauth: "ig",
            picture,
            createdAt: new Date(),
            updatedAt: new Date(),
            team,
            affiliateId,
         });
      }
      
      const token = await Jwt.sign(user.id!);
      return res.status(200).json({
         token,
         name: user.name,
         email: user.email,
         picture: user.picture,
         oauth: user.oauth,
         team: user.team,
         affiliateId: user.affiliateId,
      });
   } catch (error) {
      logger.error(error);
      res.status(500).json({ message: "Internal server error!" });
   }
}
export async function UserUpdate(req: Request, res: Response) {
   try {
      const { name, email, picture, team, affiliateId } = req.body;
      const token = Jwt.getLocals(res) as Token;
      const user = await Users.getById(token.userId);
      if (!user) return res.status(404).json({ message: "User not found!" });
      if (name) user.name = name;
      if (email) user.email = email;
      if (picture) user.picture = picture;
      if (team) user.team = team;
      if (affiliateId) user.affiliateId = affiliateId;
      await user.save();
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

