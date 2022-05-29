import knex from 'knex';
import configs from '../database/database.connection';

const config = configs[process.env.NODE_ENV || 'development'];

const db = knex(config);

export default db;