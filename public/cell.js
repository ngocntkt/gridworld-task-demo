const DEBUG = false;
// const DEBUG = true;
function Cell(i, j, w) {
  this.i = i;
  this.j = j;
  this.x = i * w;
  this.y = j * w;
  this.w = w;

  this.revealed = false;
  this.over = false;

  this.block = false;
  this.border = false;
  this.agent = false;
  this.goal = '';
  this.value = 0;
}

Cell.prototype.show = function () {
  stroke(0);
  noFill();
  rect(this.x, this.y, this.w, this.w);
  if (this.revealed) {
    fill(127);
    // Add blocks
    if (this.block) {
      fill(0);
      rect(this.x, this.y, this.w, this.w);
    }

    // if (this.agent){
    //   fill(204, 102, 0);
    //   ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
    // }

    if (this.goal == 'orange') {
      fill(255, 165, 0);//orange
      rect(this.x, this.y, this.w, this.w);
    }
    else if (this.goal == 'blue') {
      fill(0, 0, 255);
      rect(this.x, this.y, this.w, this.w);
    }
    else if (this.goal == 'green') {
      fill(0, 128, 0);
      rect(this.x, this.y, this.w, this.w);
    } else if (this.goal == 'purple') {
      fill(128, 0, 128);
      rect(this.x, this.y, this.w, this.w);
    }
  }//end revealed
  if (this.over) {
    fill(127);
    rect(this.x, this.y, this.w, this.w);
  }
  // Add borders
  if (this.border) {
    fill(204, 102, 0);
    rect(this.x, this.y, this.w, this.w);
  }
  if (DEBUG) {
    // Add blocks
    if (this.block) {
      fill(0);
      rect(this.x, this.y, this.w, this.w);
    }
    if (this.goal == 'orange') {
      fill(255, 165, 0);//orange
      rect(this.x, this.y, this.w, this.w);
    }
    else if (this.goal == 'blue') {
      fill(0, 0, 255);
      rect(this.x, this.y, this.w, this.w);
    }
    else if (this.goal == 'green') {
      fill(0, 128, 0);
      rect(this.x, this.y, this.w, this.w);
    } else if (this.goal == 'purple') {
      fill(128, 0, 128);
      rect(this.x, this.y, this.w, this.w);
    }
  }

}

Cell.prototype.addAgent = function () {
  this.agent = true;
  // fill(204, 102, 0);
  fill(0);
  ellipse(this.x + this.w * 0.5, this.y + this.w * 0.5, this.w * 0.5);
}

Cell.prototype.addText = function (val){
  // Add borders
  // if(this.border){
  //   fill(204, 102, 0);
  //   // fill(200);
  //   rect(this.x, this.y, this.w, this.w);
  // }
  textAlign(CENTER);
  // fill(255);
  fill(0);
  text(val, this.x + this.w * 0.5, this.y + this.w - 15);
}

Cell.prototype.contains = function (x, y) {
  return (x > this.x && x < this.x + this.w && y > this.y && y < this.y + this.w);
}

Cell.prototype.reveal = function () {
  this.revealed = true;
}

Cell.prototype.showImage = function (src, width, height, alt) {
  var img = document.createElement("img");
  img.src = src;
  img.width = width;
  img.height = height;
  img.alt = alt;
  // This next line will just add it to the <body> tag
  document.body.appendChild(img);
}