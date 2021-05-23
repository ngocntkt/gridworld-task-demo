var grid;
var cols;
var rows;
var w = 12;
var agentX;
var agentY;
var curX, curY;
const stepDisplay = document.querySelector('#step');
const blockDisplay = document.querySelector('#block');
// const costDisplay = document.querySelector('#cost');
var mturkId = document.getElementById("mturkId").value;
var level = parseInt(document.querySelector("#level").value);
var selectedFile = parseInt(document.querySelector("#number").value);
// var mturkId = document.querySelector("#mturkId").value;
console.log(mturkId);
console.log("Level " + level);
var numSteps = 0;
const maxSteps = 300;
var traces = [];
var episode = 1;
const episodeDisplay = document.getElementById('episode');
// //maxEpisode = 40
var maxEpisode = 5;
var goal_values;
var maxValue = 0;
var realGoal = '';
var consumedGoal = '';
var cost = 0;
var score = 0;
var block = 0;
var consumedValue = 0;
var gameName;
var isGameOver = false;

var chkMap = document.querySelector('#map');
var chkFull = document.querySelector('#full_falcon');
var countPress = 0;
var rescue = 0;
const timeDisplay = document.querySelector('#playtime');
var totalMinutes = 60 * 10; //10 minutes
// var totalMinutes = 5;
var display = document.querySelector('#time');


window.onload = function () {
  document.getElementById("next-button").style.display = 'none';
  document.getElementById("finish-button").style.display = 'none';
  document.getElementById("block-map").style.display = 'none';
}
function showButton(buttonId) {
  document.getElementById(buttonId).style.display = 'block';
}

function showMap(chkMap) {
  if (chkMap.checked) {
    ISMAP = true;
  } else {
    DEBUG = false;
    ISMAP = false;
  }
}
function showFullView(chkFull) {
  if (chkFull.checked) {
    DEBUG = true;
    document.getElementById("block-map").style.display = 'none';
  } else {
    DEBUG = false;
    document.getElementById("block-map").style.display = 'inline';
    showMap(chkMap);
  }
}
function setup() {
  showFullView(chkFull);
  // showMap(chkMap);

  startTimer(totalMinutes, display);

  // x:0-92; z:0:49
  var width = 93 * w + 1;
  var height = 50 * w + 1;
  var canvas = createCanvas(1117, 601); //
  canvas.parent('sketch-holder');
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }

  async function getMap() {
    const response = await fetch('/map/');
    const data = await response.json();
    return data;
  }
  (async () => {
    const state_data = await getMap();
    generateGrid(state_data);
    // console.log(gameName);
    // getEpisode();
  })()

  // async function getEpisode() {
  //   const response = await fetch('/episode/' + mturkId + '/' + gameName);
  //   const data = await response.json();
  //   episode = data.length + 1;
  //   console.log("Episode " + episode);
  //   episodeDisplay.textContent = 'Episode: ' + episode;
  // }

  stepDisplay.textContent = "Steps: " + numSteps;
  // costDisplay.textContent = "Cost: " + cost;
}

function generateGrid(data) {
  // console.log(data.length);
  // console.log(data[0]);
  // console.log(data[0].key);
  for (var k = 0; k < data.length; k++) {
    var type = data[k].key;
    var posX = Number(data[k].x);
    var posY = Number(data[k].z);
    grid[posX][posY].goal = type;
  }
  // Get agent position
  agentX = 5;
  agentY = 4;
  // curX = agentX;
  // curY = agentY; 
}

function gameOver(goalX, goalY) {
  isGameOver = true;
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      if (grid[i][j] != grid[goalX][goalY]) {
        grid[i][j].over = true;
      }
    }
  }

  var trajectory = '';
  for (x of traces) {
    trajectory += '[' + x.toString() + '];';
  }
  trajectory = trajectory.substring(0, trajectory.length - 1);
  // Send data to the server
  maxValue = Math.floor(maxValue * 100) / 100
  const data = {
    mturkId, gameName, episode, realGoal, consumedGoal, numSteps, maxValue,
    consumedValue, cost: cost * 1.0 / 100, score, trajectory
  };
  const dataOptions = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  };
  fetch('/api', dataOptions);
  // Display the Next round or Finish button
  if (episode == maxEpisode) {
    showButton("finish-button");
  } else {
    showButton("next-button");
  }
}
function draw() {
  background(255); 
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      if (i == agentX && j == agentY) {
        grid[i][j].agent = true;
        grid[i][j].addAgent();
      }
      grid[i][j].show();
    }
  }
  if (!isGameOver) {
    if (keyIsDown(UP_ARROW) && keyIsDown(88)) {
      countPress = 0; //not Enter pressed, so count is set to 0
      curX = agentX;
      // curY = agentY - 1;
      if(agentY == 1){
        curY = agentY;
        // numSteps -= 1;
      }else{
        // numSteps += 1;
        curY = agentY - 1;
      }
      checkBoundary(curX, curY);
    } else if (keyIsDown(DOWN_ARROW) && keyIsDown(88)) {
      countPress = 0;
      curX = agentX;
      // curY = agentY + 1;
      if(agentY==49){
        curY = agentY;
        // numSteps -= 1;
      }else{
        // numSteps += 1;
        curY = agentY + 1;
      }
      checkBoundary(curX, curY);
    }
    else if (keyIsDown(LEFT_ARROW) && keyIsDown(88)) {
      countPress = 0;
      curY = agentY;
      // curX = agentX - 1;
      if(agentX == 0){
        curX = agentX;
        // numSteps -= 1;
      }else{
        curX = agentX - 1;
        // numSteps += 1;
      }
      checkBoundary(curX, curY);
    } else if (keyIsDown(RIGHT_ARROW) && keyIsDown(88)) {
      countPress = 0;
      curY = agentY;
      // curX = agentX + 1;
      if(agentX == 92){
        curX = agentX;
        // numSteps -= 1;
      }else{
        curX = agentX + 1;
        // numSteps += 1;
      }
      // console.log(curX,curY);
      checkBoundary(curX, curY);
    }
  }
  // console.log("Here :", curX, curY);
  // checkBoundary(curX, curY);
  // stepDisplay.textContent = "Steps: " + numSteps;
}

function keyReleased(){
  console.log("Here :", curX, curY);
  checkBoundary(curX, curY);
  stepDisplay.textContent = "Steps: " + numSteps;
}

function checkBoundary(paraX, paraY){
  // console.log(paraX, paraY);
  grid[paraX][paraY].reveal();
    if (grid[paraX][paraY].goal == 'walls') {
      // numSteps -= 1;
      console.log("Block");
      paraX = agentX;
      paraY = agentY;
      block += 1;
      blockDisplay.textContent = "Block: " + block;
    }
    else if (grid[paraX][paraY].goal == 'doors') {
      // numSteps -= 1; //not counting step
      paraX = agentX;
      paraY = agentY;
      blockDisplay.textContent = "Door";
    }
    else if (grid[paraX][paraY].goal == 'yellow victims') {
      // numSteps -= 1;
      paraX = agentX;
      paraY = agentY;
      blockDisplay.textContent = "Yellow victim";
    }
    else if (grid[paraX][paraY].goal == 'green victims') {
      paraX = agentX;
      paraY = agentY;
      // numSteps -= 1;
      blockDisplay.textContent = "Green victim";
    }
    else if (grid[paraX][paraY].goal == 'stairs') {
        paraX = agentX;
        paraY = agentY;
      // numSteps -= 1;
      blockDisplay.textContent = "Stair";
    }
    else {
      if(agentX!=paraX || agentY!=paraY){
        agentX = paraX;
        agentY = paraY;
        numSteps += 1;
      }
    }
}
// function keyPressed() {
//   if (keyCode === ENTER) {
//     countPress += 1;
//     console.log(countPress);
//     var options = [[1, 0], [-1, 0], [0, 1], [0, -1]];
//     for (var i = 0; i < options.length; i++) {
//       var tmpX = agentX + options[i][0];
//       var tmpY = agentY + options[i][1];
//       if (grid[tmpX][tmpY].goal == 'doors') {
//         curX = tmpX;
//         curY = tmpY;
//         grid[curX][curY].goal = "";
//         break;
//       }
//       else if (grid[tmpX][tmpY].goal == 'green victims') {
//         if (countPress == 5) {
//           curX = tmpX;
//           curY = tmpY;
//           grid[curX][curY].goal = "";
//           countPress = 0;
//           rescue += 10;
//           document.getElementById('goal').innerHTML = 'Point: ' + rescue.toString();
//           break;
//         }
//       }
//       else if (grid[tmpX][tmpY].goal == 'yellow victims') {
//         if (countPress == 10) {
//           curX = tmpX;
//           curY = tmpY;
//           grid[curX][curY].goal = "";
//           countPress = 0;
//           rescue += 30;
//           document.getElementById('goal').innerHTML = 'Point: ' + rescue.toString();
//           break;
//         }
//       }
//     }//end for
//   }//end keycode enter
// }

function keyPressed() {
  if (!isGameOver) {
    if (keyCode === UP_ARROW) {
      countPress = 0; //not Enter pressed, so count is set to 0
      curX = agentX;
      // curY = agentY - 1;
      if(agentY == 1){
        curY = agentY;
        // numSteps -= 1;
      }else{
        // numSteps += 1;
        curY = agentY - 1;
      }
    } else if (keyCode === DOWN_ARROW) {
      countPress = 0;
      curX = agentX;
      // curY = agentY + 1;
      if(agentY==49){
        curY = agentY;
        // numSteps -= 1;
      }else{
        // numSteps += 1;
        curY = agentY + 1;
      }
    }
    if (keyCode === LEFT_ARROW) {
      countPress = 0;
      // curX = agentX - 1;
      curY = agentY;
      if(agentX == 0){
        curX = agentX;
        // numSteps -= 1;
      }else{
        curX = agentX - 1;
        // numSteps += 1;
      }
    } else if (keyCode === RIGHT_ARROW) {
      countPress = 0;
      // curX = agentX + 1;
      curY = agentY;
      if(agentX == 92){
        curX = agentX;
        // numSteps -= 1;
      }else{
        curX = agentX + 1;
        // numSteps += 1;
      }
    }
    if (keyCode === ENTER) {
      countPress += 1;
      console.log(countPress);
      var options = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (var i = 0; i < options.length; i++) {
        var tmpX = agentX + options[i][0];
        var tmpY = agentY + options[i][1];
        if (grid[tmpX][tmpY].goal == 'doors') {
          curX = tmpX;
          curY = tmpY;
          grid[curX][curY].goal = "";
          break;
        }
        else if (grid[tmpX][tmpY].goal == 'green victims') {
          if (countPress == 5) {
            curX = tmpX;
            curY = tmpY;
            grid[curX][curY].goal = "";
            countPress = 0;
            rescue += 10;
            document.getElementById('goal').innerHTML = 'Point: ' + rescue.toString();
            break;
          }
        }
        else if (grid[tmpX][tmpY].goal == 'yellow victims') {
          if (countPress == 10) {
            curX = tmpX;
            curY = tmpY;
            grid[curX][curY].goal = "";
            countPress = 0;
            rescue += 30;
            document.getElementById('goal').innerHTML = 'Point: ' + rescue.toString();
            break;
          }
        }
      }//end for
    }//end keycode enter
    // checkBoundary(curX, curY);
    // grid[curX][curY].reveal();
    // if (grid[curX][curY].goal == 'walls') {
    //   console.log("Block");
    //   grid[agentX][curY].value = 0.06;
    //   console.log(grid[curX][curY].value);
    //   block += 1;
    //   // blockDisplay.textContent = "Block";
    //   blockDisplay.textContent = "Block: " + block;
    // }
    // else if (grid[curX][curY].goal == 'doors') {
    //   // numSteps -= 1; //not counting step
    //   blockDisplay.textContent = "Door";
    // }
    // else if (grid[curX][curY].goal == 'yellow victims') {
    //   // numSteps -= 1;
    //   blockDisplay.textContent = "Yellow victim";
    // }
    // else if (grid[curX][curY].goal == 'green victims') {
    //   // numSteps -= 1;
    //   blockDisplay.textContent = "Green victim";
    // }
    // else if (grid[curX][curY].goal == 'stairs') {
    //   // numSteps -= 1;
    //   blockDisplay.textContent = "Stair";
    // }
    // else {
    //   agentX = curX;
    //   agentY = curY;
    //   grid[agentX][agentY].agent = true;
    //   grid[agentX][agentY].addAgent();
    // }

    stepDisplay.textContent = "Steps: " + numSteps;
  }//end game over
}

function make2DArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}

function startTimer(duration, display) {
  var start = Date.now(),
    diff,
    minutes,
    seconds;
    var t;
  function timer() {
    // get the number of seconds that have elapsed since 
    // startTimer() was called
    diff = duration - (((Date.now() - start) / 1000) | 0);

    // does the same job as parseInt truncates the float
    if(diff>=0){
      minutes = (diff / 60) | 0;
      seconds = (diff % 60) | 0;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;
      display.textContent = minutes + ":" + seconds;
    }
    // if (diff <= 0) {
    //     // add one second so that the count down starts at the full duration
    //     // example 05:00 not 04:59
    //     // start = Date.now() + 1000;
    // }

    if (minutes == 0 && seconds == 0) {
      console.log("Game over");
      isGameOver = true;
      timeDisplay.textContent = "GAME OVER !";
      clearInterval(t);
      
    }
  };
  timer();
  t = setInterval(timer, 1000);
}