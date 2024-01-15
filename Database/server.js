const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'khzmujd6Gh',
    database: 'bus_stop_db',
});

db.connect(err => {
    if (err) {
        console.error('Database connection error:', err);
    } else {
        console.log('Connected to the database');
    }
});

app.use(express.static('public'));

app.get('/getStops', (req, res) => {
    const region = req.query.region;
    const query = `SELECT stop_name FROM stops WHERE region = '${region}'`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const stops = results.map(result => result.stop_name);
            res.json(stops);
        }
    });
});

app.get('/getBuses', (req, res) => {
    const stop = req.query.stop;
    const query = `SELECT route_short_name FROM routes INNER JOIN stop_times ON routes.route_id = stop_times.route_id WHERE stop_times.stop_name = '${stop}'`; 
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const buses = results.map(result => result.route_short_name);
            res.json(buses);
        }
    });
});
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});


app.get('/getStops', (req, res) => {
    const region = req.query.region;
    const query = `SELECT stop_name FROM stops WHERE region = '${region}'`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const stops = results.map(result => result.stop_name);
            res.json(stops);
        }
    });
});


app.get('/getBuses', (req, res) => {
    const stop = req.query.stop;
    const query = `SELECT route_short_name FROM routes INNER JOIN stop_times ON routes.route_id = stop_times.route_id WHERE stop_times.stop_name = '${stop}'`;
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error executing query:', err);
            res.status(500).send('Internal Server Error');
        } else {
            const buses = results.map(result => result.route_short_name);
            res.json(buses);
        }
    });
});


app.get('/getNextArrivals', (req, res) => {
    const stop = req.query.stop;
    const bus = req.query.bus;
    const nextArrivals = ["09:15", "09:30", "09:45"]; 
    res.json(nextArrivals);
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${3306}`);
});