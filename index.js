
const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var wordnet = require('wordnet');
var ProgressBar = require('cli-progress');

const bar = new ProgressBar.Bar({}, ProgressBar.Presets.shades_classic);



var puzzle;
var wrong;
var right;
var words = {};
var wordCount = 0;

function parseWords(s) {
  var array = s.split('');
  var wordStart = 0;
  var i = 0;
  while(i < array.length) {
    //Get word start
    //Find word end
    //Determine length of word
    //Save word
    //Repeat until no more words
    if(array[i] !== ' ') {
      wordStart = i; //Nest word end here
      var noEnd = true;
      while(i < array.length) {
        //Check for last word
        if(array[i] === '.') {
          wordCount++;
          words[wordCount] = s.slice(wordStart, i) + '.';
          i++;
          break;
        }
        //Identify space and set word endpoint
        if((array[i] === ' ') && (array[i + 1] === ' ') && (array[i + 2] === ' ') && (array[i + 3] === ' ')) {
          wordCount++;
          words[wordCount] = s.slice(wordStart, i);
          break;
        }
        i++;
      }
    }else {
      i = i + 4;
    }
  }

  //Reformat words
  var temp;
  var remove = [];
  var removeCount;
  var match = [];

  for(var i = 1; i <= wordCount; i++) {
    temp = words[i].split('');
    for(var j = 0; j < temp.length; j++) { //Filter unwanted specific characters
      if((temp[j] === '_') && (temp[j+1] === '_')) { //Remove double underscores
        remove.push(j+1);
      }
      if(temp[j] === ' ') { //Remove excess spaces
        remove.push(j);
      }
      if(temp[j] === '.') { //Remove period
        remove.push(j);
      }
      if(temp[j] === '\'') { //Remove apostrophe
        remove.push(j);
      }
    }
    for(var k = 0; k < temp.length; k++) {
      if(remove.includes(k)) {
        remove.shift();
      }else {
        match.push(temp[k]);
      }
    }
    words[i] = match;
    match = [];

    console.log("Word " + i + ": " + words[i].join(' '));
  }
  console.log("Guessed Wrong: " + wrong);
  console.log("Guessed Right: " + right);

}


fs.readFile('email.json', (err, data) => {
  if(err) throw err;
  puzzle = JSON.parse(data);
  wrong = puzzle.guessedWrong;
  right = puzzle.guessedRight;

  parseWords(puzzle.fullPuzzle);
});


function filterWords(list) {
  for(var i = 0; i < wordCount; i++) {

  }
}



//Search dictionary
//147306
wordnet.list(function(err, list) {
  var found = [];

//Filter Size Pool
  var sizePool = [];
  for(var i = 1; i <= wordCount; i++) {
    if(sizePool.indexOf((words[i]).length) === -1) {
      sizePool.push((words[i]).length);
    }
  }

  bar.start(147305, 0);
  list.forEach((item, index) => {
    if(sizePool.includes((item).length)) { //If item is correct size
      WordCheck: for(var i = 0; i < (item).length; i++) {
        console.log(((item).toUpperCase().charAt(i)))
        LetterCheck: for(var j = 0; j < wrong.length; j++) {
          if(!(((item).toUpperCase().charAt(i)) === (wrong[j]).toUpperCase())) { //If item does not contain wrong letter
            found.push(index);
            break WordCheck;
          }

        }
//console.log((item).toUpperCase())
      }


      /*if(!(item.includes(wrong))) {

      }*/
    }

    bar.update(index);
    if(index == 147305) {
      bar.stop();
    }
  });



//Filter Known Pool
  var knownPool = [];




  if(found === []) {
    console.log("\nWord Not Found...");
  }else {
    console.log("\nWords found:")
    for(var i = 0; i < found.length; i++) {
    //  console.log(list[found[i]]);
    }

  }
});





app.get('/', (req, res) => {
  res.json(words);
});

app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
