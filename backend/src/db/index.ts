import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/heron_db';

class DatabasePool {
  private pool: Pool | null = null;
  public isConnected: boolean = false;

  constructor() {
    this.init();
  }

  private init() {
    try {
      this.pool = new Pool({
        connectionString,
        ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 4000,
      });

      this.pool.on('error', (err) => {
        console.warn('⚠️ [PostgreSQL Pool Warning]', err.message);
      });
    } catch (e) {
      console.warn('⚠️ [PostgreSQL Init Notice] Running in dual-adapter mode.');
    }
  }

  public async testConnection(): Promise<boolean> {
    if (!this.pool) return false;
    try {
      const client = await this.pool.connect();
      const res = await client.query('SELECT NOW()');
      client.release();
      this.isConnected = true;
      console.log('✅ [PostgreSQL Connected] Server time:', res.rows[0].now);
      return true;
    } catch (err: any) {
      this.isConnected = false;
      console.log('ℹ️ [PostgreSQL Info] Local database not detected or connecting. Fallback adapter active.');
      return false;
    }
  }

  public async runMigrations(): Promise<void> {
    if (!this.isConnected || !this.pool) return;
    try {
      const schemaPath = path.join(__dirname, 'schema.sql');
      const seedPath = path.join(__dirname, 'seed.sql');

      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await this.pool.query(schemaSql);
        console.log('✅ [PostgreSQL Schema Verified]');
      }

      if (fs.existsSync(seedPath)) {
        const seedSql = fs.readFileSync(seedPath, 'utf-8');
        await this.pool.query(seedSql);
        console.log('✅ [PostgreSQL Seed Data Verified]');
      }
    } catch (err: any) {
      console.error('❌ [PostgreSQL Migration Error]', err.message);
    }
  }

  public async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[]
  ): Promise<QueryResult<T>> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.query<T>(text, params);
  }

  public async getClient(): Promise<PoolClient> {
    if (!this.pool) {
      throw new Error('Database pool not initialized');
    }
    return this.pool.connect();
  }
}

export const dbPool = new DatabasePool();
