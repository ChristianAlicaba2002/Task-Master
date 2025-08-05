import { createUserHandler, getUserTokenHandler, allUserHandler } from ".";
import { Hono } from "hono";

export const userRoutes = new Hono()
  .get("/users", allUserHandler)
  .patch("/users", getUserTokenHandler)
  .post("/users", createUserHandler);
