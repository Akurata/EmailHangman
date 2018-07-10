var _ = require('underscore');

var wordData = [];

module.exports.populateData = function(word) {
  var temp = word.toUpperCase().split('')
  temp.forEach((letter) => {
    if(_.findWhere(wordData, {length: temp.length, letter: letter}) == null) {
      wordData.push({length: temp.length, letter: letter, count: 1});
    }

    wordData.find((obj, index) => {
      return obj.length === temp.length && obj.letter === letter;
    }).count++;
  })

}

module.exports.formatData = function() {
  wordData = _.groupBy(wordData, 'length');
  _.each(wordData, (wordGroup, index) => { //Sort by frequency
    _.each(wordGroup, (item, slot) => { //Remove length property
      wordData[index][slot] = _.omit(wordData[index][slot], 'length');
    });
    wordData[index] = _.sortBy(wordGroup, 'count').reverse();
  });
  return wordData;
}

module.exports.getData = function() {
  return wordData;
}
