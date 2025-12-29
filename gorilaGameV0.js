const myCanvas = document.getElementById("myCanvas");
const ctx = myCanvas.getContext("2d");
myCanvas.width = window.innerWidth;
myCanvas.height = window.innerHeight;

let buildingPosition = 0; //this for setting the backgroundBuildings x-axis
let state = {};
newGame();

function newGame() {
  state = {
    phase: "aiming",
    currentPlayer: 1,
    buildings: [],
    bomb: {
      x: undefined,
      y: undefined,
      velocity: { x: 0, y: 0 },
    },
  };

  for (let i = 0; i < 10; i++) {
    generateBuildings(i);
  }

  initializeBombPosition();

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
    const minHeight = 200;
    const maxHeight = 350;
    height = minHeight + Math.random() * (maxHeight - minHeight);
  } else {
    const minHeight = 250;
    const maxHeight = 500;
    height = minHeight + Math.random() * (maxHeight - minHeight);
  }
  const lightsOn = [];
  for (let i = 0; i < 50; i++) {
    const light = Math.random() < 0.33 ? true : false;
    lightsOn.push(light);
  }

  state.buildings.push({ x, width, height, lightsOn });
}

function initializeBombPosition() {
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
}

function draw() {
  ctx.save();

  ctx.translate(0, window.innerHeight);
  ctx.scale(1, -1);

  drawBackground();
  drawBackgroundMoon();
  drawBackgroundBuildings();

  drawBuildings();

  drawGorila(1);
  drawGorila(2);

  drawBomb();

  ctx.restore();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, window.innerHeight);
  gradient.addColorStop(0, "rgb(204, 164, 53)");
  gradient.addColorStop(1, "rgb(179, 131, 0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
}
function drawBackgroundMoon() {
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.arc(window.innerWidth / 3, window.innerHeight / 1.2, 80, 0, 2 * Math.PI);
  ctx.fill();
}
function drawBackgroundBuildings() {
  for (let i = 0; i < 20; i++) {
    drawBackgroundBuilding();
  }
}
function drawBackgroundBuilding() {
  const minWidth = 60;
  const maxWidth = 140;
  const minHeight = 200;
  const maxHeight = 550;
  const buildingWidth = minWidth + Math.random() * (maxWidth - minWidth);
  const buildingHeight = minHeight + Math.random() * (maxHeight - minHeight);

  ctx.fillStyle = "rgba(108, 78, 118, 1)";
  ctx.fillRect(buildingPosition, 0, buildingWidth, buildingHeight);
  buildingPosition += buildingWidth + 5;
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
    ctx.quadraticCurveTo(-44, 63, -28, 107);
  } else if (
    state.pahse === "celebrating" &&
    state.currentPlayer === 1 &&
    player === 1
  ) {
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
    ctx.quadraticCurveTo(44, 63, 28, 107);
  } else if (state.pahse === "celebrating" && state.currentPlayer === player) {
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

  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(0, 0, 6, 0, 2 * Math.PI);
  ctx.fill();

  ctx.restore();
}
