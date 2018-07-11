
const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var wordnet = require('wordnet');
var ProgressBar = require('cli-progress');

var probability = require('./probability.js');

var puzzle = require('./puzzle.js');

const bar = new ProgressBar.Bar({}, ProgressBar.Presets.shades_classic);

var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('words.txt')
});


var input;
var wrong;
var right;
var answer;
var words = {};
var regWords = [];
var listCount = 0;
var wordCount = 0;
var matches = [];
var falseMatches = [];
var results = {};

var vowels = ["A", "E", "I", "O", "U"];
var unUsedVowels = [];


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
      i = i + 4; //Length of spaces
    }
  }

  //// TEMP ////
  for(var i = 1; i <= wordCount; i++) { //Populate empty match array
    guessMatch.push([]); // 7-9-2018: I forgot how/why this works
  }


  //Reformat words
  var temp;
  var remove = [];
  var removeCount;
  var match = [];

  var reg;

  for(var i = 1; i <= wordCount; i++) {
    //Regex character filtering
    words[i] = words[i].replace(/__/g, '*');
    words[i] = words[i].replace(/[\s.,\'-]/g, '');
    regWords.push(words[i]);
  }
  console.log(regWords)
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

function matchRule(str, rule) {
  return new RegExp("^" + rule.split("*").join(".") + "$").test(str);
}

function read() {
  fs.readFile('email.json', (err, data) => {
    if(err) throw err;
    input = JSON.parse(data);
    wrong = input.guessedWrong;
    answer = input.answer;

    for(var i = 0; i < wrong.length; i++) {
      if(_.indexOf(vowels, wrong[i]) !== -1) {
        vowels.splice(_.indexOf(vowels, char), 1);
      }
    }

    //Generate right based off puzzle
    right = [];
    input.fullPuzzle.split('').forEach((char) => {
      if(char.match(/[a-z]/i)) {
        if(right.indexOf(char) == -1) {
          right.push(char);
        }

        if(_.indexOf(vowels, char) !== -1) {
          vowels.splice(_.indexOf(vowels, char), 1);
        }

      }
    });
    right.sort();
    parseWords(input.fullPuzzle);
  });



  var wordList = [];

  lineReader.on('line', (line) => {
    if(line.search(/[-.&\/]/g) === -1) { //Filter out weird words from list
      wordList.push(line);
      listCount++;
    }

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
                  var wordGood = true;
                  for(var i = 0; i < item.length; i++) { //Filter out guessed + bad letters
                    if(wrong.indexOf(item.toUpperCase().charAt(i)) !== -1) {
                      wordGood = false;
                      break;
                    }
                    if(right.indexOf(item.toUpperCase().charAt(i)) !== -1) {
                      if(word.charAt(i) != item.toUpperCase().charAt(i)) {
                        wordGood = false;
                        break;
                      }
                    }
                  }

                  if(item.search(/[aeiou]/ig) === -1) { //If word has vowel
                    wordGood = false;
                  }

                  if(wordGood) {
                    if(guessMatch[wordIndex].indexOf(item) == -1) {
                      guessMatch[wordIndex].push(item);
                      probability.populateData(item, right)
                    }
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

        console.log()
        //console.log("Matches Found: " + bestGuess.length);

        //console.log(guessMatch)

        //console.log(_.sortBy(results, 'length'))
      }
    });
    probability.formatData();
    puzzle.init(regWords, answer, right, wrong);
  });
}
read();






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
  read();
});

app.get('/wordData', (req, res) => {
  res.json(probability.getData());
});

app.get('/total', (req, res) => {
  res.json(probability.getTotal());
})




app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
