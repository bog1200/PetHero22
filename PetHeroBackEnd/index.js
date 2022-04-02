const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const bcrypt = require('bcrypt');
const app = express();
const db = require('./utils/mysql');
const { v4: uuid } = require('uuid');
app.get('/ping', (req, res) => {
    console.log(req);
    res.contentType('application/json').send({"time":new Date().toLocaleString("ro-RO")});
  });

app.post('/users/register',jsonParser, async (req, res) => {
    console.log(req);
    const account = await db.query(`SELECT * FROM users WHERE email = "${req.body.email}"`);
    if (account.length>0) {
       res.contentType('application/json').status(403).send({"error":"Email already exists"});
    }
    else {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            db.query(`INSERT INTO users (email, name, password) VALUES ("${req.body.email}", "${req.body.name}", "${hash}")`);
        });
    });
    res.contentType('application/json').send({"message":"User registered."});
    }
});
app.post('/users/login', jsonParser, async (req, res) => {
     console.log(req);
    const accounts = await db.query(`SELECT * FROM users WHERE email = "${req.body.email}"`);
    if (accounts.length>0) {
        const account=accounts[0];
        bcrypt.compare(req.body.password, account.password, function(err, result) {
            if (result) {
                const session = uuid();
                db.query(`INSERT INTO sessions (token, userid) VALUES ("${session}", "${account.userid}")`);
                res.contentType('application/json').send({"token": session});   //send the token
            }
        });
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not found"});
    }
});
app.post('/users/logout', jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT * FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        db.query(`DELETE FROM sessions WHERE token = "${req.body.token}"`);
        res.contentType('application/json').send({"message":"User logged out."});
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});
app.listen(5000);

