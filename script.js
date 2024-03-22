window.onload = function () {
  const fieldWidth = 40;
  const fieldHeight = 24;
  const tileSize = 25;
  const map = [];
  const items = {
    sword: 2,
    healthPotion: 10,
  };
  const enemiesCount = 10;
  const enemyAttack = 5;
  const hero = { 
    x: 0, 
    y: 0, 
    health: 100, 
    attack: 25 
  };
  const enemies = [];
  const minTunnels = 3;
  const maxTunnels = 5;
  const minRooms = 5;
  const maxRooms = 10;
  const numRooms = Math.floor(Math.random() * (maxRooms - minRooms + 1)) + minRooms;
  const swordAttackBoost = 25;
  const restartBtn = $('.restart');

  for (let i = 0; i < fieldHeight; i++) {
    map[i] = [];
    for (let j = 0; j < fieldWidth; j++) {
      map[i][j] = 'tileW';
    }
  }

  function createRoom(x, y, width, height) {
    for (let i = y; i < y + height; i++) {
      for (let j = x; j < x + width; j++) {
        map[i][j] = 'tile'; 
      }
    }
  }

  for (let i = 0; i < numRooms; i++) {
    const roomWidth = Math.floor(Math.random() * 6) + 3;
    const roomHeight = Math.floor(Math.random() * 6) + 3; 
    const x = Math.floor(Math.random() * (fieldWidth - roomWidth - 1)); 
    const y = Math.floor(Math.random() * (fieldHeight - roomHeight - 1)); 
    createRoom(x, y, roomWidth, roomHeight);
  }

  function createTunnels() {
    const verticalTunnels =
      Math.floor(Math.random() * (maxTunnels - minTunnels + 1)) + minTunnels;
    const horizontalTunnels =
      Math.floor(Math.random() * (maxTunnels - minTunnels + 1)) + minTunnels;

    for (let i = 0; i < verticalTunnels; i++) {
      const x = Math.floor(Math.random() * (fieldWidth - 2));
      for (let y = 1; y < fieldHeight - 1; y++) {
        map[y][x] = 'tile';
      }
    }

    for (let i = 0; i < horizontalTunnels; i++) {
      const y = Math.floor(Math.random() * (fieldHeight - 2));
      for (let x = 1; x < fieldWidth - 1; x++) {
        map[y][x] = 'tile'; 
      }
    }
  }

  createTunnels();

  const createItem = (item, itemCount) => {
    for (let i = 0; i < itemCount; i++) {
      let x, y;
      do {
        x = Math.floor(Math.random() * fieldWidth);
        y = Math.floor(Math.random() * fieldHeight);
      } while (map[y][x] !== 'tile');
      map[y][x] = item;
    }
  }

  createItem('tileSW', items.sword);
  createItem('tileHP', items.healthPotion);

  const floor = [];
  for (let y = 0; y < fieldHeight; y++) {
    for (let x = 0; x < fieldWidth; x++) {
      if (map[y][x] === 'tile') {
        floor.push({ 
          x: x, 
          y: y 
        });
      }
    }
  }

  for (let i = 0; i < enemiesCount; i++) {
    const randomIndex = Math.floor(Math.random() * floor.length);
    const randomTile = floor[randomIndex];
    const { x, y } = randomTile;
    enemies.push({ 
      x: x, 
      y: y, 
      health: 100, 
      attack: enemyAttack 
    });
    map[y][x] = 'tileE';

    floor.splice(randomIndex, 1);
  }

  do {
    hero.x = Math.floor(Math.random() * fieldWidth);
    hero.y = Math.floor(Math.random() * fieldHeight);
  } while (map[hero.y][hero.x] !== 'tile');

  map[hero.y][hero.x] = 'tileP';
  
  function createHealthBar(health) {
      return $('<div>')
      .addClass('health')
      .css({
          width: health + '%',
      });
  }

  function isHeroNear(x, y) {
      return (
      (x > 0 && map[y][x - 1] === 'tileP') || 
      (x < fieldWidth - 1 && map[y][x + 1] === 'tileP') || 
      (y > 0 && map[y - 1][x] === 'tileP') || 
      (y < fieldHeight - 1 && map[y + 1][x] === 'tileP') 
      );
  }

  function updateMap() {
    const field = $('.field');
    const gameover = $('.gameover');
    const victory = $('.victory');
    field.empty();

    for (let y = 0; y < fieldHeight; y++) {
      for (let x = 0; x < fieldWidth; x++) {
        const tile = $('<div>').addClass('tile').addClass(map[y][x]);
        tile.css({
          left: x * tileSize + 'px',
          top: y * tileSize + 'px',
          width: tileSize + 'px',
          height: tileSize + 'px',
        });

        if (map[y][x] === 'tileP' && hero.health) {
          tile.append(createHealthBar(hero.health));
        }

        if (map[y][x] === 'tileE' && enemies.length > 0) {
          const enemy = enemies.find((enemy) => enemy.x === x && enemy.y === y);
          if (enemy && enemy.health) {
            tile.append(createHealthBar(enemy.health));
          }
        }

        if (map[y][x] === 'tileE' && hero.health && isHeroNear(x, y)) {
          hero.health -= enemyAttack; 
          if (hero.health <= 0) {
            gameover.removeClass('hidden');
            victory.addClass('hidden');
            field.addClass('hidden');
          }
        }

        if (enemies.length === 0) {
          victory.removeClass('hidden');
          field.addClass('hidden');
        }

        field.append(tile);
      }
    }
  }

  function isEnemyAt(x, y) {
    return map[y][x] === 'tileE';
  }

  function canMoveTo(x, y) {
    const tile = map[y][x];
    return (
      x >= 0 &&
      x < fieldWidth &&
      y >= 0 &&
      y < fieldHeight &&
      (tile !== 'tileW')
    );
  }

  function moveHeroTo(x, y) {
    map[hero.y][hero.x] = 'tile';
    hero.x = x;
    hero.y = y;
    map[y][x] = 'tileP';
  }

  function attackEnemies() {
    for (const enemy of enemies) {
      if (isEnemyNear(enemy)) {
        enemy.health -= hero.attack; 
        if (enemy.health <= 0) {
          const index = enemies.indexOf(enemy);
          enemies.splice(index, 1);
          map[enemy.y][enemy.x] = 'tile';
        }
        break;
      }
    }
  }

  $(document).keydown(function (e) {
    let x = hero.x;
    let y = hero.y;

    switch (e.key) {
      case 'W':
      case 'w':
      case 'Ц':
      case 'ц':
        y -= 1
        break;

      case 'A':
      case 'a':
      case 'Ф':
      case 'ф':
        x -= 1;
        break;

      case 'S':
      case 's':
      case 'Ы':
      case 'ы':
        y += 1;
        break;

      case 'D':
      case 'd':
      case 'В':
      case 'в':
        x += 1;
        break;

      case ' ':
        attackEnemies();
        updateMap();
        break;
    
      default:
        break;
    }

    if (map[y][x] === 'tileSW') {
      hero.attack += swordAttackBoost;
      map[y][x] = 'tile';
    }

    if (canMoveTo(x, y) && !isEnemyAt(x, y)) {
      if (map[y][x] === 'tileHP') {
        hero.health = 100;
        map[y][x] = 'tile';

      }
      moveHeroTo(x, y);
      updateMap();
    }
  });

  function isEnemyNear(enemy) {
    return Math.abs(hero.x - enemy.x) + Math.abs(hero.y - enemy.y) === 1;
  }

  function isSwordOrHealthPotion(x, y) {
    return map[y][x] === 'tileSW' || map[y][x] === 'tileHP';
  }

  function isEnemyNearToHero(enemyX, enemyY) {
    return (
      (Math.abs(hero.x - enemyX) === 1 && hero.y === enemyY) ||
      (Math.abs(hero.y - enemyY) === 1 && hero.x === enemyX)
    );
  }

  function moveEnemies() {
    for (const enemy of enemies) {
      if (isEnemyNearToHero(enemy.x, enemy.y)) {
        continue;
      }

      let x, y;

      do {
        x = enemy.x;
        y = enemy.y;

        const direction = Math.floor(Math.random() * 4);

        switch (direction) {
          case 0: 
            y -= 1;
            break;
          case 1: 
            y += 1;
            break;
          case 2: 
            x -= 1;
            break;
          case 3: 
            x += 1;
            break;
        }
      } while (!canMoveTo(x, y) || isSwordOrHealthPotion(x, y));

      map[enemy.y][enemy.x] = 'tile';
      enemy.x = x;
      enemy.y = y;
      map[y][x] = 'tileE'; 
    }
  }


  setInterval(function () {
    moveEnemies();
    updateMap();
  }, 700); 

  restartBtn.click(() => {
    location.reload(); 
  })
};
