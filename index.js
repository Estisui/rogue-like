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
  constructor(rows, columns, element) {
    this.map = {
      rows,
      columns,
      field: null,
    };
    this.element = element;
    this.player = {
      coords: { y: null, x: null },
      element: null,
      strength: 25,
      hp: 100,
    };
    this.enemies = {};
  }

  generateMap() {
    this.map.field = Array(this.map.rows)
      .fill(null)
      .map((_, y) => Array(this.map.columns).fill().map((__, x) => ({
        value: 'wall',
        element: null,
        coords: { y, x },
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

  getEmptyTiles() {
    const emptyTiles = [];
    for (let i = 0; i < this.map.rows; i += 1) {
      for (let j = 0; j < this.map.columns; j += 1) {
        if (this.map.field[i][j].value === 'tile') {
          emptyTiles.push({ y: i, x: j });
        }
      }
    }
    return emptyTiles;
  }

  getAdjTiles(location) {
    const verticalSafe = ({ y }) => y < this.map.rows && y >= 0;
    const horizontalSafe = ({ x }) => x < this.map.columns && x >= 0;
    const { y, x } = location;
    const adjTiles = [];
    const tiles = [{ y: y + 1, x }, { y: y - 1, x }, { y, x: x - 1 }, { y, x: x + 1 }];
    tiles.forEach((tile) => {
      if (verticalSafe(tile) && horizontalSafe(tile)) {
        adjTiles.push(this.map.field[tile.y][tile.x]);
      }
    });
    return adjTiles;
  }

  generateItems() {
    const emptyTiles = this.getEmptyTiles();
    // swords
    for (let i = 0; i < 2; i += 1) {
      const place = getRandomItem(emptyTiles);
      this.map.field[place.y][place.x].value = 'sword';
    }
    // potions
    for (let j = 0; j < 10; j += 1) {
      const place = getRandomItem(emptyTiles);
      this.map.field[place.y][place.x].value = 'potion';
    }
    // enemies
    for (let j = 0; j < 10; j += 1) {
      const place = getRandomItem(emptyTiles);
      this.map.field[place.y][place.x].value = 'enemy';
      const key = `enemy${j}`;
      this.map.field[place.y][place.x].id = key;
      const enemy = {
        hp: 100,
        coords: {
          y: place.y,
          x: place.x,
        },
        element: null,
      };
      this.enemies[key] = enemy;
    }
    // player
    const place = getRandomItem(emptyTiles);
    this.player.coords.y = place.y;
    this.player.coords.x = place.x;
    this.map.field[place.y][place.x].value = 'player';
  }

  movePossible(location) {
    const { y, x } = location;
    const verticalSafe = y < this.map.rows && y >= 0;
    const horizontalSafe = x < this.map.columns && x >= 0;
    if (verticalSafe && horizontalSafe) {
      const { value } = this.map.field[y][x];
      return value !== 'player' && value !== 'enemy' && value !== 'wall';
    }
    return false;
  }

  availableMoves(location) {
    const { y, x } = location;
    const possibleMoves = [];
    if (this.movePossible({ y: y - 1, x })) possibleMoves.push('up');
    if (this.movePossible({ y: y + 1, x })) possibleMoves.push('down');
    if (this.movePossible({ y, x: x - 1 })) possibleMoves.push('left');
    if (this.movePossible({ y, x: x + 1 })) possibleMoves.push('right');
    return possibleMoves;
  }

  static getTargetCoords(coords, direction) {
    const { y, x } = coords;
    const targetCoords = { y: null, x: null };
    switch (direction) {
      case 'up':
        targetCoords.y = y - 1;
        targetCoords.x = x;
        break;
      case 'down':
        targetCoords.y = y + 1;
        targetCoords.x = x;
        break;
      case 'left':
        targetCoords.y = y;
        targetCoords.x = x - 1;
        break;
      case 'right':
        targetCoords.y = y;
        targetCoords.x = x + 1;
        break;
      default:
        break;
    }
    return targetCoords;
  }

  movePlayer(direction) {
    const { coords } = this.player;
    const { y, x } = coords;
    const targetCoords = Game.getTargetCoords(coords, direction);
    if (this.movePossible(targetCoords)) {
      const current = this.map.field[y][x];
      const target = this.map.field[targetCoords.y][targetCoords.x];
      if (target.value === 'sword') {
        this.player.strength *= 2;
      } else if (target.value === 'potion') {
        if (this.player.hp >= 75) {
          this.player.hp = 100;
        } else {
          this.player.hp += 25;
        }
        Game.renderHealthBar(this.player.element, this.player.hp);
      }
      current.value = 'tile';
      this.player.coords = targetCoords;
      target.value = 'player';
      Game.renderMove(this.player.element, target.element, direction);
      Game.renderEmptyfying(current);
      return true;
    }
    return false;
  }

  moveEnemy(enemy, direction) {
    const { coords } = enemy;
    const { y, x } = coords;
    const targetCoords = Game.getTargetCoords(coords, direction);
    const current = this.map.field[y][x];
    const target = this.map.field[targetCoords.y][targetCoords.x];
    current.value = 'tile';
    enemy.coords = target.coords;
    target.value = 'enemy';
    target.id = current.id;
    delete current.id;
    Game.renderMove(enemy.element, target.element, direction);
    Game.renderEmptyfying(current);
  }

  attack() {
    Game.renderAttack(this.player);
    const availableEnemies = this.getAdjTiles(this.player.coords).filter((tile) => tile.value === 'enemy');
    availableEnemies.forEach((enemy) => {
      this.enemies[enemy.id].hp -= this.player.strength;
      const enemyId = enemy.id;
      if (this.enemies[enemy.id].hp > 0) {
        Game.renderHealthBar(this.enemies[enemy.id].element, this.enemies[enemy.id].hp);
      } else {
        Game.renderKill(this.enemies[enemy.id].element);
        Game.removeEnemyTile(enemy);
        delete this.enemies[enemyId];
        if (Object.values(this.enemies).length === 0) {
          alert('Ты победил!');
        }
      }
    });
  }

  attackPlayer() {
    this.player.hp -= 25;
    if (this.player.hp > 0) {
      Game.renderHealthBar(this.player.element, this.player.hp);
    } else {
      Game.renderHealthBar(this.player.element, 0);
      alert('Игра проиграна');
    }
  }

  performMove(enemy) {
    const tiles = this.getAdjTiles(enemy.coords);
    if (tiles.filter((tile) => tile.value === 'player').length > 0) {
      this.attackPlayer();
      Game.renderAttack(enemy);
    } else {
      const availableMoves = this.availableMoves(enemy.coords);
      const move = getRandomItem(availableMoves);
      if (move) {
        this.moveEnemy(enemy, move);
      }
    }
  }

  startEnemies() {
    const timerId = setInterval(() => {
      if (Object.values(this.enemies).length > 0 && this.player.hp > 0) {
        Object.values(this.enemies).forEach((enemy) => {
          this.performMove(enemy);
        });
      } else {
        clearInterval(timerId);
      }
    }, 1000);
  }

  static removeEnemyTile(tile) {
    tile.value = 'tile';
    delete tile.id;
  }

  // renders

  drawMap() {
    this.element.style.gridTemplateRows = `repeat(${this.map.rows}, 1fr)`;
    this.element.style.gridTemplateColumns = `repeat(${this.map.columns}, 1fr)`;
    this.map.field.forEach((row, y) => {
      row.forEach((tile, x) => {
        const block = document.createElement('div');
        block.classList.add('tile');
        switch (tile.value) {
          case 'wall':
            block.classList.add('tileW');
            break;
          case 'sword':
            block.classList.add('tileSW');
            break;
          case 'potion':
            block.classList.add('tileHP');
            break;
          case 'enemy': {
            const enemyDiv = document.createElement('div');
            enemyDiv.classList.add('tileE');
            const healthBar = document.createElement('div');
            healthBar.classList.add('health');
            healthBar.style.width = '100%';
            enemyDiv.appendChild(healthBar);
            block.appendChild(enemyDiv);
            this.enemies[tile.id].element = enemyDiv;
            break;
          }
          case 'player': {
            const playerDiv = document.createElement('div');
            playerDiv.classList.add('tileP');
            const healthBar = document.createElement('div');
            healthBar.classList.add('health');
            healthBar.style.width = '100%';
            playerDiv.appendChild(healthBar);
            block.appendChild(playerDiv);
            this.player.element = playerDiv;
            break;
          }
          default:
            break;
        }
        this.map.field[y][x].element = block;
        this.element.appendChild(block);
      });
    });
  }

  static renderHealthBar(element, hp) {
    const healthBar = element.querySelector('.health');
    healthBar.style.width = `${hp}%`;
  }

  static renderKill(tile) {
    tile.remove();
  }

  static renderAttack(character) {
    character.element.classList.add('attack');
    character.element.addEventListener('transitionend', () => character.element.classList.remove('attack'), { once: true });
  }

  static renderMove(curElement, newElement, direction) {
    const afterTransition = () => {
      newElement.appendChild(curElement);
      curElement.classList.remove(`transition-${direction}`);
    };
    curElement.classList.add(`transition-${direction}`);
    curElement.addEventListener('transitionend', afterTransition, { once: true });
  }

  static renderEmptyfying(tile) {
    tile.element.className = 'tile';
  }
}

const game = new Game(height, width, field);
game.generateMap();
game.generateAisles();
game.generateRooms();
game.generateItems();
game.drawMap();
game.startEnemies();

const keyboardHandler = (e) => {
  const codes = {
    KeyW: 'up', KeyA: 'left', KeyS: 'down', KeyD: 'right',
  };
  if (e.code === 'KeyW' || e.code === 'KeyA' || e.code === 'KeyS' || e.code === 'KeyD') {
    document.removeEventListener('keydown', keyboardHandler);
    if (game.movePlayer(codes[e.code])) {
      game.player.element.addEventListener('transitionend', () => document.addEventListener('keydown', keyboardHandler), { once: true });
    } else {
      document.addEventListener('keydown', keyboardHandler);
    }
  }
  if (e.code === 'Space') {
    game.attack();
    game.player.element.addEventListener('transitionend', () => document.addEventListener('keydown', keyboardHandler), { once: true });
  }
};

document.addEventListener('keydown', keyboardHandler);
