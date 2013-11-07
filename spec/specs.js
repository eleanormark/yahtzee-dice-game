describe('Player', function() {
  it('starts with a score of 0', function() {
    var player = Object.create(Player);
    player.score.should.equal(0);
  });

  it('adds points to score', function() {
    var player = Object.create(Player);
    player.addPoints(7);
    player.score.should.equal(7);
  });

  it('has an id', function() {
    var player = Object.create(Player);
    player.setId(1);
    player.id.should.equal(1);
  });
});

describe('Game', function() {

  it('starts with 0 turns completed', function() {
    var game = Object.create(Game);
    game.turnsCompleted.should.equal(0);
  });

  it('has players', function() {
    var game = Object.create(Game);
    game.createPlayers(2);
    game.players.length.should.equal(2);
  });

  it('has a current player', function() {
    var game = Object.create(Game);
    game.createPlayers(2);
    game.currentPlayer.id.should.equal(1);
  });

  it('has a winner', function() {
    var game = Object.create(Game);
    game.createPlayers(2);
    game.players[0].addPoints(50);
    game.determineWinner();
    game.winners.should.eql([game.players[0]]);
  });

  it('is not over if each player has played less than 13 turns', function() {
    var game = Object.create(Game);
    game.createPlayers(2);
    game.isOver().should.be.false;
  });

  it('is over if each player has played 13 turns', function() {
    var game = Object.create(Game);
    game.createPlayers(2);
    game.turnsCompleted = 26;
    game.isOver().should.be.true;
  });

  describe('nextPlayer', function() {
    it('sets the next player in the player array as the current player', function() {
      var game = Object.create(Game);
      game.createPlayers(2);
      game.nextPlayer();
      game.currentPlayer.id.should.equal(2);
    });
  });
});

describe('Die', function() {
  it('rolls a number between 1 and 6', function() {
    var die = Object.create(Die);
    sinon.stub(Math, 'random').returns(.98);
    die.roll().should.equal(6); 
    Math.random.restore();
  });
});

describe('Turn', function() {

  it('starts with the dice rolled zero times', function() {
    var turn = Object.create(Turn);
    turn.numberOfRolls.should.equal(0);
  });

  it('adds one to the numberOfRolls each dice roll', function() {
    var turn = Object.create(Turn);
    var die = Object.create(Die);
    turn.rollDice(die);
    turn.numberOfRolls.should.equal(1);
  });

  it('has five rolled dice', function() {
    var turn = Object.create(Turn);
    var die = Object.create(Die);
    sinon.stub(Die, 'roll').returns(6);
    turn.rollDice(die);
    turn.rolls.should.eql([6, 6, 6, 6, 6]);
    Die.roll.restore();
  });

  describe('rerollDice', function() {
    it('rerolls the selected die', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      sinon.stub(Die, 'roll').returns(6);
      turn.rollDice(die);
      Die.roll.restore();
      sinon.stub(Die, 'roll').returns(1);
      turn.rerollDice(die, [0, 2, 4]);
      Die.roll.restore();
      turn.rolls.should.eql([1, 6, 1, 6, 1]);
    });

    it('adds one to the number of rolls', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      turn.rollDice(die);
      turn.rerollDice(die,[0]);
      turn.numberOfRolls.should.equal(2);
    });
  });

  describe('evaluateRolls', function() {
    it('returns 50 points if the rolled dice are five of a kind', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      sinon.stub(Die, 'roll').returns(5);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(50);
    });

    it('returns the sum of the four dice if the rolled dice are four of a kind', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var fourOfKind = function() {
        timesRun++;
        if (timesRun < 5) {
          return 5;
        } else {
          return 3;
        }
      }
      sinon.stub(Die, 'roll', fourOfKind);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(20);
    });

    it('returns 40 points if there are five sequential dice', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var straight = function() {
        timesRun++;
        return timesRun;
      }
      sinon.stub(Die, 'roll', straight);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(40);
    });

    it('returns 25 points if the rolled dice are three of a kind and a pair', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var fullHouse = function() {
        timesRun++;
        if (timesRun < 4) {
          return 2;
        } else {
          return 3;
        }
      }
      sinon.stub(Die, 'roll', fullHouse);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(25);
    });

    it('returns the sum of the three matching dice if the rolled dice have three of a kind', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var threeOfKind = function() {
        timesRun++;
        if (timesRun < 4) {
          return 2;
        } else {
          return timesRun;
        }
      }
      sinon.stub(Die, 'roll', threeOfKind);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(6);
    });

    it('returns 30 points if the rolled dice have a small striaght', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var smallStraight = function() {
        timesRun++;
        if (timesRun <= 2) {
          return timesRun;
        } else {
          return timesRun - 1;
        }
      }
      sinon.stub(Die, 'roll', smallStraight);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(30);
    });

    it('returns 0 points if the rolled dice do not fit any of the rolls listed above', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var noMatches = function() {
        timesRun++;
        if (timesRun === 1) {
          return 1;
        } else if (timesRun === 2) {
          return 3;
        } else if (timesRun === 5) {
          return 4;
        } else {
          return 6;
        }
      }
      sinon.stub(Die, 'roll', noMatches);
      turn.rollDice(die);
      Die.roll.restore();
      turn.evaluateRolls().should.equal(0);
    });
  });
  
  describe('isFiveOfKind', function() {
    it('returns true if the rolled dice are five of a kind', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      sinon.stub(Die, 'roll').returns(5);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isFiveOfKind().should.be.true;
    });
  });

  describe('isFourOfKind', function() {
    it('returns true if the rolled dice are four of a kind', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var fourOfKind = function() {
        timesRun++;
        if (timesRun < 5) {
          return 5;
        } else {
          return 3;
        }
      }
      sinon.stub(Die, 'roll', fourOfKind);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isFourOfKind().should.be.true;
    });
  });

  describe('isStraight', function() {
    it('returns true if the rolled dice are a straight', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var straight = function() {
        timesRun++;
        return timesRun;
      }
      sinon.stub(Die, 'roll', straight);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isStraight().should.be.true;
    });

    it('returns false if the rolled dice are not a straight', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      sinon.stub(Die, 'roll').returns(6);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isStraight().should.be.false;
    });
  });

  describe('isFullHouse', function() {
    it('returns false if the rolled dice are not a full house', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      sinon.stub(Die, 'roll').returns(6);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isFullHouse().should.be.false;
    });

    it("returns true if the rolled dice are three of a kind and a pair", function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var fullHouse = function() {
        timesRun++;
        if (timesRun < 4) {
          return 2;
        } else {
          return 3;
        }
      }
      sinon.stub(Die, 'roll', fullHouse);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isFullHouse().should.be.true;
    });
  });

  describe('isThreeOfKind', function() {
    it('returns true if the rolled dice are three of a kind', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var threeOfKind = function() {
        timesRun++;
        if (timesRun < 4) {
          return 2;
        } else {
          return timesRun;
        }
      }
      sinon.stub(Die, 'roll', threeOfKind);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isThreeOfKind().should.be.true;
    });

    it("returns false if the rolled dice are five of a kind", function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      sinon.stub(Die, 'roll').returns(5);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isThreeOfKind().should.be.false;
    });

    it("returns false if the rolled dice are four of a kind", function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var fourOfKind = function() {
        timesRun++;
        if (timesRun < 5) {
          return 5;
        } else {
          return 3;
        }
      }
      sinon.stub(Die, 'roll', fourOfKind);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isThreeOfKind().should.be.false;
    });

    it("returns false if the rolled dice are a full house", function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var fullHouse = function() {
        timesRun++;
        if (timesRun < 4) {
          return 2;
        } else {
          return 3;
        }
      }
      sinon.stub(Die, 'roll', fullHouse);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isThreeOfKind().should.be.false;
    });

    it("returns false if the rolled dice are not three of a kind", function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var noMatches = function() {
        timesRun++;
        if (timesRun < 3) {
          return 2;
        } else if (timesRun === 3) {
          return 4;
        } else {
          return 6;
        }
      }
      sinon.stub(Die, 'roll', noMatches);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isThreeOfKind();
    });
  });

  describe('isSmallStraight', function() {
    it('returns true if the the rolled dice are a four sequential dice', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var smallStraight = function() {
        timesRun++;
        if (timesRun <= 2) {
          return timesRun;
        } else {
          return timesRun - 1;
        }
      }
      sinon.stub(Die, 'roll', smallStraight);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls(); 
      turn.isSmallStraight().should.be.true;
    });

    it('returns false if the rolled dice do not have four sequential dice', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      var timesRun = 0;
      var notSmallStraight = function() {
        timesRun++;
        if (timesRun < 3) {
          return timesRun;
        } else {
          return timesRun + 1;
        }
      }
      sinon.stub(Die, 'roll', notSmallStraight);
      turn.rollDice(die);
      Die.roll.restore();
      turn.sortRolls();
      turn.isSmallStraight().should.be.false;
    });

  });

  describe('sortRolls', function() {
    it('returns an array of dice rolls from lowest value to highest', function() {
      var turn = Object.create(Turn);
      var die = Object.create(Die);
      turn.rollDice(die);
      turn.rolls = [4, 3, 1, 6, 2];
      turn.sortRolls();
      turn.sortedRolls.should.eql([1, 2, 3, 4, 6]);
    });
  });
});

describe('compareArrays', function() {
  it('returns false if the array lengths are not equal', function() {
    var array1 = [1, 2, 3];
    var array2 = [1];
    compareArrays(array1, array2).should.be.false;
  });

  it("returns true if the arrays are the same", function() {
    var array1 = [1, 2, 3];
    var array2 = [1, 2, 3];
    compareArrays(array1, array2).should.be.true;
  });

  it("returns false if the arrays have the same length but are not identical", function() {
    var array1 = [1, 2, 3, 4];
    var array2 = [2, 3, 4, 5];
    compareArrays(array1, array2).should.be.false;
  });
});

































