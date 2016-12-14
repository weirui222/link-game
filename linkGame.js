var row = 8;
var column = 16;
//row = document.getElementById("rows").value;
//column = document.getElementById("columns").value;
var types = 18;
var X = row + 2;
var Y = column +2;
var total = X * Y;
var remaining = row * column;

//imags
var imgs = new Array(types);

//table
var table = document.getElementById("table");

var theBoard = new Array(total);;

var lastPosition = -1;
var lastPair = [];
var lastPath = [];
var showingLines = false;

var init = function() {
  //row = document.getElementById("rows").value;
  //column = document.getElementById("columns").value;
  //theBoard = new Array(total);
  for (var i = 0; i < imgs.length; i++) {
    imgs[i]="r_"+(i+1)+".png";
  }

  for (var i = 0; i < X; i++) {
    //The value of -1 results in a new row being inserted at the last position.
    var tr = table.insertRow(-1);
    for (var j = 0; j < Y; j++) {
      var td = tr.insertCell(-1);
    }
  }

  initBoard(theBoard);

  var cells = document.getElementsByTagName('td');
  // console.log(cells);
  for (var i = 0; i < cells.length; i++) {
    // console.log("add click cell " + cells[i].id);
    cells[i].addEventListener('click', onCellClick);
  }

  document.getElementById("reset").addEventListener("click", function(){
    initBoard(theBoard);
  });
}

var isFrame = function(index){
  var pos = indexToPosition(index);
  return  pos.x === 0 || pos.x === X-1 || pos.y === 0 || pos.y === Y-1;
}

var tableCell = function(index){
  var pos = indexToPosition(index);
  return table.rows[pos.x].cells[pos.y];
}

//create initial board
var initBoard = function(board){
  if (showingLines) {
    return;
  }

  if (lastPosition !== -1) {
    tableCell(lastPosition).className = "";
  }

  lastPosition = -1;

  remaining = row * column;
  $("#win").text("");

  for(var i = 0; i < total; i++){
    theBoard[i] = 0;
    var cell = tableCell(i);
    cell.id = "i_" + i;
    //console.log(cell.id);
    cell.innerHTML = "";
  }

  for(var i = 0; i < board.length; i++) {
    if(board[i] === 0 && !isFrame(i)) {
      var t = Math.floor(Math.random()* types) + 1;
      board[i] = t;
      var cell = tableCell(i);
      cell.style.backgroundImage = "url('img/r_" + t + ".png')";
      while(true) {
        var c = Math.floor(Math.random() * (total-i)) + i;
        if(board[c]=== 0 && !isFrame(c)){
          board[c] = t;
          var cell = tableCell(c);
          cell.style.backgroundImage = "url('img/r_" + t + ".png')";
          break;
         }
      }
    }
  }
  reshuffleIfNeeded(board);
}

//check whether a pair of link exist
var linkExist = function(board) {
  for (var i = 0; i < board.length - 1 ; i++) {
    if(board[i] !== 0){
      for (var j = i+1; j < board.length; j++) {
        if(board[j] === board[i] && findPath(board, i, j) !== null) {
          console.log("p1",i,board[i],"p2",j,board[j]);
          return true;
        }
      }
    }
  }
  return false;
}

var shuffle = function(arr) {
  var t;
  var value;
  for (var i = arr.length - 1; i >= 0; i--) {
    t = Math.floor(Math.random()* (i + 1));
    value = arr[t];
    arr[t] = arr[i];
    arr[i] = value;
  }
}

//
var reshuffleBoard = function(board) {
  var arr = [];
  for (var i = 0; i < board.length; i++) {
    if (board[i] !== 0) {
      arr.push(board[i]);
    }
  }
  console.log(arr);
  shuffle(arr);
  console.log(arr);
  var k=0;
  for (var i = 0; i < board.length; i++) {
    if(board[i] !== 0){
      board[i] = arr[k++];
      var cell = tableCell(i);
      //cell.innerHTML = board[i];
      cell.style.backgroundImage = "url('img/r_" + board[i] + ".png')";
    }
  }
}


//find out whether there is a pair
var reshuffleIfNeeded = function(board){
  if(remaining !== 0){
    while(!linkExist(board)){
      reshuffleBoard(board);
      break;
    }
  }else{
    //win
    $("#win").text("You won");
  }
}

var indexToPosition = function(index){
  return {x: Math.floor(index/Y), y:index%Y};
}

var positionToIndex = function(pos){
  return pos.x * Y + pos.y;
}

var possibleNeighbors = function(index, board, visited, targetIndex){
  var pos = indexToPosition(index);
  // directions in order: up, right, down, left
  var deltas = [{x: -1, y: 0}, {x: 0, y: 1}, {x: 1, y: 0}, {x: 0, y: -1}];
  var directions = ['up', 'right', 'down', 'left'];
  var neighbors = [];

  for (var i = 0; i < deltas.length; i++) {
    var neighborPos = {x: pos.x + deltas[i].x, y: pos.y + deltas[i].y};
    if (neighborPos.x >= 0 && neighborPos.x < X && neighborPos.y >= 0 && neighborPos.y < Y) {
      var neighbor = positionToIndex(neighborPos);
      if (board[neighbor] !== 0 && neighbor !== targetIndex) {
        continue;
      }

      var direction = directions[i];
      var rightTurnDirection = directions[(i + 1) % 4];
      var leftTurnDirection = directions[(i + 3) % 4];

      var minTurnCount = Math.min(visited[index][direction],
        visited[index][rightTurnDirection] + 1,
        visited[index][leftTurnDirection] + 1);

      if (minTurnCount <= 2 && minTurnCount < visited[neighbor][direction]) {
        visited[neighbor][direction] = minTurnCount;
        neighbors.push(neighbor);
      }
    }
  }
  return neighbors;
}

var getPath = function(visited, index1, index2) {
  // path: left-right, up-down, up-left, up-right, down-left, down-right
  var path = new Array(visited.length);
  for (var i = 0; i < path.length; i++) {
    path[i] = '';
  }

  // reverse deltas
  var reverseDeltas = [{x: 1, y: 0}, {x: 0, y: -1}, {x: -1, y: 0}, {x: 0, y: 1}];
  var directions = ['up', 'right', 'down', 'left'];

  var current = index2;
  var turnCount = Math.min(visited[index2].up,
     visited[index2].down, visited[index2].left, visited[index2].right);
  var direction;

  if (turnCount === visited[index2].up) {
    direction = 'up';
  } else if (turnCount === visited[index2].down) {
    direction = 'down';
  } else if (turnCount === visited[index2].left) {
    direction = 'left';
  } else {
    direction = 'right';
  }

  while (current !== index1) {
    var directionIndex = directions.indexOf(direction);
    var reverseDelta = reverseDeltas[directionIndex];
    var pos = indexToPosition(current);
    var newPos = {
      x: pos.x + reverseDelta.x,
      y: pos.y + reverseDelta.y
    };

    var previous = positionToIndex(newPos);

    var rightTurnDirection = directions[(directionIndex + 1) % 4];
    var leftTurnDirection = directions[(directionIndex + 3) % 4];

    if (visited[previous][direction] === turnCount) {
      // do nothing, no change to direction or turnCount
      path[previous] = direction;
    } else if (visited[previous][rightTurnDirection] === turnCount - 1) {
      path[previous] = rightTurnDirection + direction;
      direction = rightTurnDirection;
      turnCount--;
    } else if (visited[previous][leftTurnDirection] === turnCount - 1) {
      path[previous] = leftTurnDirection + direction;
      direction = leftTurnDirection;
      turnCount--;
    }

    // don't want to show direction in start / end points
    path[index1] = '';
    current = previous;
  }

  return path;
}

//find path
var findPath = function(board, index1, index2) {
  var visited = new Array(board.length);
  for (var i = 0; i < visited.length; i++) {
    visited[i] = {up: 100, down: 100, left: 100, right: 100};
  }

  var queue = [];
  queue.push(index1);
  visited[index1] = {up: 0, down: 0, left: 0, right: 0};
  while (queue.length > 0) {
    var curIndex = queue.shift();
    if (curIndex === index2) {
      return getPath(visited, index1, index2);
    }
    var neighbors = possibleNeighbors(curIndex, board, visited, index2);
    for (var i = 0; i < neighbors.length; i++) {
      queue.push(neighbors[i]);
    }
  }
  return null;
}

var hideLines = function() {
  for (var i = 0; i < lastPath.length; i++) {
    if (lastPath[i] !== '') {
      //tableCell(i).innerHTML = "";
      tableCell(i).style.backgroundImage = "";
    }
  }

  var cell1 = tableCell(lastPair[0]);
  //cell1.innerHTML = "";
  cell1.style.backgroundImage = "";
  cell1.className = "";
  var cell2 = tableCell(lastPair[1]);
  //cell2.innerHTML = "";
  cell2.style.backgroundImage = "";
  cell2.className = "";
  showingLines = false;
}

//Click handler get position from this
var onCellClick = function() {
  if (showingLines) {
    return;
  }

  console.log("click cell " + this.id);
  var pId = this.id.split('_');
  //console.log(arrId[1]);
  var curPosition = parseInt(pId[1]);

  //console.log("initial",clickP1);
  if (theBoard[curPosition] === 0) {
    return;
  } else if (lastPosition === -1) {
    lastPosition = curPosition;
    tableCell(curPosition).className = "highlight";
  } else if (lastPosition === curPosition) {
    return;
  } else if (theBoard[lastPosition] === theBoard[curPosition]) {
    var path = findPath(theBoard, lastPosition, curPosition);
    if (path === null) {
      return;
    }

    tableCell(curPosition).className = "highlight";
    lastPath = path;
    lastPair = [lastPosition, curPosition];
    console.log("find path", path);

    for (var i = 0; i < path.length; i++) {
      if (path[i] !== '') {
        tableCell(i).style.backgroundImage = "url('img/" + path[i] + ".png')";
      }
    }

    showingLines = true;
    setTimeout(hideLines, 1000);

    theBoard[lastPosition] = 0;
    theBoard[curPosition] = 0;
    lastPosition = -1;
    remaining -= 2;
    //console.log(theBoard);
    //check whether a pair of link exist
    reshuffleIfNeeded(theBoard);
    //console.log(linkExist(theBoard));
  } else {
    //console.log("content",content,"clickArr[0].content",clickArr[0].content);
    tableCell(lastPosition).className = "";
    lastPosition = -1;
    //console.log(" X find path/ dif content");
  }
}
/*
document.getElementById("form").addEventListener("submit", function(evt) {
  evt.preventDefault();
  console.log("set submit button clicked");
  init();
  });

document.getElementById("clear").addEventListener("click", function() {
    console.log("set clear button clicked");
    document.getElementById("rows").innerHTML='';
    document.getElementById("columns").innerHTML='';
  });

  */

init();

// Link if 2 selections are same num
