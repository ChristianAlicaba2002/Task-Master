import { userRoutes } from "./users/routes";
import { taskRoutes } from "./task/routes";

// Combine all the routes
export const routes = [userRoutes, taskRoutes] as const;
