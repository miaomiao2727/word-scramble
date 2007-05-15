/*

Document Setup
*/
var debug = true;

/*

Adding a random method to Array
*/
Object.extend(Array.prototype, {
  rand: function(){
    var reducedArray = this.clone();
    var j = [];
    for(i = 1; i <= this.length; i++){
      var A = 0;
      var B = this.length - j.length;
      var randomIndex = Math.floor(A + (B - A) * Math.random());
      j.push(reducedArray[randomIndex]);
      reducedArray.splice(randomIndex, 1);
    }
    return j;
  }
});


function init () {
  
  $$('html', 'body').invoke('observe', 'click', function(){
    $('input').focus();
  });

  x = new Anagram(
    "random",
    [
      "oar",
      "rod",
      "moan",
      "dam",
      "road",
      "nomad",
      "man",
      "mad",
      "nod",
      "arm",
      "darn",
      "don",
      "ran",
      "rad",
      "adorn",
      "norm",
      "dorm",
      "roam",
      "damn",
      "roman",
      "morn",
      "random",
      "ram",
      "and",
      "dram",
      "nor"
    ]
  );
  var mask = Element('div', {class: 'mask'});;

  new Insertion.Before("input", mask);
}


/*

Anagram Class
*/
var Anagram = Class.create();
Anagram.prototype = {
  initialize: function(word, matches) {
    this.word = word;
    this.matches = matches;
    this.solved = [];
    this.matchesAppearDuration = 3;
    this.wordArray = this.word.split("");

    this.wordArrayRandom = this.wordArray.rand();
    this.wordRandom = this.wordArrayRandom.join("");

    this.untypedCharacters = this.wordArray.clone();
    this.typedCharacters = [];

    this.untypedSlots = $$("div#untyped div.slot");
    this.typedSlots = $$("div#typed div.slot");

    this.score = $('score');
    this.UnsolvedMatchesNumber = $('UnsolvedMatchesNumber');
    this.SolvedMatchesNumber = $('SolvedMatchesNumber');
    
    this.setup();
  },
  setup: function(){
    this.writeWord();
    this.appear();
    this.writeMatches();
    this.inputSetup();
    this.updateScore();
  },
  emptyTyped: function(){
    this.typedSlots.invoke('update', ' ');
  },
  writeMatches: function(){
    this.matches.each(function(node, i){
      var match = new Element('div', {class: 'match __' + node});
      new Insertion.Bottom('matches', match);
      node.split('').each(function(node, i){
        var matchCharacter1 = new Element('div', {class: 'character'});
        var matchCharacter2 = new Element('div', {style: 'display: none;'});
        matchCharacter2.update(node);
        new Insertion.Bottom(matchCharacter1, matchCharacter2);
        new Insertion.Bottom(match, matchCharacter1);
      });
    });
    this.matchesDivs = $$('div.match');
  },
  writeWord: function(){
    var untypedSlots = this.untypedSlots;
    var tempWordArray = this.wordArray.rand();
    while (tempWordArray == this.wordArray) {
      tempWordArray = this.wordArray.rand();
    }
    tempWordArray.each(function(node, i){
      untypedSlots[i].update(node);
    });
  },
  appear: function(){
    new Effect.Appear('untyped', {
      duration: 1,
      afterFinish: function(){
        var slotsArray = this.untypedSlots;
        slotsArray.each(function(node, i){
          var t = setTimeout(function(){
            new Effect.Grow(
              node,
              {
                duration: .3,
                afterFinish: function(){
                  if (node == slotsArray.last()) new Effect.Appear('matches');
                }
              }
            );
          }, i * 100);
        });
      }.bindAsEventListener(this)
    });
  },
  showMatch: function() {
    this.typedWord = this.typedCharacters.join('');
    this.inp.disable();
    if ((!this.solved.include(this.typedWord))&&(this.matches.include(this.typedWord))){
      this.matchesDivs.each(function(node, i){
        if (node.hasClassName("__" + this.typedWord)) {
          this.updateSolved(this.typedWord);
          /* highlight the word green, to show success */
          this.typedSlots.each(function(slot, i){
            new Effect.Highlight(slot, {startcolor: '#b5e655'});
          });
          this.solved.push(this.typedWord);
          this.updateScore();

          var characterDivs = node.getElementsBySelector(".character div");
          characterDivs.each(function(node, i){
          // fade in, then drop out
            new Effect.Appear(node, {
              duration: .3,
              afterFinish: function(){
                if (node == characterDivs.last()) {
                  var mc = node.up();
                  new Effect.DropOut(mc, {
                    duration: .2,
                    afterFinish: function(){
                      mc.siblings().reverse().each(function(node, i){
                        var t = setTimeout(function(){
                          new Effect.DropOut(node, {
                            afterFinish: function(){
                              if (i == mc.siblings().length - 1) {
                                new Effect.Shrink(mc.up());
                              }
                            }
                          });
                        }, i * 200);
                      });
                    }
                  })
                }
              }.bindAsEventListener(this)
            });
          }.bindAsEventListener(this));
        }
      }.bindAsEventListener(this));
    } else {
      this.typedSlots.each(function(slot, i){
        new Effect.Highlight(slot, {startcolor: '#ff0022'});
      });
    }
    this.typedWord = '';

  },
  updateSolved: function(typedWord){
    if (this.solved == 0) $('solved').update('');
    var ___match = '___' + typedWord;
    var li = new Element('li', {id: ___match, style: 'display: none;'});
    var a = ['<a href="http://yubnub.org/parser/parse?command=g define ', typedWord, '" target="_blank" title="Define ', typedWord ,'">', typedWord, '</a>'].join('');
    li.update(a);
    new Insertion.Bottom('solved', li);
    new Effect.Appear($(___match));
  },
  updateTyped: function(c){
    var c = c;
    var ts = this.typedSlots;
    if (this.untypedCharacters.include(c)){
      // add to typed
      var nts = ts.find(function(node, i){
        if (node.empty()){ return true; }
      }).update(c);
      new Effect.Appear(nts, {duration: .2});
      // remove from untyped
      this.typedCharacters.push(c);
      this.updateUntyped(c);
    }
  },
  updateUntyped: function(c){
    var uts = this.untypedSlots;
    var wordArrayRandom = this.wordArrayRandom;
    var c = c;
    // empty the typed character
    uts.find(function(node, i){
      if (node.innerHTML == c) {
        gap = i;
        return true;
      }
    }).update("");
    // shift to fill the gap
    // ..x....

    wordArrayRandom = wordArrayRandom.without(wordArrayRandom[gap]);
    this.untypedCharacters = this.untypedCharacters.without(c);

  },
  updateScore: function(){
    this.score.update([this.solved.length, "/", this.matches.length].join(''));
    this.UnsolvedMatchesNumber.update(this.matches.length - this.solved.length);
    this.SolvedMatchesNumber.update(this.solved.length);
  },
  backSpace: function(){
    var ts = this.typedSlots;
    var uts = this.untypedSlots;
    if (this.typedCharacters.length > 0){
      var lastTypedSlot = ts.findAll(function(node, i){
        if (!node.empty()) { return true; }
      }).last();
      uts.find(function(node, i){
        if (node.empty()){
          node.update(lastTypedSlot.innerHTML);
          return true;
        }
      });
      this.typedCharacters = this.typedCharacters.without(lastTypedSlot.innerHTML);
      this.untypedCharacters.push(lastTypedSlot.innerHTML);
      lastTypedSlot.update("");
      new Effect.Shrink(lastTypedSlot, {duration: .1});
    }
  },
  submitTyped: function(){
    var ts = this.typedSlots;
    var uts = this.untypedSlots;
    this.match = '';
    this.showMatch();
    $A(ts.concat(uts)).invoke('update', '');
    ts.each(function(slot, i){
      var omgwtfbbq = setTimeout(function(){
        new Effect.Shrink(
          slot,
          {
            duration: .2,
            afterFinish: function(){
              this.inp.enable().focus();
            }.bindAsEventListener(this)
          }
        );
      }.bindAsEventListener(this), i * 100);
    }.bindAsEventListener(this));
    this.typedCharacters = [];
    this.untypedCharacters = this.wordArray;
    this.writeWord();
  },
  /*
  Handles controls for when the user types
  */
  inputSetup: function(){
    this.inp = $("input");
    this.inp.observe("keyup", function(e){
      if ((!this.inp.value.blank())||(e.keyCode == 13)||(e.keyCode == 8)){
        /* if backspace pressed */
        if (e.keyCode == 8){
          this.backSpace();
        }
        /* if enter pressed */ 
        else if (e.keyCode == 13) {
          this.submitTyped();
        }
        /* process character */
        else {
          this.inp.value.split('').each(function(c, i){
            this.updateTyped(c);
          }.bindAsEventListener(this));
        }
        this.inp.clear();
      }
    }.bindAsEventListener(this)).focus();;
  }
};


/*
For debugging purposes...
*/
function cl (str) {
  if (debug){
    Try.these(
      function(){
        console.log(str);
      }
    );
  }
}