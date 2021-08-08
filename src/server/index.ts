import express from 'express';
import path from 'path';

const port = Number(process.env.PORT || 8000) + Number(process.env.NODE_APP_INSTANCE || 0);
const app = express();

app.use(express.json());

app.use('/', express.static(path.join(__dirname, '..', '..', 'dist')));

app.listen(port)
console.log(`Listening on port ${port}.`);