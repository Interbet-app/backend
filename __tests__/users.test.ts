import { describe, it, expect, jest } from "@jest/globals";
import api from "../src/api";
import request from "supertest";
import { users } from "../src/models";

let token: string;

describe("Admin -> login invalid credentials", () => {
   it("should not login with invalid credentials", async () => {
      const response = await request(api).post("/dashboard/signin").send({
         username: "root",
         password: "ibm2022",
      });
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
   });
});

describe("Admin -> login success", () => {
   it("should login with admin account", async () => {
      const response = await request(api).post("/dashboard/signin").send({
         username: "root",
         password: "ibm2023",
      });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("token");
      token = response.body.token;
   });
});

describe("Admin -> get list of all users", () => {
   it("should admin get list of all users", async () => {
      const response = await request(api).get("/dashboard/users").set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
   });
});

describe("Admin -> get user details", () => {
   it("should admin get user details", async () => {
      const response = await request(api).get("/user").set("Authorization", `${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("name");
      expect(response.body).toHaveProperty("athleticId");
      expect(response.body).toHaveProperty("betmotionUserID");
      expect(response.body).toHaveProperty("betmotionUserToken");
      expect(response.body).toHaveProperty("createdAt");
      expect(response.body).toHaveProperty("updatedAt");
   });
});

describe("Admin -> update user max bet amount", () => {
   it("should admin update user max bet amount", async () => {
      const user = await users.findOne({ where: { name: "root" } });
      const response = await request(api).post("/user/max-bet-amount").set("Authorization", `${token}`).send({
         maxBetAmount: 1000,
         userId: user?.id,
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toBe("Valor máximo de aposta alterado com sucesso!");
   });
});

