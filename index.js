
const { 
    Engine,
    Render,
    Runner, 
    World, 
    Bodies, 
    Body,
    Events
    
} = Matter;

const cells = 20;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLength = width / cells;

const engine = Engine.create();
engine.world.gravity.y= 0;
const { world } = engine;
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        wireframes:true,
        width,
        height,
    }
});
Render.run(render);
Runner.run(Runner.create(), engine);



//walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];

World.add(world, walls);




//Maze generation

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }
  return arr;
};


//initialize grid array

// const grid = [];

// for (let i = 0; i < 3; i++) {
//   grid.push([]);
//   for (let j = 0; j < 3; j++) {
//     grid[i].push(false)
//   }
// }


//grid
const grid = Array(cells)
.fill(null)
.map(() => Array(cells).fill(false));

//vertical walls
const verticals = Array(cells)
.fill(null)
.map(() => Array(cells -1).fill(false));

//horizontal walls
const horizontals = Array(cells - 1)
.fill(null)
.map(() => Array(cells).fill(false));


//Random start
const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);


const stepThroughCell = (row, column) => {
  //If cell is visited at [row, column] then return
  if (grid[row][column]) {
    return;
  }
  //Mark cell as visited
  grid[row][column] = true;

  //Assemble random list of neighbors
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left'],
  ]);

  //For each neigbor...
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;

    //check bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }
    // If visited continue to next neighbor
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    //Remove corresponding wall
    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row -1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  //Visit neighbor

};

stepThroughCell(startRow, startColumn);

// console.log(grid)
// console.log(verticals)
// console.log(horizontals)
// console.log(`${startRow}, ${startColumn}`)


//Draw the maze

horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open === true) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength / 2,
      rowIndex * unitLength + unitLength,
      unitLength,
      3,
      {
        label: 'wall',
        isStatic: true
      }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + unitLength,
      rowIndex * unitLength + unitLength / 2,
      3,
      unitLength,
      {
        label: 'wall',
        isStatic: true
      }
    );
    World.add(world, wall)
  });
});


//Drawin the Goal


const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * .7,
  unitLength * .7,
  {
    isStatic: true,
    label: 'goal'

  }
);

World.add(world, goal);

//Draw the Ball

const ball = Bodies.circle(
  unitLength / 2,
  unitLength / 2,
  unitLength * .3,
  {
    label: 'ball'
  }
  
);
World.add(world, ball);

//Key control

document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity;
  

if (event.keyCode === 87) {
  Body.setVelocity(ball, {x, y: y - 5})
}
if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
}
if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
}
if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y});
}
});


//Collision logic/ Win Condition

Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach((collision) => {
    
    const labels = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      world.gravity.y = 1;
      world.bodies.forEach((body) => {
        if (body.label === 'wall') {
          Body.setStatic(body, false);
        }
      });
    }
  });
});