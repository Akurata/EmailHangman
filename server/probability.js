var _ = require('underscore');

var wordData = [];

module.exports.populateData = function(word, right) {
  var temp = word.toUpperCase().split('')
  temp.forEach((letter) => {
    if(right.indexOf(letter) === -1) {
      if(_.findWhere(wordData, {length: temp.length, letter: letter}) == null) {
        wordData.push({length: temp.length, letter: letter, count: 0});
      }

      wordData.find((obj, index) => {
        return obj.length === temp.length && obj.letter === letter;
      }).count++;
    }
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

module.exports.getTotal = function() {
  var total = [];
  _.each(wordData, (lengthGroup, index) => {
    _.each(lengthGroup, (item, slot) => {
      if(_.findWhere(total, {letter: item.letter}) == undefined) {
        total.push({'letter': item.letter, 'count': item.count});
      }else {
        total.find((obj, index) => {
          return obj.letter === item.letter
        }).count += item.count;
      }
    });
  });
  return _.sortBy(total, 'count').reverse();
}

module.exports.getData = function() {
  return wordData;
}
