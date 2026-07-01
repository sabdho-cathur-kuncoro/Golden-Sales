import * as SQLite from "expo-sqlite";
import { DB_NAME } from "./keys";

/**
 * Idempotent migrations. Append new statements as more tables are added.
 * Every statement must be safe to run repeatedly (use IF NOT EXISTS).
 */
const MIGRATIONS = [
  // Legacy un-scoped cache — replaced by `product_cache` (keyed by id+scope so
  // the global Katalog list and the per-warehouse Order list no longer clobber
  // each other's rows). Safe to drop repeatedly; no-op once gone.
  `DROP TABLE IF EXISTS products;`,
  `CREATE TABLE IF NOT EXISTS product_cache (
    id         TEXT NOT NULL,
    scope      TEXT NOT NULL DEFAULT 'all',
    name       TEXT,
    price      INTEGER,
    raw        TEXT,
    updated_at INTEGER,
    PRIMARY KEY (id, scope)
  );`,
  `CREATE TABLE IF NOT EXISTS cart (
    id         TEXT PRIMARY KEY NOT NULL,
    product_id TEXT,
    qty        INTEGER,
    raw        TEXT,
    status     TEXT DEFAULT 'synced',
    updated_at INTEGER
  );`,
];

class Database {
  private dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

  /** Open the database once and reuse the connection. */
  private open(): Promise<SQLite.SQLiteDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = SQLite.openDatabaseAsync(DB_NAME);
    }
    return this.dbPromise;
  }

  /** Run PRAGMAs + migrations. Call once on app boot before any query. */
  async init() {
    try {
      const db = await this.open();
      await db.execAsync("PRAGMA journal_mode = WAL;");
      await db.execAsync(MIGRATIONS.join("\n"));
    } catch (error) {
      console.error("[DB:init]", error);
    }
  }

  /** Batch DDL / multi-statement SQL. */
  async exec(sql: string) {
    try {
      const db = await this.open();
      await db.execAsync(sql);
    } catch (error) {
      console.error("[DB:exec]", error);
    }
  }

  /** Insert / update / delete. */
  async run(sql: string, params: SQLite.SQLiteBindParams = []) {
    try {
      const db = await this.open();
      return await db.runAsync(sql, params);
    } catch (error) {
      console.error("[DB:run]", error);
      return null;
    }
  }

  /** Read many rows. */
  async getAll<T>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T[]> {
    try {
      const db = await this.open();
      return await db.getAllAsync<T>(sql, params);
    } catch (error) {
      console.error("[DB:getAll]", error);
      return [];
    }
  }

  /** Read a single row. */
  async getFirst<T>(
    sql: string,
    params: SQLite.SQLiteBindParams = []
  ): Promise<T | null> {
    try {
      const db = await this.open();
      return await db.getFirstAsync<T>(sql, params);
    } catch (error) {
      console.error("[DB:getFirst]", error);
      return null;
    }
  }

  /** Exposed for transactions / advanced callers. */
  async instance(): Promise<SQLite.SQLiteDatabase> {
    return this.open();
  }
}

export const db = new Database();
