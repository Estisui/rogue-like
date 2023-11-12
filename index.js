const width = 40;
const height = 24;
const field = document.getElementById('field');

const getRandomInt = (min, max) => {
  const minCeil = Math.ceil(min);
  const maxFloor = Math.floor(max);
  return Math.floor(Math.random() * (maxFloor - minCeil) + minCeil);
};

const getRandomItem = (list) => list.splice(Math.floor(Math.random() * list.length), 1)[0];

class Game {
  constructor(columns, rows, location) {
    this.map = {
      columns,
      rows,
      field: [],
    };
    this.location = location;
  }

  generateMap() {
    this.map.field = Array(this.map.rows)
      .fill(null)
      .map(() => Array(this.map.columns).fill('wall'));
  }

  generateAisles() {
    const verticalNum = getRandomInt(3, 6);
    const horizontalNum = getRandomInt(3, 6);
    const verticalIndexes = [...Array(this.map.columns).keys()];
    const horizontalIndexes = [...Array(this.map.rows).keys()];

    // generate vertical aisles
    for (let i = 0; i < verticalNum; i += 1) {
      const column = getRandomItem(verticalIndexes);
      for (let y = 0; y < this.map.rows; y += 1) {
        this.map.field[y][column] = 'path';
      }
    }

    // generate horizontal aisles
    for (let j = 0; j < horizontalNum; j += 1) {
      const row = getRandomItem(horizontalIndexes);
      for (let x = 0; x < this.map.columns; x += 1) {
        this.map.field[row][x] = 'path';
      }
    }
  }

  drawMap() {
    this.location.style.gridTemplateColumns = `repeat(${this.map.columns}, 1fr)`;
    this.location.style.gridTemplateRows = `repeat(${this.map.rows}, 1fr)`;
    this.map.field.forEach((row) => {
      row.forEach((tile) => {
        const block = document.createElement('div');
        block.classList.add('tile');
        if (tile !== 'path') {
          block.classList.add('tileW');
        }
        this.location.appendChild(block);
      });
    });
  }
}

const game = new Game(width, height, field);
game.generateMap();
game.generateAisles();
game.drawMap();
