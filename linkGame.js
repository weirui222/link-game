var row = 5;
var column = 8;
var types = 18;
var X;
var Y;
var total;
var remaining;
var time;
var interval = null;
var table = document.getElementById('table');
var TIME = 10;
var theBoard;

var lastPosition = -1;
var lastPair = [];
var lastPath = [];
var showingLines = false;
var gameEnd;
// Start a timer that counts down


var tick = function() {
  time -= 1; // actual time
  var elem = document.getElementById("myBar");
  var width = 100*time/TIME;

  //document.getElementById('status').textContent = time;  // display
  elem.style.width = width + '%';
  console.log(elem.style.width);
  // Check if I ran out of time
  if (time <= 0) {
    document.getElementById('modal-body-gameover').innerHTML = '<img src="img/loss.png">';
    $('#gameOverModal').modal('show');
    clearInterval(interval);
    interval = null;
    gameEnd = true;
  }
};

var indexToPosition = function(index) {
  return { x: Math.floor(index / Y), y: index % Y };
};

var positionToIndex = function(pos) {
  return pos.x * Y + pos.y;
};

var isBlank = function(index) {
  var pos = indexToPosition(index);
  if ((pos.x * 2 + 1) === X && (pos.y * 2 + 1) === Y) {
    return true;
  }

  var x = (pos.x * 2 > X) ? (X - pos.x - 1) : pos.x;
  var y = (pos.y * 2 > Y) ? (Y - pos.y - 1) : pos.y;

  if (x % 2 === 0) {
    return !(y < x && y % 2 === 1);
  } else {
    return y < x && y % 2 === 0;
  }
};

var tableCell = function(index) {
  var pos = indexToPosition(index);
  return table.rows[pos.x].cells[pos.y];
};

var possibleNeighbors = function(index, board, visited, targetIndex) {
  var pos = indexToPosition(index);
  // directions in order: up, right, down, left
  var deltas = [{ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }, { x: 0, y: -1 }];
  var directions = ['up', 'right', 'down', 'left'];
  var neighbors = [];

  for (var i = 0; i < deltas.length; i++) {
    var neighborPos = { x: pos.x + deltas[i].x, y: pos.y + deltas[i].y };
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
};

var getPath = function(visited, index1, index2) {
  // path: left-right, up-down, up-left, up-right, down-left, down-right
  var path = new Array(visited.length);
  for (var i = 0; i < path.length; i++) {
    path[i] = '';
  }

  // reverse deltas
  var reverseDeltas = [{ x: 1, y: 0 }, { x: 0, y: -1 }, { x: -1, y: 0 }, { x: 0, y: 1 }];
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
};

// find path
var findPath = function(board, index1, index2) {
  var visited = new Array(board.length);
  var i;
  for (i = 0; i < visited.length; i++) {
    visited[i] = { up: 100, down: 100, left: 100, right: 100 };
  }

  var queue = [];
  queue.push(index1);
  visited[index1] = { up: 0, down: 0, left: 0, right: 0 };
  while (queue.length > 0) {
    var curIndex = queue.shift();
    if (curIndex === index2) {
      return getPath(visited, index1, index2);
    }
    var neighbors = possibleNeighbors(curIndex, board, visited, index2);
    for (i = 0; i < neighbors.length; i++) {
      queue.push(neighbors[i]);
    }
  }
  return null;
};

// check whether a pair of link exist
var linkExist = function(board) {
  for (var i = 0; i < board.length - 1; i++) {
    if (board[i] !== 0) {
      for (var j = i + 1; j < board.length; j++) {
        if (board[j] === board[i] && findPath(board, i, j) !== null) {
          return true;
        }
      }
    }
  }
  return false;
};

var shuffle = function(arr) {
  var t;
  var value;
  for (var i = arr.length - 1; i >= 0; i--) {
    t = Math.floor(Math.random() * (i + 1));
    value = arr[t];
    arr[t] = arr[i];
    arr[i] = value;
  }
};

//
var reshuffleBoard = function(board) {
  var arr = [];
  var i;
  for (i = 0; i < board.length; i++) {
    if (board[i] !== 0) {
      arr.push(board[i]);
    }
  }
  shuffle(arr);
  var k = 0;
  for (i = 0; i < board.length; i++) {
    if (board[i] !== 0) {
      board[i] = arr[k++];
      var cell = tableCell(i);
      cell.style.backgroundImage = 'url("img/r_' + board[i] + '.png")';
    }
  }
};

// find out whether there is a pair
var reshuffleIfNeeded = function(board) {
  if (remaining !== 0) {
    while (!linkExist(board)) {
      reshuffleBoard(board);
    }
  } else {
    document.getElementById('modal-body-gameover').innerHTML = '<img src="img/win.png">';
    $('#gameOverModal').modal('show');
    clearInterval(interval);
    interval = null;
    gameEnd = true;
  }
};

var hideLines = function() {
  for (var i = 0; i < lastPath.length; i++) {
    if (lastPath[i] !== '') {
      tableCell(i).style.backgroundImage = '';
    }
  }

  var cell1 = tableCell(lastPair[0]);
  cell1.style.backgroundImage = '';
  cell1.className = '';
  var cell2 = tableCell(lastPair[1]);
  cell2.style.backgroundImage = '';
  cell2.className = '';
  showingLines = false;
};

// Click handler get position from this
var onCellClick = function() {
  if (showingLines) {
    return;
  }
  if (gameEnd) {
    return;
  }
  var pId = this.id.split('_');
  var curPosition = parseInt(pId[1]);

  if (theBoard[curPosition] === 0) {
    return;
  } else if (lastPosition === -1) {
    lastPosition = curPosition;
    tableCell(curPosition).className = 'highlight';
  } else if (lastPosition === curPosition) {
    return;
  } else if (theBoard[lastPosition] === theBoard[curPosition]) {
    var path = findPath(theBoard, lastPosition, curPosition);
    if (path === null) {
      return;
    }

    tableCell(curPosition).className = 'highlight';
    lastPath = path;
    lastPair = [lastPosition, curPosition];

    for (var i = 0; i < path.length; i++) {
      if (path[i] !== '') {
        tableCell(i).style.backgroundImage = 'url("img/' + path[i] + '.png")';
      }
    }

    showingLines = true;
    setTimeout(hideLines, 500);

    theBoard[lastPosition] = 0;
    theBoard[curPosition] = 0;
    lastPosition = -1;
    remaining -= 2;
    time = TIME;
    //$('#status').text(time);
    // check whether a pair of link exist
    reshuffleIfNeeded(theBoard);
  } else {
    tableCell(lastPosition).className = '';
    lastPosition = -1;
  }
};

// create initial board
var initBoard = function(board) {
  if (showingLines) {
    return;
  }

  if (lastPosition !== -1) {
    tableCell(lastPosition).className = '';
  }

  lastPosition = -1;
  remaining = 0;
  gameEnd = false;
  time = TIME;
  //$('#status').text(time);

  if (interval !== null) {
    clearInterval(interval);
  }
  interval = setInterval(tick, 1000);

  var i;
  var cell;
  for (i = 0; i < total; i++) {
    theBoard[i] = 0;
    cell = tableCell(i);
    cell.id = 'i_' + i;
    cell.innerHTML = '';
  }

  for (i = 0; i < board.length; i++) {
    if (board[i] === 0 && !isBlank(i)) {
      var t = Math.floor(Math.random() * types) + 1;
      board[i] = t;
      cell = tableCell(i);
      cell.style.backgroundImage = 'url("img/r_' + t + '.png")';
      // eslint-disable-next-line no-constant-condition
      while (true) {
        var c = Math.floor(Math.random() * (total - i)) + i;
        if (board[c] === 0 && !isBlank(c)) {
          board[c] = t;
          cell = tableCell(c);
          cell.style.backgroundImage = 'url("img/r_' + t + '.png")';
          remaining += 2;
          break;
        }
      }
    }
  }
  reshuffleIfNeeded(board);
};

var init = function() {
  $('#alert').hide();
  X = 2 * row + 1;
  Y = 2 * column + 1;
  total = X * Y;
  theBoard = new Array(total);

  var i;
  for (i = 0; i < X; i++) {
    // The value of -1 results in a new row being inserted at the last position.
    var tr = table.insertRow(-1);
    for (var j = 0; j < Y; j++) {
      tr.insertCell(-1);
    }
  }

  initBoard(theBoard);

  var cells = document.getElementsByTagName('td');
  // console.log(cells);
  for (i = 0; i < cells.length; i++) {
    // console.log('add click cell ' + cells[i].id);
    cells[i].addEventListener('click', onCellClick);
  }

  document.getElementById('reset').addEventListener('click', function() {
    $('#alert').hide();
    initBoard(theBoard);
  });
};

$('#gameStartModal').modal('show');
document.getElementById('startButton').addEventListener('click', function() {
  init();
});

// document.getElementById('form').addEventListener('submit', function(evt) {
//   evt.preventDefault();
//   //row = parseInt(document.getElementById('rows').value);
//   //column = parseInt(document.getElementById('columns').value);
//   if ((row * column) % 2 !== 0) {
//     document.getElementById('rows').value = '';
//     document.getElementById('columns').value = '';
//     $('#alert').show();
//   } else {
//     $('table').find('tr').remove();
//     init();
//   }
// });
