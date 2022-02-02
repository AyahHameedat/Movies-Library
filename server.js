'use strict';

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
//initialize pg
const pg = require('pg');

// create DB
const client = new pg.Client(process.env.DATABASE_URL);


const PORT = process.env.PORT;

const server = express();
server.use(cors());
server.use(express.json());


server.get('/trending', handelTrendingPage)
server.get('/search', handelSearchMovie)
server.post('/addMovie', handelAddMovie)
server.get('/getMovies', handelGetMovies)


server.use('*', HandleError404) // 404 Error
server.use(HandleError) //500


function Movies(id, title, release_date, poster_path, overview) {
    this.id = id;
    this.title = title;
    this.release_date = release_date;
    this.poster_path = poster_path;
    this.overview = overview;
}

let numberOfMovies = 2;
let url = `https://api.themoviedb.org/3/trending/all/week?api_key=${process.env.APIKEY}`;


function handelTrendingPage(req, res) {
    axios.get(url)
        .then((resultOf) => {
            let result = resultOf.data.results;
            let moviesOf = result.map(movie => {
                return new Movies(movie.id, movie.title, movie.release_date, movie.poster_path, movie.overview);
            })
            res.status(200).json(moviesOf);
        }).catch((err) => {
            console.log("Error");
        })
}

let movie1 = "Riverdance: The Animated Adventure";
let movie2 = "The Hobbit: The Battle of the Five Armies";
function handelSearchMovie(req, res) {
    let urlS = `https://api.themoviedb.org/3/search/movie?api_key=${process.env.APIKEY}&number=${numberOfMovies}&query=${movie1}`;
    axios.get(urlS)
        .then((resultOf) => {
            let result = resultOf.data.results;
            let moviesOf = result.map(movie => {
                return new Movies(movie.id, movie.original_title, movie.release_date, movie.poster_path, movie.overview);
            })
            res.status(200).json(moviesOf);
        }).catch((err) => {
            console.log("Error");
        })
}


function handelAddMovie(req,res){
    const movie = req.body;
    //console.log(movie);
    console.log("anything");
    let sql = `INSERT INTO favMovies(title,release_date,poster_path,overview) VALUES ($1,$2,$3,$4) RETURNING *;`
    let values=[movie.title,movie.release_date,movie.poster_path,movie.overview];
    console.log(values);
    client.query(sql,values).then(data => {
        // console.log("anything");
        res.status(200).json(data);
    }).catch(error =>{
        HandleError(error, req, res)
    });
}


function handelGetMovies(req,res){
    let sql = `SELECT * FROM favMovies;`;
    client.query(sql).then(data=>{
       res.status(200).json(data.rows);
    }).catch(error=>{
        errorHandler(error,req,res)
    });
}


function HandleError404(req, res) {

    res.status(404).send('page not found error 404')
}


function HandleError(error, req, res) {
    const err500 = {
        "status": 500,
        "responseText": "Sorry, something went wrong"
    }
    res.status(500).send(err500);

}

client.connect().then(()=>{
    server.listen(PORT,()=>{
        console.log(`My Server is listining to port ${PORT}`)
    })
})

