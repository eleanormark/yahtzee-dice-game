var Player = {
  score: 0,
  
  addPoints: function(points) {
    this.score += points;
  },

  setId: function(id) {
    this.id = id;
  }

};

var Game = {

  turnsCompleted: 0,

  createPlayers: function(numberOfPlayers) {
    this.players = [];
    for (var i = 0; i < numberOfPlayers; i++){
      var player = Object.create(Player);
      player.setId(i + 1);
      this.players.push(player);
    }
    this.currentPlayer = this.players[0];
  },

  nextPlayer: function() {
    if (this.currentPlayer.id === this.players.length) {
      this.currentPlayer = this.players[0];
    } else {
      this.currentPlayer = this.players[this.players.indexOf(this.currentPlayer) + 1];
    }
  },

  determineWinner: function() {
    var highScore = this.players.reduce(function(previousPlayer, player) {
      if (player.score > previousPlayer.score) {
        return player.score;
      } else {
        return previousPlayer.score;
      }
    });
    this.winners = this.players.filter(function(player)  {
      return player.score === highScore;
    });
  },

  isOver: function() {
    return this.turnsCompleted === this.players.length * 13;
  }
};

var Die = {
  roll: function() {
    return Math.floor(Math.random() * 6) + 1;
  }
};

var Turn = {
  numberOfRolls: 0,

  rollDice: function(die) {
    this.rolls = [die.roll(), die.roll(), die.roll(), die.roll(), die.roll()];
    this.numberOfRolls = 1;
  },

  rerollDice: function(die, diceToReroll) {
    var diceRolls = this.rolls;
    diceToReroll.forEach(function(dieIndex) {
      diceRolls[dieIndex] = die.roll();
    });  
    this.numberOfRolls++; 
  },

  evaluateRolls: function() {
    this.sortRolls();
    if (this.isFiveOfKind()) {
      return 50;
    } else if (this.isFourOfKind()) {
      return this.sortedRolls[2] * 4;
    } else if (this.isStraight()) {
      return 40;
    } else if (this.isFullHouse()) {
      return 25;
    } else if (this.isThreeOfKind()) {
      return this.sortedRolls[2] * 3;
    } else if (this.isSmallStraight()) {
      return 30;
    } else {
      return 0;
    }
  },

  isFiveOfKind: function() {
    return (this.sortedRolls[0] === this.sortedRolls[4]);
  },

  isFourOfKind: function() {
    return (this.sortedRolls[0] === this.sortedRolls[3] || this.sortedRolls[1] === this.sortedRolls[4]);
  },

  isStraight: function() {
    return compareArrays(this.sortedRolls, [1, 2, 3, 4, 5]) || compareArrays(this.sortedRolls, [2, 3, 4, 5, 6]);
  },

  isFullHouse: function() {
    return ((this.sortedRolls[0] === this.sortedRolls[2] && this.sortedRolls[3] === this.sortedRolls[4] && this.sortedRolls[1] !== this.sortedRolls[3]) || (this.sortedRolls[0] === this.sortedRolls[1] && this.sortedRolls[2] === this.sortedRolls[4] && this.sortedRolls[1] !== this.sortedRolls[3]));
  },

  isThreeOfKind: function() {
    if (this.isFiveOfKind() || this.isFourOfKind() || this.isFullHouse()) {
      return false;
    } else {
      return((this.sortedRolls[1] === this.sortedRolls[3]) || (this.sortedRolls[0] === this.sortedRolls[2]) || (this.sortedRolls[2] === this.sortedRolls[4]));
    }
  }, 

  isSmallStraight: function() {
    var straightLength = 1;
    this.sortedRolls.reduce(function(previousRoll, currentRoll) {
      if (currentRoll === previousRoll + 1) {
        straightLength++;
      } else if (straightLength !== 4 && currentRoll !== previousRoll + 1 && currentRoll !== previousRoll) {
        straightLength--;
      }
      return currentRoll;
    });
    return straightLength === 4;
  },
  
  sortRolls: function() {
    this.sortedRolls = this.rolls.sort();
  }

};

function compareArrays(array1, array2) {
  if (array1.length !== array2.length) {
    return false;
  } else {
    for (var i = 0; i < array1.length; i++) {
      if (array1[i] !== array2[i]) {
        return false;
      }
    }
    return true;
  }
}

$(function() {
  var game;
  var die = Object.create(Die);
  var diceNames = {1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', 6: 'six'};
  var turn;
  
  function displayDice(turn) {
    for (var i = 0; i < 5; i++) {
      $('span#die' + i).removeClass().addClass('die ' + diceNames[turn.rolls[i]]).attr('value', i);
    }
    $("#rerolls-remaining").empty().append(3 - turn.numberOfRolls);
    if (turn.numberOfRolls === 2) {
      $("#reroll-plural").empty();
    } else if (turn.numberOfRolls === 3) {
      $("#reroll-dice").hide();
      $("#reroll-plural").empty().append("s");
    } else {
      $("#reroll-plural").empty().append("s");
    }
  }

  function displayScore(players) {
    $('div#scoreboard-border').empty().append("<div id='scoreboard' class='small-" + players.length * 3 + " columns'></div>");
    var columnsPerPlayer = 12 /players.length;
    if (players.length > 4) {
      columnsPerPlayer = 3;
    }
    players.forEach(function(player) {
      $('div#scoreboard').append(
        '<div class="small-' + columnsPerPlayer + ' columns">' +
          '<p>Player <span class="insert-player-id">' + player.id + '</span>: <span class="insert-player-score">' + player.score + '</span></p>' +
        '</div>'
      );
    });
  }


  $('button#see-instructions').click(function() {
    $(this).fadeOut();
    $('div#instructions').toggle();
  });

  $('#hide-instructions').click(function() {
    $('div#instructions').fadeOut();
    $('button#see-instructions').fadeIn();
  });

  $('button#play').click(function() {
    game = Object.create(Game);
    var numberOfPlayers = prompt('How many players?');
    game.createPlayers(numberOfPlayers);
    displayScore(game.players);
    $('button#play').hide();
    $('button#see-instructions').hide();
    $('div#lead-paragraph').hide();
    $('div#instructions').fadeIn();
    $('span#current-player-number').empty().append(game.currentPlayer.id);
    $('.active-player').fadeIn();
  });

  $('button#end-turn').click(function() {
    var points = turn.evaluateRolls();
    game.currentPlayer.addPoints(points);
    alert("You scored: " + points);
    displayScore(game.players);
    game.turnsCompleted ++;
    $("#reroll-instructions").hide();
    $("#reroll-dice").hide();


    if (game.isOver()) {
      game.determineWinner();
      if (game.winners.length > 1) {
        alert("It's a tie!");
      } else {
        alert("Player " + game.winners[0].id + " won!");
      }
      $('button#play').empty().append('Play Again').show();
    } else {
      game.nextPlayer();
      $('span#current-player-number').empty().append(game.currentPlayer.id);
      $('#current-turn').empty().append(Math.floor(game.turnsCompleted/game.players.length + 1));
      $('button#roll-dice').show();
      for (var i = 0; i < 5; i++) {
        $('span#die' + i).removeClass().addClass('die void');
      }
    }
  });

  $('.die').click(function() {
    $(this).toggleClass('selected');
  });

  $('button#roll-dice').click(function() {
    turn = Object.create(Turn);
    turn.rollDice(die);
    displayDice(turn);
    $(this).hide();
    $("#reroll-dice").show();
    $("#reroll-instructions").fadeIn();
  });

  $('button#reroll-dice').click(function() {
    var diceToReroll = [];
    $('.selected').each(function() {
      var dieNumber = $(this).attr('value');
      diceToReroll.push(dieNumber);
    });
    turn.rerollDice(die, diceToReroll);
    displayDice(turn);
  });
});
