import { Request, Response } from "express";
import { Cache } from "../cache";
import { Jwt } from "../utils/jwt";
import { Token } from "../types";
import { Users } from "../repositories";
import axios from "axios";
import logger from "../log";

export async function GoogleOAuth(_req: Request, res: Response) {
   try {
      const { email, email_verified, name, picture, sub } = res.locals.payload;
      console.log(email, email_verified, name);
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

export async function FacebookOAuth(req: Request, res: Response) {
   try {
      const { userId, token } = req.body;
      const response = await axios({
         url: `https://graph.facebook.com/${userId}?fields=id,name,email,picture&access_token=${token}`,
         method: "GET",
         headers: { "Content-Type": "application/json" },
      });
      if (response.status !== 200) return res.status(500).json({ message: "Internal server error!" });
      console.log(response.data);

      const user = await Users.getByEmail(response.data.email);
      if (!user) {
         const newUser = await Users.create({
            name: response.data.name,
            email: response.data.email,
            externalId: response.data.id,
            oauth: "facebook",
            picture: response.data.picture.data.url,
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

