//game canva
const myCanvas = document.getElementById("myCanvas");
//player 1 info
const angle1DOM = document.querySelector("#info-left .angle");
const velocity1DOM = document.querySelector("#info-left .velocity");
//player 2 info
const angle2DOM = document.querySelector("#info-right .angle");
const velocity2DOM = document.querySelector("#info-right .velocity");
//bomb grab area
const bombGrabAreaDOM = document.getElementById("bomb-grab-area");
//event handler
let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;
let previousAnimationTimestamp = undefined;
//blast hole
const blastHoleRadius = 20;
//congratulation panel
const congratulationsDOM = document.getElementById("congratulations");
const winnerDOM = document.getElementById("winner");
const newGameDOM = document.getElementById("new-game");

const dpr = window.devicePixelRatio;
myCanvas.width = window.innerWidth * dpr;
myCanvas.height = window.innerHeight * dpr;
myCanvas.style.width = window.innerWidth + "px";
myCanvas.style.height = window.innerHeight + "px";

const ctx = myCanvas.getContext("2d");

let state = {};
newGame();

function newGame() {
  state = {
    phase: "aiming",
    currentPlayer: 1,
    buildings: [],
    backgroundBuildings: [],
    bomb: {
      x: undefined,
      y: undefined,
      velocity: { x: 0, y: 0 },
      rotation: 0,
    },
    blastHoles: [],
    scale: 1,
  };

  for (let i = 0; i < 10; i++) {
    generateBuildings(i);
  }
  for (let i = 0; i < 20; i++) {
    generateBackgroundBuildings(i);
  }

  calculateScale();

  initializeBombPosition();

  //reset html content
  congratulationsDOM.style.visibility = "hidden";
  angle1DOM.innerText = 0;
  velocity1DOM.innerText = 0;
  angle2DOM.innerText = 0;
  velocity2DOM.innerText = 0;

  draw();
}

function generateBuildings(index) {
  let x;
  let gapBetweenBuildings = 5;
  if (state.buildings[index - 1]) {
    x =
      state.buildings[index - 1].x +
      state.buildings[index - 1].width +
      gapBetweenBuildings;
  } else {
    x = 0;
  }

  const minWidth = 120;
  const maxWidth = 170;
  const width = minWidth + Math.random() * (maxWidth - minWidth);

  let height;
  if (index == 1 || index == 8) {
    const minHeight = 150;
    const maxHeight = 300;
    height = minHeight + Math.random() * (maxHeight - minHeight);
  } else {
    const minHeight = 200;
    const maxHeight = 450;
    height = minHeight + Math.random() * (maxHeight - minHeight);
  }
  const lightsOn = [];
  for (let i = 0; i < 50; i++) {
    const light = Math.random() < 0.33 ? true : false;
    lightsOn.push(light);
  }

  state.buildings.push({ x, width, height, lightsOn });
}

function generateBackgroundBuildings(index) {
  let x;
  let gapBetweenBackgroundBuildings = 5;
  if (state.backgroundBuildings[index - 1]) {
    x =
      state.backgroundBuildings[index - 1].x +
      state.backgroundBuildings[index - 1].width +
      gapBetweenBackgroundBuildings;
  } else {
    x = 0;
  }
  const minWidth = 60;
  const maxWidth = 140;
  const minHeight = 200;
  const maxHeight = 550;
  const width = minWidth + Math.random() * (maxWidth - minWidth);
  const height = minHeight + Math.random() * (maxHeight - minHeight);
  state.backgroundBuildings.push({ x, width, height });
}

function calculateScale() {
  const lastBuilding = state.buildings[9];
  const cityWidth = lastBuilding.x + lastBuilding.width;

  state.scale = window.innerWidth / cityWidth;
}

function initializeBombPosition() {
  if (state.phase != "aiming") {
    return;
  }
  const building =
    state.currentPlayer === 1 ? state.buildings[1] : state.buildings[8];
  const gorilaX = building.x + building.width / 2;
  const gorilaY = building.height;

  const gorilaHandX = state.currentPlayer === 1 ? -28 : 28;
  const gorilaHandY = 107;

  state.bomb.x = gorilaX + gorilaHandX;
  state.bomb.y = gorilaY + gorilaHandY;
  state.bomb.velocity.x = 0;
  state.bomb.velocity.y = 0;
  state.bomb.rotation = 0;

  //position bomb grab area
  bombGrabAreaDOM.classList.remove("hide");
  const grabAreaRadius = 15;
  const left = state.bomb.x * state.scale - grabAreaRadius;
  const bottom = state.bomb.y * state.scale - grabAreaRadius;
  bombGrabAreaDOM.style.left = `${left}px`;
  bombGrabAreaDOM.style.bottom = `${bottom}px`;
}

window.addEventListener("resize", () => {
  myCanvas.width = window.innerWidth * dpr;
  myCanvas.height = window.innerHeight * dpr;
  myCanvas.style.width = window.innerWidth + "px";
  myCanvas.style.height = window.innerHeight + "px";
  calculateScale();
  initializeBombPosition();
  draw();
});

//drawing
function draw() {
  ctx.save();

  ctx.scale(dpr, dpr);

  ctx.translate(0, window.innerHeight);
  ctx.scale(1 * state.scale, -1 * state.scale);

  drawBackground();
  drawBackgroundMoon();
  drawBackgroundBuildings();

  //drawBuildings();
  drawBuildingsWithBlasts();

  drawGorila(1);
  drawGorila(2);

  drawBomb();

  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(
    0,
    0,
    0,
    window.innerHeight / state.scale
  );
  gradient.addColorStop(0, "rgb(204, 164, 53)");
  gradient.addColorStop(1, "rgb(179, 131, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(
    0,
    0,
    window.innerWidth / state.scale,
    window.innerHeight / state.scale
  );
}
function drawBackgroundMoon() {
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(window.innerWidth / 3, window.innerHeight / 1.2, 80, 0, 2 * Math.PI);
  ctx.fill();
}

function drawBackgroundBuildings() {
  state.backgroundBuildings.forEach((backgroundBuilding) => {
    //draw background buildings
    ctx.fillStyle = "rgba(108, 78, 118, 1)";
    ctx.fillRect(
      backgroundBuilding.x,
      0,
      backgroundBuilding.width,
      backgroundBuilding.height
    );
  });
}

function drawBuildingsWithBlasts() {
  ctx.save();

  state.blastHoles.forEach((blastHole) => {
    ctx.beginPath();

    //outer shape clockwise
    ctx.rect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    );

    //inner shape counterclockwise
    ctx.arc(blastHole.x, blastHole.y, blastHoleRadius, 0, 2 * Math.PI, true);

    ctx.clip();
  });

  drawBuildings();

  ctx.restore();
}

function drawBuildings() {
  state.buildings.forEach((building) => {
    //draw main buildings
    ctx.fillStyle = "rgba(75, 17, 94, 1)";
    ctx.fillRect(building.x, 0, building.width, building.height);

    //draw windows
    const gap = 15;
    const windowWidth = 10;
    const windowHeight = 12;
    const roomHeight = windowHeight + gap;
    const roomWidth = windowWidth + gap;
    ctx.save();
    ctx.translate(building.x + gap, building.height - gap);
    ctx.scale(1, -1);
    ctx.fillStyle = "rgb(204, 164, 53)";
    const totalFloors = Math.ceil((building.height - gap) / roomHeight);
    const floorRooms = Math.floor((building.width - gap) / roomWidth);

    let currentRoom;
    for (let floor = 0; floor < totalFloors; floor++) {
      for (let room = 0; room < floorRooms; room++) {
        currentRoom = floor * floorRooms + room;
        if (building.lightsOn[currentRoom]) {
          ctx.fillRect(
            room * roomWidth,
            floor * roomHeight,
            windowWidth,
            windowHeight
          );
        }
      }
    }

    ctx.restore();
  });
}

function drawGorila(player) {
  ctx.save();
  let position;
  player == 1 ? (position = 1) : (position = 8);
  ctx.translate(
    state.buildings[position].x + state.buildings[position].width / 2,
    state.buildings[position].height
  );

  drawGorilaBody();
  drawGorilaLeftArm(player);
  drawGorilaRightArm(player);
  drawGorilaFace(player);

  ctx.restore();
}
function drawGorilaBody() {
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.moveTo(0, 15);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-20, 0);
  ctx.lineTo(-17, 18);
  ctx.lineTo(-20, 44);

  ctx.lineTo(-11, 77);
  ctx.lineTo(0, 84);
  ctx.lineTo(11, 77);

  ctx.lineTo(20, 44);
  ctx.lineTo(17, 18);
  ctx.lineTo(20, 0);
  ctx.lineTo(7, 0);
  ctx.fill();
}
function drawGorilaLeftArm(player) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(-14, 50);
  if (state.phase === "aiming" && state.currentPlayer === 1 && player === 1) {
    ctx.quadraticCurveTo(
      -44,
      63,
      -28 - state.bomb.velocity.x / 6.25,
      107 - state.bomb.velocity.y / 6.25
    );
  } else if (state.phase === "celebrating" && state.currentPlayer === player) {
    ctx.quadraticCurveTo(-44, 63, -28, 107);
  } else {
    ctx.quadraticCurveTo(-44, 45, -28, 12);
  }
  ctx.stroke();
}
function drawGorilaRightArm(player) {
  ctx.strokeStyle = "black";
  ctx.lineWidth = 18;
  ctx.beginPath();
  ctx.moveTo(14, 50);
  if (state.phase === "aiming" && state.currentPlayer === 2 && player === 2) {
    ctx.quadraticCurveTo(
      44,
      63,
      28 - state.bomb.velocity.x / 6.25,
      107 - state.bomb.velocity.y / 6.25
    );
  } else if (state.phase === "celebrating" && state.currentPlayer === player) {
    ctx.quadraticCurveTo(44, 63, 28, 107);
  } else {
    ctx.quadraticCurveTo(44, 45, 28, 12);
  }
  ctx.stroke();
}
function drawGorilaFace(player) {
  //face
  ctx.fillStyle = "lightgray";
  ctx.beginPath();
  ctx.arc(0, 63, 9, 0, 2 * Math.PI);
  ctx.moveTo(-3.5, 70);
  ctx.arc(-3.5, 70, 4, 0, 2 * Math.PI);
  ctx.moveTo(3.5, 70);
  ctx.arc(3.5, 70, 4, 0, 2 * Math.PI);
  ctx.fill();

  //eyes
  ctx.fillStyle = "black";
  ctx.beginPath();
  ctx.arc(-3.5, 70, 1.4, 0, 2 * Math.PI);
  ctx.moveTo(3.5, 70);
  ctx.arc(3.5, 70, 1.4, 0, 2 * Math.PI);
  ctx.fill();

  ctx.strokeStyle = "black";
  ctx.lineWidth = 1.4;

  //nose
  ctx.beginPath();
  ctx.moveTo(-3.5, 66.5);
  ctx.lineTo(-1.5, 65);
  ctx.moveTo(1.5, 65);
  ctx.lineTo(3.5, 66.5);
  ctx.stroke();

  //mouse
  ctx.beginPath();
  if (state.phase === "celebrating" && state.currentPlayer === player) {
    ctx.moveTo(-5, 60);
    ctx.quadraticCurveTo(0, 56, 5, 60);
  } else {
    ctx.moveTo(-5, 56);
    ctx.quadraticCurveTo(0, 60, 5, 56);
  }
  ctx.stroke();
}

function drawBomb() {
  ctx.save();
  ctx.translate(state.bomb.x, state.bomb.y);

  if (state.phase === "aiming") {
    //move bomb while dragging
    ctx.translate(-state.bomb.velocity.x / 6.25, -state.bomb.velocity.y / 6.25);

    //draw trajectory line
    ctx.strokeStyle = "rgba(255,255,255,0.7)";
    ctx.setLineDash([3, 8]);
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(state.bomb.velocity.x, state.bomb.velocity.y);
    ctx.stroke();

    //draw bomb
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fill();
  } else if (state.phase === "inFlight") {
    //draw bomb
    ctx.fillStyle = "white";
    ctx.rotate(state.bomb.rotation);
    ctx.beginPath();
    ctx.moveTo(-8, -2);
    ctx.quadraticCurveTo(0, 12, 8, -2);
    ctx.quadraticCurveTo(0, 2, -8, -2);
    ctx.fill();
  } else {
    //draw bomb phase celebrating
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(0, 0, 6, 0, 2 * Math.PI);
    ctx.fill();
  }

  ctx.restore();
}
//end of drawing

//event handlers
bombGrabAreaDOM.addEventListener("mousedown", (event) => {
  if (state.phase === "aiming") {
    isDragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;

    document.body.style.cursor = "grabbing";
  }
});

window.addEventListener("mousemove", (event) => {
  if (isDragging) {
    let deltaX = event.clientX - dragStartX;
    let deltaY = event.clientY - dragStartY;

    //if(deltaX)

    //console.log(window.innerWidth);
    //console.log(deltaX);
    //console.log(deltaY);

    setInfo(deltaX, deltaY);

    draw();
  }
});
function setInfo(deltaX, deltaY) {
  state.bomb.velocity.x = -deltaX;
  state.bomb.velocity.y = deltaY;
  let velocity = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
  let angleInRadian = Math.asin(deltaY / velocity);
  let angleInDegree = (180 * angleInRadian) / Math.PI;
  if (state.currentPlayer === 1) {
    velocity1DOM.innerText = `${Math.round(velocity)}`;
    angle1DOM.innerText = `${Math.round(angleInDegree)}`;
  } else {
    velocity2DOM.innerText = `${Math.round(velocity)}`;
    angle2DOM.innerText = `${Math.round(angleInDegree)}`;
  }
}

window.addEventListener("mouseup", (event) => {
  if (isDragging) {
    isDragging = false;
    document.body.style.cursor = "default";

    throwBomb();
  }
});

function throwBomb() {
  state.phase = "inFlight";
  previousAnimationTimestamp = undefined;
  requestAnimationFrame(animate);
}

function animate(timestamp) {
  if (previousAnimationTimestamp == undefined) {
    previousAnimationTimestamp = timestamp;
    requestAnimationFrame(animate);
    return;
  }

  const elapsedTime = timestamp - previousAnimationTimestamp;

  const hitDetectionPercision = 10;
  for (let i = 0; i < hitDetectionPercision; i++) {
    moveBomb(elapsedTime / hitDetectionPercision);

    //hit detection
    const miss = checkFrameHit() || checkBuildingHit();
    const hit = checkGorillaHit();
    if (miss) {
      state.currentPlayer = state.currentPlayer == 1 ? 2 : 1;
      state.phase = "aiming";
      initializeBombPosition();

      draw();
      return;
    }
    if (hit) {
      state.phase = "celebrating";
      bombGrabAreaDOM.classList.add("hide");
      announceWinner();
      console.log("winner");

      draw();
      return;
    }
  }

  draw();

  previousAnimationTimestamp = timestamp;
  requestAnimationFrame(animate);
}

function moveBomb(elapsedTime) {
  const multiplier = elapsedTime / 200;

  //gravity effect on trajectory
  state.bomb.velocity.y -= 20 * multiplier;

  //new position
  state.bomb.x += state.bomb.velocity.x * multiplier;
  state.bomb.y += state.bomb.velocity.y * multiplier;

  //rotation according to player
  const direction = state.currentPlayer == 1 ? -1 : 1;
  state.bomb.rotation += direction * 5 * multiplier;
}

function checkFrameHit() {
  if (
    state.bomb.y < 0 ||
    state.bomb.x < 0 ||
    state.bomb.x * state.scale > window.innerWidth
  ) {
    return true;
  } else {
    return false;
  }
}

function checkBuildingHit() {
  for (let i = 0; i < state.buildings.length; i++) {
    if (
      state.bomb.x + 6 > state.buildings[i].x &&
      state.bomb.x - 6 < state.buildings[i].x + state.buildings[i].width &&
      state.bomb.y - 6 < state.buildings[i].height
    ) {
      //check if there's a blast hole so animation continues
      for (let j = 0; j < state.blastHoles.length; j++) {
        const blastHole = state.blastHoles[j];
        const distance = Math.sqrt(
          (blastHole.x - state.bomb.x) ** 2 + (blastHole.y - state.bomb.y) ** 2
        );
        if (distance < blastHoleRadius) {
          return false;
        }
      }

      state.blastHoles.push({ x: state.bomb.x, y: state.bomb.y });
      return true;
    }
  }
}

function checkGorillaHit() {
  const enemey = state.currentPlayer == 1 ? 2 : 1;
  const enemeyBuilding = enemey == 1 ? 1 : 8;

  ctx.save();
  ctx.translate(
    state.buildings[enemeyBuilding].x +
      state.buildings[enemeyBuilding].width / 2,
    state.buildings[enemeyBuilding].height
  );
  drawGorilaBody();
  let hit = ctx.isPointInPath(state.bomb.x, state.bomb.y);
  drawGorilaLeftArm(enemey);
  hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);
  drawGorilaRightArm(enemey);
  hit ||= ctx.isPointInStroke(state.bomb.x, state.bomb.y);

  ctx.restore();
  return hit;
}

function announceWinner() {
  winnerDOM.innerText = `Player ${state.currentPlayer}`;
  congratulationsDOM.style.visibility = "visible";
}

newGameDOM.addEventListener("click", newGame);
