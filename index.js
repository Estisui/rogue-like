const height = 24;
const width = 40;
const field = document.getElementById('field');

const getRandomInt = (min, max) => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil) + minCeil);
};

const getRandomItem = (list) => list.splice(Math.floor(Math.random() * list.length), 1)[0];

class Game {
  constructor(rows, columns, location) {
    this.map = {
      rows,
      columns,
      field: null,
    };
    this.location = location;
  }

  generateMap() {
    this.map.field = Array(this.map.rows)
      .fill(null)
      .map(() => Array(this.map.columns).fill().map(() => ({
        value: 'wall',
        element: null,
      })));
  }

  generateAisles() {
    const verticalNum = getRandomInt(3, 6);
    const horizontalNum = getRandomInt(3, 6);
    const verticalIndexes = [...Array(this.map.rows).keys()];
    const horizontalIndexes = [...Array(this.map.columns).keys()];

    // generate vertical aisles
    for (let i = 0; i < verticalNum; i += 1) {
      const column = getRandomItem(horizontalIndexes);
      for (let y = 0; y < this.map.rows; y += 1) {
        this.map.field[y][column].value = 'tile';
      }
    }

    // generate horizontal aisles
    for (let j = 0; j < horizontalNum; j += 1) {
      const row = getRandomItem(verticalIndexes);
      for (let x = 0; x < this.map.columns; x += 1) {
        this.map.field[row][x].value = 'tile';
      }
    }
  }

  roomReachable(startV, startH, roomHeight, roomWidth) {
    // top scan
    if (startV !== 0) {
      for (let i = startH; i < startH + roomWidth; i += 1) {
        if (this.map.field[startV - 1][i].value === 'tile') {
          return true;
        }
      }
    }
    // bottom scan
    if (startV + roomHeight !== this.map.rows) {
      for (let i = startH; i < startH + roomWidth; i += 1) {
        if (this.map.field[startV + roomHeight][i].value === 'tile') {
          return true;
        }
      }
    }
    // left scan
    if (startH !== 0) {
      for (let i = startV; i < startV + roomHeight; i += 1) {
        if (this.map.field[i][startH - 1].value === 'tile') {
          return true;
        }
      }
    }
    // right scan
    if (startH + roomWidth !== this.map.columns) {
      for (let i = startV; i < startV + roomHeight; i += 1) {
        if (this.map.field[i][startH + roomWidth].value === 'tile') {
          return true;
        }
      }
    }
    return false;
  }

  generateRoom() {
    let roomHeight = null;
    let roomWidth = null;
    let roomStartV = null;
    let roomStartH = null;
    do {
      roomHeight = getRandomInt(3, 9);
      roomWidth = getRandomInt(3, 9);
      roomStartV = getRandomInt(0, this.map.rows - roomHeight);
      roomStartH = getRandomInt(0, this.map.columns - roomWidth);
    } while (!this.roomReachable(roomStartV, roomStartH, roomHeight, roomWidth));
    return {
      roomHeight, roomWidth, roomStartV, roomStartH,
    };
  }

  generateRooms() {
    const roomsNum = getRandomInt(5, 11);
    for (let i = 0; i < roomsNum; i += 1) {
      const {
        roomStartV, roomStartH, roomHeight, roomWidth,
      } = this.generateRoom();
      for (let v = roomStartV; v < roomStartV + roomHeight; v += 1) {
        for (let h = roomStartH; h < roomStartH + roomWidth; h += 1) {
          this.map.field[v][h].value = 'tile';
        }
      }
    }
  }

  drawMap() {
    this.location.style.gridTemplateRows = `repeat(${this.map.rows}, 1fr)`;
    this.location.style.gridTemplateColumns = `repeat(${this.map.columns}, 1fr)`;
    this.map.field.forEach((row) => {
      row.forEach((tile) => {
        const block = document.createElement('div');
        block.classList.add('tile');
        if (tile.value !== 'tile') {
          block.classList.add('tileW');
        }
        this.location.appendChild(block);
      });
    });
  }
}

const game = new Game(height, width, field);
game.generateMap();
game.generateAisles();
game.generateRooms();
game.drawMap();
