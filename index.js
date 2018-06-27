
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
var matches = [];
var falseMatches = [];

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
  }
  console.log("Guessed Wrong: " + wrong);
  console.log("Guessed Right: " + right);



  //Generate match data
  for(var i = 1; i <= wordCount; i++) {
    for(var j = 0; j < words[i].length; j++) {
      if(right.indexOf(words[i][j]) != -1) {
          matches.push({size: words[i].length, index: j, letter: words[i][j]});
      }else {
          falseMatches.push({size: words[i].length, index: j});
      }
    }
  }
var temp = [];


  for(var i = 0; i < falseMatches.length; i++) {
    for(var j = 0; j < matches.length; j++) {
      if((falseMatches[i].size == matches[j].size) && (falseMatches[i].index == matches[j].index)) {
        falseMatches.splice(i, 1)
      }
    }
  }



//console.log(falseMatches.map(function(x) {return x.size; }).indexOf(4))

  console.log(falseMatches.indexOf(obj))
  console.log(matches[1].index == falseMatches[0].index)
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
  list.forEach((item, index) => {

    if(sizePool.includes((item).length)) { //If item is correct size

        if((item).indexOf(" ") == -1) { //If item has no space char

          wrong.forEach((wrongChar) => {



            if(item.toUpperCase().indexOf(wrongChar) == -1) { //No wrong char found

              for(var i = 0; i < matches.length; i++) {
                if(item.length === matches[i].size) { //Match size with one of matches
                  //console.log("Comparing " + item + " to " + matches[i].letter + " at " + matches[i].index + ": " + (item.toUpperCase().charAt(matches[i].index) === matches[i].letter))
                  if(item.toUpperCase().charAt(matches[i].index) === matches[i].letter) { //Check item matches word missing char
                    if(givenTrue.indexOf(index) === -1) { //Sort based off rules. Next find crossfactor of rules
                      givenTrue.push(index);
                    }
                  }else if(givenFalse.indexOf(index) === -1) {
                      givenFalse.push(index);
                    }
                  }
                }
              }


          });
        }
    }
    //Empty space can't be an already guessed letter

      //Determine if there are correct characters for a specific word length
        //IF NO: Push word
        //IF YES: Determine index of characters in word list word
          //Match index vs item word
          //IF MATCH: Push word


      //Empty space vs known characters
      //_ = unknown

    bar.update(index);
    if(index == 147305) {
      bar.stop();
    }
  });
  givenTrue.forEach((testItem) => { //Union the two sets
    if(givenFalse.indexOf(testItem) === -1) {
      if(bestGuess.indexOf(testItem) === -1) {
        bestGuess.push(testItem);
      }
    }
  });


//Filter Known Pool
  var knownPool = [];




  if(found === []) {
    console.log("\nWord Not Found...");
  }else {
    /*
    console.log("\nFound: " + found.length)
    for(var i = 0; i < found.length; i++) {
    }
    */
    console.log("Best Guess Found: " + bestGuess.length);
    for(var i = 0; i < bestGuess.length; i++) {
      //console.log(list[bestGuess[i]].toUpperCase())
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
