import { Hono } from "hono";
import {
  allTaskHandler,
  createTaskHandler,
  getTaskHandler,
  updateTaskHandler,
  deleteTaskHandler
} from ".";

export const taskRoutes = new Hono()
  .get("/tasks", allTaskHandler)
  .post("/tasks", createTaskHandler)
  .get("/task/:id", getTaskHandler)
  .patch("/task/:id", updateTaskHandler)
  .delete("/task/:id", deleteTaskHandler)
