const context = document.getElementById("ID_CANVAS").getContext("2d");
context.canvas.width = 500; //100 dots
context.canvas.height = 400; // 80 dots
context.fillStyle = "#eee";
context.lineWidth = 0;
const EDIT_BUTTON = document.querySelector('[data-button="edit-button"]');
const RUN_BUTTON = document.querySelector('[data-button="run-button"]');
const RANDOM_DRAW_BUTTON = document.querySelector(
  '[data-button="random-draw-button"]'
);
const CLEAR_BUTTON = document.querySelector('[data-button="clear-button"]');

let DRAW_OR_NOT = false;
let GAME_RUNNING = false;

const WIDTH_SQUARE_PX = 20; //Ancho de los cuadrados
let ID_INTERVAL;

const GRID = Array.from(
  { length: context.canvas.width / WIDTH_SQUARE_PX },
  (_, i) => Array(context.canvas.height / WIDTH_SQUARE_PX).fill(0)
);

function drawAndClearCanvas() {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  for (let i = 0; i < GRID.length; i++) {
    for (let j = 0; j < GRID[i].length; j++) {
      if (GRID[i][j] === 1) {
        context.fillRect(
          i * WIDTH_SQUARE_PX,
          j * WIDTH_SQUARE_PX,
          WIDTH_SQUARE_PX,
          WIDTH_SQUARE_PX
        );
      }
    }
  }
}

function toggleSquareByIndexs(x, y, grid) {
  if (grid[x][y]) {
    grid[x][y] = 0;
  } else {
    grid[x][y] = 1;
  }
}

function activeDrawInCanvasHandler() {
  this.classList.toggle("touched");
  DRAW_OR_NOT = !DRAW_OR_NOT;
}
addEventListener("click", (e) => {
  if (!DRAW_OR_NOT) return;
  const {
    clientX,
    clientY,
    target: { tagName, offsetLeft, offsetTop, clientLeft, clientTop },
  } = e;
  if (tagName === "CANVAS") {
    const x = clientX - offsetLeft - clientLeft + 1;
    //EL mouse siempre apunta 1px menos en ambas coordenadas
    const y = clientY - offsetTop - clientTop + 1;
    if (x < 500 && y < 400) {
      const [indexX, indexY] = [
        Math.floor(x / WIDTH_SQUARE_PX),
        Math.floor(y / WIDTH_SQUARE_PX),
      ];
      toggleSquareByIndexs(indexX, indexY, GRID);
    }
    drawAndClearCanvas();
  }
});

function theCellWillLive(x, y, grid) {
  let aroundAlive = 0;
  if (grid[x - 1]?.[y]) aroundAlive++;
  if (grid[x - 1]?.[y - 1]) aroundAlive++;
  if (grid[x]?.[y - 1]) aroundAlive++;
  if (grid[x + 1]?.[y - 1]) aroundAlive++;
  if (grid[x + 1]?.[y]) aroundAlive++;
  if (grid[x + 1]?.[y + 1]) aroundAlive++;
  if (grid[x]?.[y + 1]) aroundAlive++;
  if (grid[x - 1]?.[y + 1]) aroundAlive++;

  if (grid[x][y] === 1) {
    return aroundAlive === 2 || aroundAlive === 3;
  }
  return aroundAlive === 3;
}

function changeGridForFuture() {
  //Los booleanos indicarán si seguirán con vida
  const newGRID = structuredClone(GRID);
  //Con las reglas del juego cada celda estará viva o muerta en el futuro
  for (let i = 0; i < GRID.length; i++) {
    for (let j = 0; j < GRID[i].length; j++) {
      newGRID[i][j] = theCellWillLive(i, j, GRID) ? 1 : 0;
    }
  }
  //Se reasigna los valores al GRID original del cual todas las funciones toman referencia
  for (let i = 0; i < newGRID.length; i++) {
    for (let j = 0; j < newGRID[i].length; j++) {
      GRID[i][j] = newGRID[i][j];
    }
  }
}

function refreshChange() {
  changeGridForFuture();
  drawAndClearCanvas();
}

function stopGame() {
  RUN_BUTTON.classList.remove("touched");
  RUN_BUTTON.innerText = "run";
  GAME_RUNNING = false;
  clearInterval(ID_INTERVAL);
}
function toggleRunGameHandler() {
  if (GAME_RUNNING) {
    stopGame();
  } else {
    RUN_BUTTON.classList.add("touched");
    RUN_BUTTON.innerText = "stop";
    GAME_RUNNING = true;
    ID_INTERVAL = setInterval(refreshChange, 500);
  }
}

function randomAliveDotsHandler() {
  const probability = 3; //de 10
  for (let i = 0; i < GRID.length; i++) {
    for (let j = 0; j < GRID[i].length; j++) {
      GRID[i][j] = Math.floor(Math.random() * 10) < probability ? 1 : 0;
    }
  }
  drawAndClearCanvas();
}

function clearGridHandler() {
  for (let i = 0; i < GRID.length; i++) {
    for (let j = 0; j < GRID[i].length; j++) {
      GRID[i][j] = 0;
    }
  }
  drawAndClearCanvas();
  stopGame();
}

EDIT_BUTTON.addEventListener("click", activeDrawInCanvasHandler);
RUN_BUTTON.addEventListener("click", toggleRunGameHandler);
RANDOM_DRAW_BUTTON.addEventListener("click", randomAliveDotsHandler);
CLEAR_BUTTON.addEventListener("click", clearGridHandler);
