const columns = 40;
const rows = 24;

class Game {
  constructor() {
    this.map = [];
  }
}

let field = document.getElementById("field");

const generateMap = (columns, rows) => {
	const map = {
		columns,
		rows,
		field
	}
  map.field = Array(rows)
    .fill(null)
    .map(() => Array(columns).fill("wall"));
	return map;
};

const generateAisles = (map) => {
	const getRandomInt = (min, max) => {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min) + min);
	}

	const verticalNum = getRandomInt(3, 6);
	const horizontalNum = getRandomInt(3, 6);
	console.log(verticalNum, horizontalNum);

	for (let i = 0; i < verticalNum; i++) {
		const column = getRandomInt(0, map.columns);
		for (let y = 0; y < map.rows; y++) {
			console.log(column, y);
			map.field[y][column] = 'path';
		}
	}
}

const drawMap = (map, location) => {
	location.style.gridTemplateColumns = `repeat(${map.columns}, 1fr)`
	location.style.gridTemplateRows = `repeat(${map.rows}, 1fr)`
	map.field.forEach((row) => {
		row.forEach((tile) => {
			const block = document.createElement('div');
			block.classList.add('tile');
			if (tile !== 'path') {
				block.classList.add("tileW");
			}
			location.appendChild(block);
		})
	});
}

const game = new Game();
game.map = generateMap(columns, rows);
console.log(game.map, field);
generateAisles(game.map);
drawMap(game.map, field);


// const game = new Game();
// game.init();
