import { Context } from "hono";
import {
  taskInsertSchema,
  tasks,
  taskSelectSchema,
  users,
} from "../../db/schema";
import { db } from "../../db";
import * as http_status_code from "../../http-status/http-status-codes";
import { eq } from "drizzle-orm";

// Get User Specific Tasks Handler
export const allTaskHandler = async (c: Context) => {
  try {
    const token = c.req.header("Authorization")?.split("Bearer ")[1];
    
    if (!token) {
      return c.json(
        { message: "Unauthorized: Missing or malformed token" },
        http_status_code.UNAUTHORIZED
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.token, token))
      .then((res) => res[0]);

    if (!user) {
      return c.json(
        { message: "Unauthorized: Invalid token" },
        http_status_code.UNAUTHORIZED
      );
    }

    const tasksWithUser = await db
      .select({
        id: tasks.id,
        user_id: tasks.user_id,
        title: tasks.title,
        description: tasks.description,
        priority_level: tasks.priority_level,
        status: tasks.status,
        created_at: tasks.created_at,
      })
      .from(tasks)
      .innerJoin(users, eq(tasks.user_id, users.uId))
      .where(eq(users.uId, user.uId));

    return c.json({ data: tasksWithUser }, http_status_code.OK);
  } catch (err) {
    return c.json(
      {
        message: "Failed to fetch task",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      http_status_code.INTERNAL_SERVER_ERROR
    );
  }
};

// Create User Tasks Handler
export const createTaskHandler = async (c: Context) => {
  try {
    const payload = await c.req.json();

    const result = taskInsertSchema.safeParse(payload);

    if (!result.success) {
      return c.json(
        { message: "Validation failed", errors: result.error.flatten() },
        http_status_code.BAD_REQUEST
      );
    }

    const validatedData = result.data;

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.uId, validatedData.user_id));

    if (existingUser.length === 0) {
      return c.json(
        {
          message: `User with ID ${validatedData.user_id} not found`,
        },
        http_status_code.NOT_FOUND
      );
    }

    // Insert task
    const inserted = await db.insert(tasks).values(validatedData).returning();

    return c.json(
      {
        message: "Task created successfully",
        data: inserted[0],
      },
      http_status_code.CREATED
    );
  } catch (err) {
    return c.json(
      {
        message: "Failed to create task",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      http_status_code.INTERNAL_SERVER_ERROR
    );
  }
};

// Display User Specific Tasks Handler
export const getTaskHandler = async (c: Context) => {
  const id = c.req.param("id");

  const findTask = await db.select().from(tasks).where(eq(tasks.id, id));

  if (findTask.length === 0) {
    return c.json({ message: "Don't have a task" }, http_status_code.NOT_FOUND);
  }

  return c.json(
    { message: "Task retrieve successfully", data: findTask },
    http_status_code.OK
  );
};

// Update User Specific Tasks Handler
export const updateTaskHandler = async (c: Context) => {
  const id = c.req.param("id");
  const body = await c.req.json();

  const findTask = await db.select().from(tasks).where(eq(tasks.id, id));

  if (findTask.length === 0) {
    return c.json({ message: "Don't have a task" }, http_status_code.NOT_FOUND);
  }

  const result = taskInsertSchema.safeParse(body);

  if (!result.success) {
    return c.json(
      { message: "Failed to update task", errors: result.error.format() },
      http_status_code.BAD_REQUEST
    );
  }

  const validateData = result.data;

  const updateItem = await db
    .update(tasks)
    .set({
      id: id,
      user_id: validateData.user_id,
      title: validateData.title,
      description: validateData.description,
      priority_level: validateData.priority_level,
      status: validateData.status,
      updated_at: new Date(),
    })
    .where(eq(tasks.id, id));

  return c.json(
    { message: "Update task successfully", data: updateItem },
    http_status_code.OK
  );
};

// Delete User Specific Tasks Handler
export const deleteTaskHandler = async (c: Context) => {
  const id = c.req.param("id");

  const findTask = await db.select().from(tasks).where(eq(tasks.id, id));

  if (findTask.length === 0) {
    return c.json({ message: "Task not found" }, http_status_code.NOT_FOUND);
  }

  await db.delete(tasks).where(eq(tasks.id, id));

  return c.json({ message: "Task deleted successfully" }, http_status_code.OK);
};
