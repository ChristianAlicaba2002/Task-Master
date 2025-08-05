import { Hono } from "hono";
import {
  allTaskHandler,
  createTaskHandler,
  getTaskHandler,
  updateTaskHandler,
} from ".";

export const taskRoutes = new Hono()
  .get("/tasks", allTaskHandler)
  .get("/task/:id", getTaskHandler)
  .patch("/tasks/:id", updateTaskHandler)
  .post("/tasks", createTaskHandler);
