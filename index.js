
const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var wordnet = require('wordnet');
var ProgressBar = require('cli-progress');

const bar = new ProgressBar.Bar({}, ProgressBar.Presets.shades_classic);



var puzzle;
var wrong;
var right;
var words = {};
var regWords = [];
var wordCount = 0;
var matches = [];
var falseMatches = [];
var results = {};

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
        temp[j] = '*'
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
      if(temp[j] === ',') { //Remove apostrophe
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
    regWords.push(words[i].join(''));
  }
  console.log("Guessed Wrong: " + wrong);
  console.log("Guessed Right: " + right);

  console.log("REG WORDS:")
  console.log(regWords)


var tempFalse = [];
var tempMatch = [];
  //Generate match data
  for(var i = 1; i <= wordCount; i++) {
    for(var j = 0; j < words[i].length; j++) {
      if(right.indexOf(words[i][j]) != -1) {
          matches.push({size: words[i].length, index: j, letter: words[i][j]});

          if(_.findWhere(tempMatch, {size: words[i].length, index: j}) == null) {
            tempMatch.push({size: words[i].length, index: j});
          }
      }else {
        if(_.findWhere(tempFalse, {size: words[i].length, index: j}) == null) {
          tempFalse.push({size: words[i].length, index: j});
        }

      }
    }
  }

  for(var i = 0; i < tempFalse.length; i++) {
    if(_.findWhere(tempMatch, tempFalse[i]) == null) {
      falseMatches.push(tempFalse[i]);
    }
  }

  console.log("MATCHES: ")
  console.log(matches)
  console.log()
  console.log("FALSE MATCHES: ")
  console.log(falseMatches)

}


fs.readFile('email.json', (err, data) => {
  if(err) throw err;
  puzzle = JSON.parse(data);
  wrong = puzzle.guessedWrong;
  right = puzzle.guessedRight;

  parseWords(puzzle.fullPuzzle);
});




function matchRule(str, rule) {
  return new RegExp("^" + rule.split("*").join(".") + "$").test(str);
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

var bestGuess = [];

var givenTrue = [];
var givenFalse = [];

  bar.start(147305, 0);

//Generate matchable regex strings?

list.forEach((item, index) => {
  //Generate rule based off of string length compared to known characters
  if(sizePool.includes(item.length)) { //If item is a correct size
    if(item.indexOf(" ") === -1) { //If item has no space char
      if(item.search(/[0-9]/g) == -1) { //Filter out numbers
        regWords.forEach((word) => {
          if(word.length === item.length) {
            if(matchRule(item.toUpperCase(), word)) {

              var noBadLetter = true;
              for(var i = 0; i < item.length; i++) { //Filter out guessed + bad letters
                if(wrong.indexOf(item.toUpperCase().charAt(i)) !== -1) {
                  noBadLetter = false;
                  break;
                }

                if(right.indexOf(item.toUpperCase().charAt(i)) !== -1) {
                  if(word.charAt(i) != item.toUpperCase().charAt(i)) {
                    noBadLetter = false;
                    break;
                  }

                }
              }

              if(noBadLetter) {
                if(bestGuess.indexOf(index) === -1) { //Unique check;
                  bestGuess.push(index);
                }
              }



            }
          }
        })
}
    }
  }
  bar.update(index);
  if(index == 147305) {
    bar.stop();
  }
});






  if(found === []) {
    console.log("\nWord Not Found...");
  }else {
    for(var i = 0; i < bestGuess.length; i++) {
      results[i] = {length: list[bestGuess[i]].length, word: list[bestGuess[i]]}
    }
    console.log("Matches Found: " + bestGuess.length);
    console.log(_.sortBy(results, 'length'))


  }
//  console.log("Does OF exist: " + list[list.indexOf("of")] + " " + list.indexOf("of"))
});



app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
});

app.get('/data', (req, res) => {
  res.send(results);
});

app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
