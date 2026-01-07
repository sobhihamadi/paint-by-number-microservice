import config from './config/index';
import express from 'express';
import cookieParser from 'cookie-parser';
import routes from '../src/routes';
import { errorHandler } from './/middleware/errorHandler'; // ✅ Import
import { GenerationRequestRepositoryPostgre } from './repository/postgreSQL/RequestRepositoryPostgre';
import fs from 'fs';
import path from 'path';

// Create directories on startup
const dirs = ['uploads', 'outputs'];
dirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/api', routes);

// ✅ Register error handler AFTER routes
app.use(errorHandler);

export default app;

console.log('Hello, world!, the secret is ', config.SECRET);

// Initialize database tables and start server
(async () => {
  const repository = new GenerationRequestRepositoryPostgre();
  await repository.init();

  const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
})();