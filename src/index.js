const { NO_OF_OVERS, PLAYER_PROBABILITY, STATUS } = require("./constants");
let SCORECARD = [
  //Key-Value Pair to store player Id, run scored corresponding to the ball count
];
let ACTIVE_PLAYER_ID = "P1";
let PLAYER_STATUS = {
  P1: {
    status: STATUS.ACTIVE
  },
  P2: {
    status: STATUS.ON_OPPOSITE_CREASE
  },
  P3: {
    status: STATUS.INACTIVE
  },
  P4: {
    status: STATUS.INACTIVE
  }
};
let PLAYER_AVAILABLE = 2;
let TOTAL_RUNS_MADE = 0;
let TOTAl_BALLS_LEFT = NO_OF_OVERS * 6;

// Random Number Generator between 0 to MAX
const getRandomizer = top => {
  return Math.floor(Math.random() * top);
};

// CLASS cricket initialized
class Cricket {
  constructor() {
    this.WEIGHTED_RANDOM_NO_VALUES = {}; // stores values of weighted random numbers
    this.WEIGHTED_RANDOM_NO_VALUES_INDEX = {};
    this.totalRuns = 40;
    this.totalWickets = 4;
    this.totalWicketsRemaining = 4;
    this.totalRunsLeft = 40;
    this.activePlayerId = "P1";
  }

  // Program to generate weighted random number using spreading technique
  // using spread constant as 100;

  weighted_random_generator = player_id => { // player id passed 
    const weighted_values = [];
    const weighted_values_index = [];
    for (var p = 0; p < 8; p++) {
      for (var x = 0; x < PLAYER_PROBABILITY[`${player_id}`][p] * 100; x++) {
        weighted_values.push(PLAYER_PROBABILITY[`${player_id}`][p]);
        weighted_values_index.push(p);
      }
    }
    return [weighted_values, weighted_values_index];
  };

  
  generate_weighted_random_values = () => {
    Object.keys(PLAYER_PROBABILITY).map(player => {
      this.WEIGHTED_RANDOM_NO_VALUES[`${player}`] = {
        player_name: PLAYER_PROBABILITY[`${player}`][`name`],
        value: this.weighted_random_generator(player)[0],
        value_index: this.weighted_random_generator(player)[1]
      };
    });
    return this.WEIGHTED_RANDOM_NO_VALUES;
  };

  scoreBoardRunUpdater = (run_scored, activePlayerId, ballCount, msg) => {
    SCORECARD.push({
      ballCount: ballCount,
      playerId: activePlayerId,
      runScored: run_scored,
      msg: msg
    });
  };

  getActivePlayer = () => {
    const activePlayer = Object.keys(PLAYER_STATUS).filter(player => {
      if (PLAYER_STATUS[`${player}`].status === STATUS.ACTIVE) {
        return player;
      }
    });
    return activePlayer[0];
  };

  getplayerOnOppositeCrease = () => {
    const playerOnOppositeCrease = Object.keys(PLAYER_STATUS).filter(player => {
      if (PLAYER_STATUS[`${player}`].status === STATUS.ON_OPPOSITE_CREASE) {
        return player;
      }
    });
    return playerOnOppositeCrease[0];
  };

  changeCrease = (activePlayer, playerOnOppositeCrease) => {
    let temp = activePlayer;
    activePlayer = playerOnOppositeCrease;
    playerOnOppositeCrease = temp;
    PLAYER_STATUS[`${activePlayer}`].status = STATUS.ACTIVE;
    PLAYER_STATUS[`${playerOnOppositeCrease}`].status =
      STATUS.ON_OPPOSITE_CREASE;
    return [activePlayer, playerOnOppositeCrease];
  };

  checkRun = (run_scored, activePlayerId, ballCount) => {
    const activePlayer = this.getActivePlayer();
    const playerOnOppositeCrease = this.getplayerOnOppositeCrease();
    if (run_scored === 7) {
      console.log(`Ball ${ballCount}: Player ${activePlayerId} got out`);
      this.scoreBoardRunUpdater(run_scored, activePlayerId, ballCount, "OUT");
      PLAYER_STATUS[`${activePlayer}`].status = STATUS.OUT;
      let newPlayerId = Object.keys(PLAYER_STATUS)[4 - PLAYER_AVAILABLE];
      PLAYER_STATUS[`${newPlayerId}`].status = STATUS.ACTIVE;
      PLAYER_AVAILABLE = PLAYER_AVAILABLE - 1;
      return [newPlayerId, playerOnOppositeCrease];
    }
    if (run_scored % 2 == 0) {
      console.log(
        `Ball ${ballCount}: Player ${activePlayerId} scored ${run_scored}`
      );
      this.scoreBoardRunUpdater(run_scored, activePlayerId, ballCount, "EVEN");
      return [activePlayer, playerOnOppositeCrease];
    } else {
      console.log(
        `Ball ${ballCount}: Player ${activePlayerId} scored ${run_scored}`
      );
      this.scoreBoardRunUpdater(run_scored, activePlayerId, ballCount, "ODD");
      console.log(`INFO:Players Change there crease`);
      return this.changeCrease(activePlayer, playerOnOppositeCrease);
    }
  };

  run() {
    let activePlayerId = ACTIVE_PLAYER_ID;
    for (var ballCount = 1; ballCount <= NO_OF_OVERS * 6; ballCount++) {
      if (PLAYER_AVAILABLE <= 0) {
        return false;
      }
      let random_value = getRandomizer(
        this.WEIGHTED_RANDOM_NO_VALUES[`${activePlayerId}`]["value"].length
      );
      var run_scored = this.WEIGHTED_RANDOM_NO_VALUES[`${activePlayerId}`][
        "value_index"
      ][random_value];

      TOTAL_RUNS_MADE = TOTAL_RUNS_MADE + run_scored;
      TOTAl_BALLS_LEFT = NO_OF_OVERS * 6 - ballCount;
      let players_playing = this.checkRun(
        run_scored,
        ACTIVE_PLAYER_ID,
        ballCount
      );
      ACTIVE_PLAYER_ID = players_playing[0];
      if (ballCount % 6 == 0) {
        console.log("----------");
        console.log(`NEW OVER START, ${40 - TOTAL_RUNS_MADE} runs required`);
        console.log("----------");
        ACTIVE_PLAYER_ID = this.getplayerOnOppositeCrease();
      }
      if (TOTAL_RUNS_MADE > 40) {
        return true;
      }
    }
  }
}

const cricket = new Cricket();
cricket.generate_weighted_random_values();
console.log("LIVE COMMENTARY");
if (cricket.run()) {
  console.log("RESULT---------->");
  console.log(`INDIA WINS with ${TOTAl_BALLS_LEFT} balls left`);
} else {
  console.log("RESULT---------->");
  console.log(`INDIA LOST`);
}
console.log(SCORECARD);
