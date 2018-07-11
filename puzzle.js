
var puzzle;
var answerMeta = [];
var right;
var wrong;

module.exports.init = function(puzzle, answer, right, wrong) {
  this.puzzle = puzzle;
  this.right = right;
  this.wrong = wrong;

  var answer = answer.toUpperCase().split('');
  for(var i = 0; i < answer.length; i++) {
    if(answer[i] !== ' ') {
      if(answerMeta[answer[i]] == undefined) {
        answerMeta[answer[i]] = [i];
      }else {
        answerMeta[answer[i]].push(i);
      }
    }
  }
}


module.exports.guess = function(guess) {

  

}
