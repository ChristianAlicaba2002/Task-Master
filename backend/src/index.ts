import { Hono } from "hono";
import { routes } from "./handlers/routes";
import { cors } from "hono/cors";

const app = new Hono();

app.get("/", (c) => {
  return c.text("Hello Hono!");
});

app.use(
  "*",
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

routes.forEach((route) => {
  app.route("/", route);
});

export default app;
