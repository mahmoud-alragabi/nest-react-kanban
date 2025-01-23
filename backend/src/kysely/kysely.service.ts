import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import { DB } from 'prisma/generated/types';

@Injectable()
export class KyselyService extends Kysely<DB> implements OnModuleDestroy {
  constructor() {
    super({
      dialect: new PostgresDialect({
        pool: new Pool({
          connectionString: process.env.DATABASE_URL,
        }),
      }),
    });
  }

  async onModuleDestroy() {
    await this.destroy();
  }
}
