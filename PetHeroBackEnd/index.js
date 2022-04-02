const express = require('express');
const app = express();
const mysql = require('mysql');
app.get('/ping', (req, res) => {
    console.log(req);
    res.send('<p>API Online.</p> <p>Response time: ' + new Date().toLocaleString("ro-RO") + '</p>');
  });
  
app.listen(5000);

