
const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var wordnet = require('wordnet');
var ProgressBar = require('cli-progress');

const bar = new ProgressBar.Bar({}, ProgressBar.Presets.shades_classic);

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('words.txt')
});


var puzzle;
var wrong;
var right;
var words = {};
var regWords = [];
var listCount = 0;
var wordCount = 0;
var matches = [];
var falseMatches = [];
var results = {};

//// TEMP ////
var guessMatch = [];


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

  //// TEMP ////
  for(var i = 1; i <= wordCount; i++) { //Populate empty match array
    guessMatch.push([]);
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
      if(temp[j] === ',') { //Remove comma
        remove.push(j);
      }
      if(temp[j] === '-') { //Remove hyphen
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

  //  console.log("Word " + i + ": " + words[i].join(' '));
    regWords.push(words[i].join(''));
  }
//  console.log("Guessed Wrong: " + wrong);
//  console.log("Guessed Right: " + right);

//  console.log("REG WORDS:")
//  console.log(regWords)


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
}


fs.readFile('email.json', (err, data) => {
  if(err) throw err;
  puzzle = JSON.parse(data);
  wrong = puzzle.guessedWrong;

  //Generate right based off puzzle
  right = [];
  puzzle.fullPuzzle.split('').forEach((char) => {
    if(char.match(/[a-z]/i)) {
      if(right.indexOf(char) == -1) {
        right.push(char);
      }
    }
  });
  right.sort();

  parseWords(puzzle.fullPuzzle);
});




function matchRule(str, rule) {
  return new RegExp("^" + rule.split("*").join(".") + "$").test(str);
}


var wordList = [];

lineReader.on('line', (line) => {
  wordList.push(line);
  listCount++;
}).on('close', () => {



  var found = [];
  var bestGuess = [];
  var givenTrue = [];
  var givenFalse = [];

  //Filter Size Pool
  var sizePool = [];
  for(var i = 1; i <= wordCount; i++) {
    if(sizePool.indexOf((words[i]).length) === -1) {
      sizePool.push((words[i]).length);
    }
  }




  bar.start(listCount, 0);



  wordList.forEach((item, index) => {
    //Generate rule based off of string length compared to known characters
    if(sizePool.includes(item.length)) { //If item is a correct size
      if(item.indexOf(" ") === -1) { //If item has no space char
        if(item.search(/[0-9]/g) == -1) { //Filter out numbers
          regWords.forEach((word, wordIndex) => {
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

                  if(guessMatch[wordIndex].indexOf(item) == -1) {
                    guessMatch[wordIndex].push(item);
                  }


                  //Working
                  /*
                  if(bestGuess.indexOf(index) === -1) { //Unique check;
                    bestGuess.push(index);
                  }
                  */
                }

              }
            }
          })


        }
      }
    }

    bar.update(index);
    if(index == listCount - 1) {
      bar.stop();

      for(var i = 0; i < bestGuess.length; i++) {
        //results[i] = {length: wordList[bestGuess[i]].length, word: wordList[bestGuess[i]]}
      }

      console.log()
      console.log("Matches Found: " + bestGuess.length);

      console.log(guessMatch)

      //console.log(_.sortBy(results, 'length'))
    }
  });
});




app.get('/', (req, res) => {
  res.sendFile(path.resolve('./index.html'));
});

app.get('/data', (req, res) => {
  res.send(guessMatch)
});

app.get('/puzzle', (req, res) => {
  res.send(words);
});

app.get('/guess', (req, res) => {
  var send = {};
  send['wrong'] = wrong;
  send['right'] = right;
  res.send(send);
});

app.post('/filter', (req, res) => {

});






app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
