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
    const account = await db.query(`SELECT userid FROM users WHERE email = "${req.body.email}"`);
    if (account.length>0) {
       res.contentType('application/json').status(403).send({"error":"Email already exists"});
    }
    else {
    bcrypt.genSalt(10, function(err, salt) {
        bcrypt.hash(req.body.password, salt, function(err, hash) {
            db.query(`INSERT INTO users (email, name, password) VALUES ("${req.body.email}", "${req.body.name}", "${hash}")`);
        });
    });
    res.contentType('application/json').status(201).send({"message":"User registered."});
    }
});
app.post('/users/login', jsonParser, async (req, res) => {
     console.log(req)
    const accounts = await db.query(`SELECT password, userid FROM users WHERE email = "${req.body.email}"`);
    if (accounts.length>0) {
        const account=accounts[0];
        bcrypt.compare(req.body.password, account.password, function(err, result) {
            if (result) {
                const session = uuid();
                db.query(`INSERT INTO sessions (token, userid) VALUES ("${session}", "${account.userid}")`);
                res.contentType('application/json').send({"token": session, "expiration_time":Date.now()+3600000});   //send the token
            }
        });
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not found"});
    }
});
app.post('/users/logout', jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        db.query(`DELETE FROM sessions WHERE token = "${req.body.token}"`);
        res.contentType('application/json').send({"message":"User logged out."});
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});
app.post('/users/delete', jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        const account = await db.query(`SELECT userid FROM users WHERE userid = "${session[0].userid}"`);
        if (account.length>0) {
            db.query(`DELETE FROM users WHERE userid = "${session[0].userid}"`);
            db.query(`DELETE FROM sessions WHERE userid = "${session[0].userid}"`);
            res.contentType('application/json').send({"message":"User deleted."});
        }
        else {
            res.contentType('application/json').status(400).send({"error":"User not found."});
        }
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});

app.post("/posts/new", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        await db.query(`INSERT INTO posts (userid, title, content, type, race) VALUES ("${session[0].userid}", "${req.body.title}", "${req.body.content}", "${req.body.type}","${req.body.race}")`);
        res.contentType('application/json').status(201).send({"message":"Post created."});
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});
app.post("/posts/delete", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        const post = await db.query(`SELECT userid FROM posts WHERE postid = ${req.body.postid}`);
        if (post.length>0 && post[0].userid==session[0].userid) {
            await db.query(`DELETE FROM posts WHERE postid = ${req.body.postid}`);
            res.contentType('application/json').send({"message":"Post deleted."});
        }
        else {
            res.contentType('application/json').status(401).send({"error":"User not authorized or invalid post."});
        }
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});
app.post("/posts/edit", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        const post = await db.query(`SELECT postid FROM posts WHERE postid = ${req.body.postid} AND userid = "${session[0].userid}"`);
        if (post.length>0) {
            await db.query(`UPDATE posts SET title = "${req.body.title}", content = "${req.body.content}" WHERE postid = "${req.body.postid}"`);
            res.contentType('application/json').send({"message":"Post edited."});
        }
        else{
            res.contentType('application/json').status(401).send({"error":"User not authorized or invalid post."});
        }
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});
app.post("/posts/get", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        const post = await db.query(`SELECT * FROM posts WHERE postid = "${req.body.postid}" AND userid = "${session[0].userid}"`);
        res.contentType('application/json').send({"title":post[0].title, "content":post[0].content});
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});
app.post("/posts/getall", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        const posts = await db.query(`SELECT * FROM posts ORDER BY postid DESC LIMIT 10`);
        res.contentType('application/json').send(posts);
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});

app.post("/messages/new", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        await db.query(`INSERT INTO messages (senderid, receiverid, content) VALUES ("${session[0].userid}",${req.body.receiver} "${req.body.content}")`);
        res.contentType('application/json').status(201).send({"message":"Message sent."});
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});

app.post("/messages/get", jsonParser, async (req, res) => {
    console.log(req);
    const session = await db.query(`SELECT userid FROM sessions WHERE token = "${req.body.token}"`);
    if (session.length>0) {
        const messages = await db.query(`SELECT * FROM messages WHERE senderid = "${session[0].userid}" OR receiverid = "${session[0].userid}" ORDER BY messageid DESC LIMIT 10`);
        res.contentType('application/json').send(messages);
    }
    else {
        res.contentType('application/json').status(401).send({"error":"User not logged in."});
    }
});

// app.post("*", (req, res) => {   //catch all requests
//     res.contentType('application/json').status(401).send({"error":"Not found."});
// });
// app.get("*", (req, res) => {   //catch all requests
//     res.contentType('application/json').status(401).send({"error":"Not found."});
// });
app.listen(5000);

