import { PLAYER_PROBABILITY, STATUS } from "./constants";
const chalk = require("chalk"); // using chalk package to display colours on console

const log = console.log;
const COMMENTARY = {
  SCORED_0: 0,
  OVER_COMPLETED: 1,
  PLAYER_IS_OUT: 2,
  PLAYER_SCORED_0_2_4_6: 3,
  PLAYER_SCORED_1_3_5: 4
};

let PLAYER_STATUS = {
  KB: {
    status: STATUS.ACTIVE,
    runs: 0,
    balls:0
  },
  NS: {
    status: STATUS.ON_OPPOSITE_CREASE,
    runs: 0,
    balls:0
  },
  RB: {
    status: STATUS.INACTIVE,
    runs: 0,
    balls:0
  },
  SH: {
    status: STATUS.INACTIVE,
    runs: 0,
    balls:0
  }
};

const maxOvers = 4;
const maxRunsRequired = 40;
let playersAvailable = 2;
const maxBallsAvailable = maxOvers * 6;
let ballsPlayed = 1;
let activePlayerID = "KB";
let pastActivePlayerID = "";
let playerOnOppositeCrease = "NS";
let newPlayerID = "";
let weightedRandomNoValues = {};
let totalRunsMade = 0;

// function to get random number between 0 to MAX_VALUE
const getRandomNumber = top => {
  return Math.floor(Math.random() * top);
};

// generate a dictionary of random values based on the probability
const weightedRandomNumberGenerator = player_id => {
  // player id passed
  const weighted_values_index = [];
  for (var p = 0; p < 8; p++) {
    for (var x = 0; x < PLAYER_PROBABILITY[`${player_id}`][p] * 100; x++) {
      weighted_values_index.push(p);
    }
  }
  return weighted_values_index;
};

//generates weighted random values
const generateWeightedRandomValues = () => {
  Object.keys(PLAYER_PROBABILITY).map(player => {
    weightedRandomNoValues[`${player}`] = {
      player_name: PLAYER_PROBABILITY[`${player}`][`name`],
      score: weightedRandomNumberGenerator(player)
    };
  });
  return weightedRandomNoValues;
};

// removes one player if player is out
const removePlayer = () => {
  return new Promise((resolve, reject) => {
    playersAvailable--;
    PLAYER_STATUS[`${activePlayerID}`].status = STATUS.OUT;
    pastActivePlayerID = activePlayerID;
    resolve(true);
  });
};

// add one player after player is removed, its swap new player id with the active player id
const addPlayer = () => {
  return new Promise((resolve, reject) => {
    newPlayerID = Object.keys(PLAYER_STATUS)[3 - playersAvailable];
    PLAYER_STATUS[`${newPlayerID}`].status = STATUS.ACTIVE;
    activePlayerID = newPlayerID;
    resolve(true);
  });
};

// function which generate live commentary 
const commentary = (type, msg) => {
  switch (type) {
    case COMMENTARY.OVER_COMPLETED:
      log(
        chalk.blue(
          `Over is completed, Get ready for next over, Players swap there crease,`
        ) + chalk.green(`${activePlayerID}`) +
        chalk.blue(` will face the first ball of next over`)
      );
      break;
    case COMMENTARY.PLAYER_IS_OUT:
      updatePlayerScore(pastActivePlayerID, 0);
      if (!msg) {
        log(
          `${Math.floor(ballsPlayed / 6)}.${Math.floor(ballsPlayed % 6)}:` +
            chalk.red(`Player `) +
            chalk.red(`${pastActivePlayerID}`) +
            chalk.red(` Is Out `) +
            chalk.blue(`, No More Players Available`)
        );
      } else {
        log(
          `${Math.floor(ballsPlayed / 6)}.${Math.floor(ballsPlayed % 6)}:` +
            chalk.red(`Player `) +
            chalk.red(`${pastActivePlayerID}`) +
            chalk.red(` Is Out `) +
            chalk.blue(`, ${activePlayerID} will come on crease`)
        );
      }
      break;
    case COMMENTARY.PLAYER_SCORED_0_2_4_6:
      log(
        `${Math.floor(ballsPlayed / 6)}.${Math.floor(ballsPlayed % 6)}:` +
          `Player ` +
          chalk.green(`${activePlayerID}`) +
          ` scored ${msg.runScored} runs`
      );
      updatePlayerScore(activePlayerID, msg.runScored);
      break;
    case COMMENTARY.PLAYER_SCORED_1_3_5:
      log(
        `${Math.floor(ballsPlayed / 6)}.${Math.floor(ballsPlayed % 6)}:` +
          `Player ` +
          chalk.green(`${playerOnOppositeCrease}`) +
          ` scored ${msg.runScored} runs , Now ` +
          chalk.green(`${activePlayerID}`) +
          ` will face the next ball`
      );
      updatePlayerScore(playerOnOppositeCrease, msg.runScored);
      break;
    case COMMENTARY.SCORED_0:
      log(
        `${Math.floor(ballsPlayed / 6)}.${Math.floor(ballsPlayed % 6)}:` +
          `Player ` +
          chalk.green(`${activePlayerID}`) +
          ` scored 0 run`
      );
      updatePlayerScore(activePlayerID,0);
    default:
      break;
  }
};

// changes crease when
// 1) player score 1/3/5
// 2) or over is finished
const changeCrease = msg => {
  return new Promise((resolve, reject) => {
    let temp = activePlayerID;
    // PLAYER_STATUS[`${playerOnOppositeCrease}`].status = STATUS.ACTIVE;
    // PLAYER_STATUS[`${activePlayerID}`].status = STATUS.ON_OPPOSITE_CREASE;
    activePlayerID = playerOnOppositeCrease;
    playerOnOppositeCrease = temp;
    resolve(true);
  });
};

// updates individual player score, balls and total balls 
const updatePlayerScore = (playerId, runs) => {
  let initialRuns = PLAYER_STATUS[playerId]["runs"];
  let initialBallsPlayer =  PLAYER_STATUS[playerId]["balls"]; 
  PLAYER_STATUS[playerId]["runs"] = initialRuns + runs;
  PLAYER_STATUS[playerId]["balls"] = initialBallsPlayer + 1;
  totalRunsMade = totalRunsMade + runs;

};

// check if over is completed or not, returns a boolean value
const isOverCompleted = ballsPlayed => {
  if (ballsPlayed % 6 === 0) {
    return true;
  }
  return false;
};

// program to check run scored and perform individual task for every run scored
// 1) run scored is 7 -> player is out -> remove player -> active player -> commentary
// 2) run scored is 0,2,4,6 -> no action -> commentary
// 3) run scored is 1,3,5 -> changes crease -> commentary
const run = runScored => {
  if (runScored === 0) {
    commentary(COMMENTARY.SCORED_0);
  } else if (runScored === 7) {
    removePlayer().then(value => {
      if (playersAvailable >= 0) {
        addPlayer().then(value => {
          commentary(COMMENTARY.PLAYER_IS_OUT, true);
        });
      } else {
        commentary(COMMENTARY.PLAYER_IS_OUT, false);
      }
    });
  } else if (runScored === 1 || runScored === 3 || runScored === 5) {
    // log(chalk.magenta('ODD'));
    changeCrease("ODD RUN").then(value => {
      commentary(COMMENTARY.PLAYER_SCORED_1_3_5, {
        runScored: runScored
      });
    });
  } else if (runScored === 2 || runScored === 4 || runScored === 6) {
    // log(chalk.magenta('EVEN'));
    commentary(COMMENTARY.PLAYER_SCORED_0_2_4_6, {
      runScored: runScored
    });
  } else {
  }
};

// prints individual score of each player
const printIndividualScore = () => {
  let players = Object.keys(PLAYER_STATUS)
  players.map((player)=>{
    log(`${player} scored ${PLAYER_STATUS[player].runs} (${PLAYER_STATUS[player].balls} balls)`)
  })
}

// entery function
const start = async () => { 
  while (ballsPlayed <= maxBallsAvailable && playersAvailable >= 0 && maxRunsRequired>=totalRunsMade) {
    let randomNumber = await getRandomNumber(100);
    let runScored = await weightedRandomNoValues[`${activePlayerID}`][
      "score"
    ][randomNumber];
    // console.log('Ball is thrown', ballsPlayed, "#",runScored)

    await run(runScored);
    if ((await isOverCompleted(ballsPlayed)) && playersAvailable >= 0) {
      changeCrease("OVER").then(resolve => {
        commentary(COMMENTARY.OVER_COMPLETED);
      });
    }
    ballsPlayed = ballsPlayed + 1;
  }
  log(chalk.blue('Match Ended'));
  printIndividualScore();
  log(chalk.red(`Total Runs made by Bengaluru are: `,totalRunsMade))
  if(totalRunsMade>=maxRunsRequired){
    log(chalk.blue(`Bengaluru won by ${playersAvailable} wickets and ${maxBallsAvailable - ballsPlayed} balls remaining `))
  }else{
    log(`Bengaluru lost by ${maxRunsRequired - totalRunsMade} runs `)
    log(chalk.blue(`Result:Bengaluru Lost`))
  }
};

log(chalk.red("Let the game of cricket begins"));
generateWeightedRandomValues();
start();

