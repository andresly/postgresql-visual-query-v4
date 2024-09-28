import query from './query.js';
import database from './database.js';

export default (app) => {
  app.use('/postgres-query/api/query', query);
  app.use('/postgres-query/api/database', database);
};
