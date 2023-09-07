import { describe, it, expect } from "@jest/globals";
import api from "../src/api";
import request from "supertest";
import { GetBalance } from "../src/services/betmotion";

let betmotionToken: string;
let token: string;

describe("GET -> betmotion login", () => {
   it("should user login in betmotion", async () => {
      const UserToken = process.env.BETMOTION_TESTS_USER_TOKEN as string;
      if (!UserToken) throw new Error("SET BETMOTION_TESTS_USER_TOKEN ENV VARIABLE");
      const response = await request(api).get("/user/me").set("Authorization", `Bearer ${UserToken}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      expect(response.body).toHaveProperty("betmotionToken");
      expect(response.body).toHaveProperty("betmotionUserID");
      expect(response.body).toHaveProperty("balance");
      expect(response.body).toHaveProperty("name");

      betmotionToken = response.body.betmotionToken;
      token = response.body.token;
   });
});

describe("Betmotion get balance", () => {
   it("should user get balance in betmotion", async () => {
      const response = await GetBalance(betmotionToken);
      expect(response).not.toBeNull();
      expect(response).toHaveProperty("balance");
      expect(response).toHaveProperty("currency");
      expect(response).toHaveProperty("externalUserID");
      expect(response).toHaveProperty("token");
      expect(response).toHaveProperty("Success");
   });
});
