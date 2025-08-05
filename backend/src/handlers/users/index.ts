import { Context } from "hono";
import { db } from "../../db";
import * as brcypt from "bcryptjs";
import { users, userInsertSchema } from "../../db/schema";
import { eq } from "drizzle-orm";
import * as http_status_code from "../../http-status/http-status-codes";

export const allUserHandler = async (c: Context) => {
  try {
    const allUsers = await db.select().from(users);
    return c.json({ data: allUsers }, http_status_code.OK);
  } catch (err) {
    return c.json(
      {
        message: "Failed to fetch users",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      http_status_code.INTERNAL_SERVER_ERROR
    );
  }
};

export const createUserHandler = async (c: Context) => {
  try {
    const payload = await c.req.json();

    // Safe validation
    const result = userInsertSchema.safeParse(payload);

    if (!result.success) {
      return c.json(
        { message: "Validation failed", errors: result.error },
        http_status_code.BAD_REQUEST
      );
    }

    const validatedData = result.data;

    const hashedPassword = await brcypt.hash(validatedData.password, 10);

    const userToInsert = {
      ...validatedData,
      password: hashedPassword,
    };

    // Insert into DB
    const [createdUser] = await db
      .insert(users)
      .values(userToInsert)
      .returning();

    return c.json(
      {
        message: "User created successfully",
        data: createdUser,
      },
      http_status_code.CREATED
    );
  } catch (err) {
    return c.json(
      {
        message: "Failed to create user",
        error: err instanceof Error ? err.message : "Unknown error",
      },
      http_status_code.INTERNAL_SERVER_ERROR
    );
  }
};

export const getUserTokenHandler = async (c: Context) => {
  try {
    const payload = await c.req.json();
    const result = userInsertSchema.safeParse(payload);

    if (!result.success) {
      return c.json(
        {
          message: "Validation failed",
          errors: result.error.format(),
        },
        http_status_code.BAD_REQUEST
      );
    }

    const { email, token } = result.data;

    const updateResult = await db
      .update(users)
      .set({ token, updated_at: new Date() })
      .where(eq(users.email, email))
      .returning();

    if (updateResult.length === 0) {
      return c.json({ message: "User not found" }, http_status_code.NOT_FOUND);
    }

    return c.json({
      message: "User token updated successfully",
      data: updateResult[0],
    });
  } catch (error) {
    return c.json(
      {
        message: "Failed to update token",
        error: String(error),
      },
      http_status_code.INTERNAL_SERVER_ERROR
    );
  }
};
