

import { Knex } from 'knex';


interface IKnexConfig {
  [key: string]: Knex.Config;
}

const configs: IKnexConfig = {
  development: {
    client:"postgres",
    connection: async () => {
        return {
          host : 'localhost',
          port : 5432,
          user : 'postgres',
          password : "1",
          database : 'chats',
          
        };
      },
    debug:true,
    useNullAsDefault: true,
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'chats',
      user: 'postgres',
      password: '1',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'chats',
    },
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'chats',
      user: 'username',
      password: '1',
    },
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'chats',
    },
  },
};

export default configs;