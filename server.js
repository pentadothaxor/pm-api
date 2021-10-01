import pg from 'pg';
import polka from 'polka';
import dotenv from 'dotenv';
dotenv.config();

const app = polka();

const __PORT = process.env.PORT || 3000;
const databaseConnectionString =
    process.env.DATABASE_URL ||
    'postgres://dqystggbtbkzap:042591f99d01c33875f2fbd6bc3bb7d72d505f6b1b00f46f6f40d75525390a91@ec2-44-198-146-224.compute-1.amazonaws.com:5432/d9h9va86gpg65k';

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

    let response = 'Hello, world!<br/>';
    for (let row of result.rows) {
        response += JSON.stringify(row);
        // console.log(JSON.stringify(row));
    }
    // pool.end();
    res.setHeader('Content-Type', 'text/html');
    res.end(response);
});

app.get('/movies', async (req, res, next) => {
    const movies = await Movie.getAll();

    res.end(
        JSON.stringify([
            { id: 'some_movie_id', name: 'some_movie_name' },
            { id: 'some_other_movie_id', name: 'some other movie name' },
            { id: 'some_another_movie_id', name: 'some another movie name' },
        ])
    );
    next();
});

app.get('/movie/:id', (req, res, next) => {
    const movieId = req?.params?.id;
    // await Movie.get(req.params)
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
