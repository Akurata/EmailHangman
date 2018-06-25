
const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');

var puzzle;
var wrong;
var right;
var words = {};

function parseWords(s) {
  var array = s.split('');
  var wordCount = 0;

  var wordStart = 0;
  var wordEnd = 0;

  var i = 0;
  while(i < array.length) {
    if(array[i] !== ' ') {
      wordStart = i;
      var wordLength = i;
      while(wordLength < array.length) {
        if((array[wordLength + 1] === ' ') && (array[wordLength + 2] === ' ') && (array[wordLength + 3] === ' ')) {
          wordEnd = wordLength;
          words["word" + wordCount] = array.splice(wordStart, (wordEnd-wordLength));
          wordCount++;
          wordEnd = i;
        }else {
          wordLength++;
        }
      }


    }

  }

}


fs.readFile('email.json', (err, data) => {
  if(err) throw err;
  puzzle = JSON.parse(data);
  wrong = puzzle.guessedWrong;
  right = puzzle.guessedRight;

  parseWords(puzzle.fullPuzzle);
});





app.get('/', (req, res) => {
  res.send(puzzle);
});

app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
