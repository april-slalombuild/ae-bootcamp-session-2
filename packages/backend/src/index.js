const path = require('path');
const fs = require('fs');
const { createApp } = require('./app');
const { createDatabase } = require('./db');

const PORT = process.env.PORT || 3030;
const DATABASE_PATH = process.env.DATABASE_PATH || path.join(__dirname, '..', 'data', 'tasks.db');

if (DATABASE_PATH !== ':memory:') {
  fs.mkdirSync(path.dirname(DATABASE_PATH), { recursive: true });
}

const db = createDatabase(DATABASE_PATH);
const { app } = createApp({ db });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/tasks`);
});
