
const express = require('express');
const app = express();

var fs = require('fs');
var path = require('path');
var bodyParser = require('body-parser');
var _ = require('underscore');
var wordnet = require('wordnet');
var ProgressBar = require('cli-progress');

app.use(express.static(path.resolve('../')));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var probability = require('./probability.js');
var puzzle = require('./puzzle.js');



var lineReader = require('readline').createInterface({
  input: require('fs').createReadStream('words.txt')
});


var transaction = {
  puzzle: {},
  guesses: {
    wrong: [],
    right: [],
  },
  data: [],
}


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
          transaction['puzzle'][wordCount] = s.slice(wordStart, i) + '.';
          i++;
          break;
        }
        //Identify space and set word endpoint
        if((array[i] === ' ') && (array[i + 1] === ' ') && (array[i + 2] === ' ') && (array[i + 3] === ' ')) {
          wordCount++;
          transaction['puzzle'][wordCount] = s.slice(wordStart, i);
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
    transaction['data'].push([]); // 7-9-2018: I forgot how/why this works
  }


  //Reformat words
  var temp;
  var remove = [];
  var removeCount;
  var match = [];

  var reg;

  for(var i = 1; i <= wordCount; i++) {
    //Regex character filtering
    transaction['puzzle'][i] = transaction['puzzle'][i].replace(/__/g, '*');
    transaction['puzzle'][i] = transaction['puzzle'][i].replace(/[\s.,\'-]/g, '');
    regWords.push(transaction['puzzle'][i]);
  }
  console.log(regWords)

  matchFilter()
}

function matchFilter() {
  console.log("matchFilter called")
  var tempFalse = [];
  var tempMatch = [];
    //Generate match data
    for(var i = 1; i <= wordCount; i++) {
      for(var j = 0; j < transaction['puzzle'][i].length; j++) {
        if(transaction.guesses.right.indexOf(transaction['puzzle'][i][j]) != -1) {
            matches.push({size: transaction['puzzle'][i].length, index: j, letter: transaction['puzzle'][i][j]});

            if(_.findWhere(tempMatch, {size: transaction['puzzle'][i].length, index: j}) == null) {
              tempMatch.push({size: transaction['puzzle'][i].length, index: j});
            }
        }else {
          if(_.findWhere(tempFalse, {size: transaction['puzzle'][i].length, index: j}) == null) {
            tempFalse.push({size: transaction['puzzle'][i].length, index: j});
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

function read(cb) {
  fs.readFile('email.json', (err, data) => {
    if(err) throw err;
    input = JSON.parse(data);
    transaction.guesses.wrong = input.guessedWrong;
    answer = input.answer;

    for(var i = 0; i <   transaction.guesses.wrong.length; i++) {
      if(_.indexOf(vowels, transaction.guesses.wrong[i]) !== -1) {
        vowels.splice(_.indexOf(vowels, char), 1);
      }
    }

    //Generate right based off puzzle
    //right = [];
    input.fullPuzzle.split('').forEach((char) => {
      if(char.match(/[a-z]/i)) {
        if(transaction.guesses.wrong.indexOf(char) == -1) {
          transaction.guesses.wrong.push(char);
        }

        if(_.indexOf(vowels, char) !== -1) {
          vowels.splice(_.indexOf(vowels, char), 1);
        }

      }
    });
    transaction.guesses.wrong.sort();
    parseWords(input.fullPuzzle);
  });
  cb;
}
read(filter());

function filter() {
  console.log("Filter called")
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
      if(sizePool.indexOf((transaction['puzzle'][i]).length) === -1) {
        sizePool.push((transaction['puzzle'][i]).length);
      }
    }

    const bar = new ProgressBar.Bar({}, ProgressBar.Presets.shades_classic);
    bar.start(listCount, 1);

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
                    if(transaction.guesses.wrong.indexOf(item.toUpperCase().charAt(i)) !== -1) {
                      wordGood = false;
                      break;
                    }
                    if(transaction.guesses.wrong.indexOf(item.toUpperCase().charAt(i)) !== -1) {
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
                    if(transaction['data'][wordIndex].indexOf(item) == -1) {
                      transaction['data'][wordIndex].push(item);
                      probability.populateData(item, transaction.guesses.wrong)
                    }
                  }

                }
              }
            })
          }
        }
      }

      bar.update(index);
      if(index == listCount) {
        bar.stop();
        console.log()
      }
    });
    probability.formatData();
    puzzle.init(regWords, answer, transaction.guesses.right, transaction.guesses.wrong);
  });
}





app.get('/', (req, res) => {
  res.sendFile(path.resolve('../view/index.html'));
});

app.get('/transaction', (req, res) => {
  res.send(transaction);
});

app.get('/wordData', (req, res) => {
  res.json(probability.getData());
});

app.get('/total', (req, res) => {
  res.json(probability.getTotal());
});

app.get('/answer', (req, res) => {
  res.send(puzzle.getMetaData());
});

app.post('/guess/:letter', (req, res) => {
  var data = puzzle.guess(req.params.letter)
  transaction.puzzle = data.puzzle;
  data.guess ? null : transaction.guesses.wrong.push(data.letter);

  fs.readFile('./email.json', (err, data) => {
    if(err) throw err;

    var temp = JSON.parse(data);
    var s;
    for(var i = 1; i < wordCount; i++) { //Parse back format: CHANGE THIS PLEASE
      s += transaction['puzzle'][i].replace(/\*/g, '__ ') + '    ';
    }
    temp.fullPuzzle = s;
    temp = JSON.stringify(temp);
    fs.writeFile('./email.json', temp, callback);
  });

  res.send(transaction)
  res.end();
});




app.listen(3000, 'localhost', (err) => {
  if(err) {
    console.log(err);
  }else {
    console.log("App running at localhost:3000");
  }
});
