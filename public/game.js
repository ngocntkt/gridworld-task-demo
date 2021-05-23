var grid;
var cols;
var rows;
var w = 40;
var agentX = 0;
var agentY = 0;
var curX = 0;
var curY = 0;
const stepDisplay = document.querySelector('#step');
const blockDisplay = document.querySelector('#block');
const costDisplay = document.querySelector('#cost');
var mturkId = document.getElementById("mturkId").value;
var level = parseInt(document.querySelector("#level").value);
var selectedFile = parseInt(document.querySelector("#number").value);
console.log(mturkId);
console.log("Level " + level);
var numSteps = 0;
const maxSteps = 31;
var traces = [];
var episode = 1;
var session = document.getElementById("session").value;
const episodeDisplay = document.getElementById('episode');

var maxEpisode = 40;
var goal_values;
var maxValue = 0;
var realGoal = '';
var consumedGoal = '';
var cost = 0;
var score = 0;
var consumedValue = 0;
var gameName;
var isGameOver = false;
var block = 0;


window.onload = function () {
  document.getElementById("next-button").style.display = 'none';
  document.getElementById("finish-button").style.display = 'none';
}
function showButton(buttonId) {
  document.getElementById(buttonId).style.display = 'block';
}

function setup() {
  // var canvas = createCanvas(401, 401);
  var canvas = createCanvas(441, 441); //11x11 grid
  canvas.parent('sketch-holder');
  cols = floor(width / w);
  rows = floor(height / w);
  grid = make2DArray(cols, rows);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Cell(i, j, w);
    }
  }

  async function getState() {
    const response = await fetch('/state/' + level + '/' + selectedFile);
    const data = await response.json();
    return data;
  }
  (async () => {
    const state_data = await getState();
    generateGrid(state_data);
    gameName = state_data.game_name;
    document.getElementById('game_name').value = gameName;
    console.log(gameName);
    getEpisode();
  })()

  async function getEpisode() {
    if (mturkId=="/"){
      const response = await fetch('/episode/' + session);
      const data = await response.json();
      episode = data;
      episodeDisplay.textContent = 'Episode: ' + episode;

    }else{
      const response = await fetch('/episode/' + mturkId + '/' + gameName);
      const data = await response.json();
      episode = data.length + 1;
      console.log("Episode " + episode);
      episodeDisplay.textContent = 'Episode: ' + episode;

    } 
    document.getElementById("session").value = episode;
  }

  stepDisplay.textContent = "Steps: " + numSteps;
  costDisplay.textContent = "Cost: " + cost;
}

function generateGrid(state_data) {
  // Get goal value
  goal_values = state_data.goal_reward;
  maxValue = Math.max(...Object.values(goal_values));

  var blocks = state_data.wall_location;
  for (x of blocks) {
    i = x[0];
    j = x[1];
    grid[i][j].block = true;
  }

  var goals = state_data.goal_location;
  for (k in goals) {
    posX = goals[k][0];
    posY = goals[k][1];
    for (var i = 0; i < cols; i++) {
      for (var j = 0; j < rows; j++) {
        if (i == posX && j == posY) {
          grid[i][j].goal = k;
          grid[i][j].value = goal_values[k];
        }
      }
    }
    if (goal_values[k] == maxValue) {
      realGoal = k;
    }
  }
  // Get agent position
  var agent = state_data.agent_location;
  agentX = agent[0];
  agentY = agent[1];
  curX = agentX;
  curY = agentY;
  traces.push([agentX, agentY]);
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
  // fetch('/api', dataOptions);
  // Display the Next round or Finish button
  if (episode == maxEpisode) {
    showButton("finish-button");
  } else {
    showButton("next-button");
  }
}

function mousePressed() {
  if (!isGameOver) {
    var options = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (var i = 0; i < options.length; i++) {
      curX = agentX + options[i][0];
      curY = agentY + options[i][1];
      //Check the 4 borders (col0 and col9 in the 10x10grid; row0 and row1)
      if (agentX == 9 && i == 0 || agentX == 1 && i == 1) {
        curX = agentX;
        continue;
      }
      if (agentY == 9 && i == 2 || agentY == 1 && i == 3) {
        curY = agentY;
        continue;
      }
      if (grid[curX][curY].contains(mouseX, mouseY)) {
        grid[curX][curY].reveal();
        numSteps += 1;
        stepDisplay.textContent = "Steps: " + numSteps;

        if (consumedGoal != '') {
          break;
        } else if (grid[curX][curY].block) {
          grid[curX][curY].value = 0.06; 
          cost += grid[curX][curY].value * 100;
          block += 5;
          blockDisplay.textContent = "Obstacle: " + block;
        } else {
          agentX = curX;
          agentY = curY;
          traces.push([agentX, agentY]);
          grid[curX][curY].value = 0.01;
          cost += grid[curX][curY].value * 100;
        }
        if (numSteps == maxSteps) {
          for (k in goal_values) {
            if (grid[curX][curY].goal == k) {
              consumedGoal = k;
              consumedValue = goal_values[consumedGoal];
              document.getElementById('result').innerHTML = 'You get a target: ' + k.toUpperCase() + ' &#128513;';
              document.getElementById('goal').innerHTML = 'Value: ' + (consumedValue*100).toFixed(0);
              score = (consumedValue * 100 - cost) / 100;
              score = Number(score.toFixed(2));
              gameOver(curX, curY);
              break;
            }
          }
          if (consumedGoal == '') {
            document.getElementById('result').innerHTML = 'You reached a 31 step limit &#128542;';
            score = (0 - cost) / 100;
            gameOver(curX, curY);
          } 
        }else{
          for (k in goal_values) {
            if (grid[curX][curY].goal == k) {
              consumedGoal = k;
              consumedValue = Math.floor(goal_values[consumedGoal] * 100) / 100
              document.getElementById('result').innerHTML = 'You get a target: ' + k.toUpperCase() + ' &#128513;';
              document.getElementById('goal').innerHTML = 'Value: ' + (consumedValue*100).toFixed(0);
              score = (consumedValue * 100 - cost) / 100;
              score = Number(score.toFixed(2));
              gameOver(curX, curY);
              break;
            }
          }
        }
        costDisplay.textContent = "Cost: " + cost;
        document.getElementById('score').innerHTML = 'Score: ' + (score*100).toFixed(0);
      }
    }
  }
}

function draw() {
  background(255);
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      // create 4 side borders
      if (i == 0 || i == cols - 1) {
        grid[i][j].border = true;
      } else {
        grid[i][0].border = true;
        grid[i][rows - 1].border = true;
      }
      grid[0][j].addText(j);
      grid[i][0].addText(i);

      // control the mouse click
      if (i == agentX && j == agentY) {
        grid[i][j].agent = true;
        grid[i][j].addAgent();
        if (i == 1 && j == 1) {
          if (grid[i + 1][j].contains(mouseX, mouseY) || grid[i][j + 1].contains(mouseX, mouseY)) {
            cursor(HAND);
          } else {
            cursor(ARROW);
          }
        }
        if (i == 1 && j == rows - 2) {
          if (grid[i + 1][j].contains(mouseX, mouseY) || grid[i][j - 1].contains(mouseX, mouseY)) {
            cursor(HAND);
          } else {
            cursor(ARROW);
          }
        }
        if (i == cols - 2 && j == rows - 2) {
          if (grid[i - 1][j].contains(mouseX, mouseY) || grid[i][j - 1].contains(mouseX, mouseY)) {
            cursor(HAND);
          } else {
            cursor(ARROW);
          }
        }
        if (i == cols - 2 && j == 1) {
          if (grid[i - 1][j].contains(mouseX, mouseY) || grid[i][j + 1].contains(mouseX, mouseY)) {
            cursor(HAND);
          } else {
            cursor(ARROW);
          }
        }
        if (i > 1 & i < cols - 2) {
          if (j == rows - 2) {
            if (grid[i - 1][j].contains(mouseX, mouseY) || grid[i + 1][j].contains(mouseX, mouseY) ||
              grid[i][j - 1].contains(mouseX, mouseY)) {
              cursor(HAND);
            } else {
              cursor(ARROW);
            }
          }
          else if (j == 1) {
            if (grid[i - 1][j].contains(mouseX, mouseY) || grid[i + 1][j].contains(mouseX, mouseY) ||
              grid[i][j + 1].contains(mouseX, mouseY)) {
              cursor(HAND);
            } else {
              cursor(ARROW);
            }
          }
        }
        if (j > 1 & j < rows - 2) {
          if (i == 1) {
            if (grid[i + 1][j].contains(mouseX, mouseY) || grid[i][j + 1].contains(mouseX, mouseY) ||
              grid[i][j - 1].contains(mouseX, mouseY)) {
              cursor(HAND);
            } else {
              cursor(ARROW);
            }
          }
          if (i == cols - 2) {
            if (grid[i - 1][j].contains(mouseX, mouseY) || grid[i][j + 1].contains(mouseX, mouseY) ||
              grid[i][j - 1].contains(mouseX, mouseY)) {
              cursor(HAND);
            } else {
              cursor(ARROW);
            }
          }
        }
        if (i > 1 && i < cols - 2 && j > 1 && j < rows - 2) {
          if (grid[i + 1][j].contains(mouseX, mouseY) || grid[i - 1][j].contains(mouseX, mouseY) ||
            grid[i][j + 1].contains(mouseX, mouseY) || grid[i][j - 1].contains(mouseX, mouseY)) {
            cursor(HAND);
          } else {
            cursor(ARROW);
          }
        }
      }
      grid[i][j].show();
    }
  }
}

function keyPressed() {
  if (!isGameOver) {
    if (keyCode === UP_ARROW) {
      curX = agentX;
      if(agentY == 1){
        curY = agentY;
        // cost -= 1;
      }else{
        curY = agentY - 1;
        numSteps += 1;
      }
    } else if (keyCode === DOWN_ARROW) {
      curX = agentX;
      if(agentY==9){
        curY = agentY;
        // cost -= 1;
      }else{
        curY = agentY + 1;
        numSteps += 1;
      }
    }
    if (keyCode === LEFT_ARROW) {
      if(agentX == 1){
        curX = agentX;
        // cost -= 1;
      }else{
        curX = agentX - 1;
        numSteps += 1;
      }
      curY = agentY;
    } else if (keyCode === RIGHT_ARROW) {
      if(agentX == 9){
        curX = agentX;
        // cost -= 1;
      }else{
        curX = agentX + 1;
        numSteps += 1;
      }
      curY = agentY;
    }
  }
}

function keyReleased() {
  if (!isGameOver) {
    grid[curX][curY].reveal();
  
    if (grid[curX][curY].block) {
      grid[curX][curY].value = 0.06; 
      cost += grid[curX][curY].value * 100;
      block+=5;
      blockDisplay.textContent = "Obstacle: " + block;
    } 
    else {
      if(agentX!=curX || agentY!=curY){
        agentX = curX;
        agentY = curY;
        grid[agentX][agentY].agent = true;
        grid[agentX][agentY].addAgent();
        traces.push([agentX, agentY]);
        grid[curX][curY].value = 0.01;
        cost += grid[curX][curY].value * 100;
      }
    }
  
    if (numSteps == maxSteps) {
      for (k in goal_values) {
        if (grid[curX][curY].goal == k) {
          consumedGoal = k;
          consumedValue = goal_values[consumedGoal];
          document.getElementById('result').innerHTML = 'You get a target: ' + k.toUpperCase() + ' &#128513;';
          document.getElementById('goal').innerHTML = 'Value: ' + (consumedValue*100).toFixed(0);
          score = (consumedValue * 100 - cost) / 100;
          score = Number(score.toFixed(2));
          gameOver(curX, curY);
          break;
        }
      }
      if (consumedGoal == '') {
        document.getElementById('result').innerHTML = 'You reached a 31 step limit &#128542;';
        score = (0 - cost) / 100;
        gameOver(curX, curY);
      }
    }
    else{
      for (k in goal_values) {
        if (grid[curX][curY].goal == k) {
          consumedGoal = k;
          consumedValue = Math.floor(goal_values[consumedGoal] * 100) / 100
          console.log(consumedGoal);
          document.getElementById('result').innerHTML = 'You get a target: ' + k.toUpperCase() + ' &#128513;';
          document.getElementById('goal').innerHTML = 'Value: ' + (consumedValue*100).toFixed(0);
          score = (consumedValue * 100 - cost) / 100;
          score = Number(score.toFixed(2));
          gameOver(curX, curY);
          break;
        }
      }
    }
    stepDisplay.textContent = "Steps: " + numSteps;
    costDisplay.textContent = "Cost: " + cost;
    document.getElementById('score').innerHTML = 'Score: ' + (score*100).toFixed(0);
  } 
}

function make2DArray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;
}