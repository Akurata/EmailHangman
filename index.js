
const express = require('express');
const app = express();

var fs = require('file-system');
var path = require('path');

var puzzle = require('./email.json');

app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
