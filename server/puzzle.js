'use strict'

var metaData = {};

module.exports.init = function(puzzle, answer, right, wrong) {
  this.puzzle = puzzle;
  this.right = right;
  this.wrong = wrong;
  this.answer = answer.toUpperCase().split('');

  for(var i = 0; i < this.answer.length; i++) {
    if(metaData[this.answer[i]] == undefined) {
      metaData[this.answer[i]] = [i];
    }else {
      metaData[this.answer[i]].push(i);
    }
  }
}


module.exports.guess = function(guess) {
  var data = {
    puzzle: this['puzzle'].join(' '),
    guess: false,
    letter: guess
  };

  if(metaData[guess] !== undefined) { //If letter found in metadata
    this['right'].push(guess); //Add guess to the right choices
    data.guess = true;

    var temp = data.puzzle.split('');
    var hold = {};

    metaData[guess].forEach((index) => { //Replacing letters
      temp[index] = guess;
    });

    var wordStart = 0;
    var wordEnd = 0;
    var wordCount = 1;

    temp.forEach((letter, index) => { //Reparse new words
      if(temp[index + 1] == ' ' || temp[index + 1] == undefined) {
        hold[wordCount] = temp.join('').substring(wordStart, index + 1);
        wordStart = index + 1;
        wordCount++;
      }
    });
    data.puzzle = hold;
  }
  return data;
}



module.exports.getMetaData = function() {
  return metaData;
}
