import dotenv from "dotenv";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";

dotenv.config({ path: fileURLToPath(new URL("../.env", import.meta.url)) });
const { default: pool } = await import("../config/db.js");

try {
  const migrationPath = fileURLToPath(new URL("./001_instructor_workspace.sql", import.meta.url));
  const sql = await fs.readFile(migrationPath, "utf8");
  const statements = sql.replace(/^\s*--.*$/gm, "").split(";").map((statement) => statement.trim()).filter(Boolean);
  for (let index = 0; index < statements.length; index += 1) {
    try {
      await pool.query(statements[index]);
    } catch (error) {
      console.error(`Migration statement ${index + 1}/${statements.length} failed: ${error.message}`);
      throw error;
    }
  }
  console.log("Instructor workspace migration applied successfully.");
} catch (error) {
  console.error(`Instructor workspace migration failed (${error.code || "database error"}). Check the backend database connection and permissions.`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
