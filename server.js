import pg from 'pg';
import polka from 'polka';
import dotenv from 'dotenv';
dotenv.config();

const app = polka();

const __PORT = process.env.PORT || 3000;
const databaseConnectionString = process.env.DATABASE_URL || process.env.PROPRIETARY_DATABASE_URL;

const { Pool } = pg;
const pool = new Pool({
    connectionString: databaseConnectionString,
    ssl: {
        rejectUnauthorized: false,
    },
});

await pool.connect();

import Movie from './src/movie.js';

app.get('/', async (req, res, next) => {
    const result = await pool.query('select * from genres');

    let response = 'Hello, world!<br/>' + JSON.stringify(result.rows);
    // for (let row of result.rows) {
    //     response += JSON.stringify(row);
    //     // console.log(JSON.stringify(row));
    // }
    // pool.end();
    res.setHeader('Content-Type', 'text/html');
    res.end(response);
});

app.get('/movies', async (req, res, next) => {
    const movies = await Movie.getAll();

    const sql = `select * from movie;`;
    const query = await pool.query(sql);
    const response = JSON.stringify(query.rows);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

app.get('/movies/recently-added', async (req, res) => {
    const sql = `select * from movie order by date_added desc limit 15;`;
    const query = await pool.query(sql);
    const response = JSON.stringify(query.rows);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

app.get('/movie/:id', (req, res, next) => {
    const movieId = req?.params?.id;
    // await Movie.get(req.params)
});

app.get('/movie/:start/:end', async (req, res, next) => {
    const start = req?.params?.start;
    const end = req?.params?.end;

    const sql = `select * from movie offset ${start} limit ${end};`;
    const query = await pool.query(sql);
    const response = JSON.stringify(query.rows);
    res.setHeader('Content-Type', 'application/json');
    res.end(response);
});

app.post('/movie', (req, res, next) => {
    const { body } = req;
    if (body.pass === process.env.ADMIN_PASSWORD) {
        res.end('submitted successfully');
    } else {
        res.end('failed to provide password');
    }
});

app.put('/movie/:id', (req, res, next) => {
    const movieId = req?.params?.id;
});

app.delete('/movie/:id', (req, res, next) => {
    const movieId = req?.params?.id;
    // await Movie.remove();
});

app.listen(__PORT, () => {
    console.log(`Started listening on port ${__PORT}`);
});
);
