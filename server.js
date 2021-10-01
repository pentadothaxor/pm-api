import pg from 'pg';
import polka from 'polka';
import dotenv from 'dotenv';
dotenv.config();

const app = polka();

const __PORT = process.env.PORT || 3000;

const { Pool } = pg;
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    passowrd: '',
    port: 5432,
});

import Movie from './src/movie.js';

app.get('/', (req, res, next) => {
    res.end('Hello, world!');
});

app.get('/movies', (req, res, next) => {
    res.end(
        JSON.stringify([
            { id: 'some_movie_id', name: 'some_movie_name' },
            { id: 'some_other_movie_id', name: 'some other movie name' },
            { id: 'some_another_movie_id', name: 'some another movie name' },
        ])
    );
});

app.get('/movie/:id', (req, res, next) => {
    const movieId = req?.params?.id;
    // await Movie.get(req.params)
});

app.post('/movie', (req, res, next) => {
    const { body } = req;
    res.end('submitted successfully');
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
