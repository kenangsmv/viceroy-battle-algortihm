// Import stylesheets
import './style.css';

// Write Javascript code!
const appDiv = document.getElementById('app');

// class CollectingShips extends Ship {
//   constructor() {
//     super();
//   }
//   _init() {
//     super._init();
//     console.log('C _init()');
//     this.childProp = 'child';
//   }

//   move() {
//     const edgePosition =
//       this.positionY + this.speed * (isPositiveSide(this.side) ? -1 : 1);
//     console.log('edge', edgePosition);

//     if (edgePosition > 25 || edgePosition < -25) {
//       console.log('asd');
//       return;
//     }
//     this.move();
//   }
// }

class Ship {
  constructor(
    side,
    name,
    attackSpeed,
    attack,
    range,
    armor,
    hp,
    speed,
    accuracy,
    count
  ) {
    this.side = side; //could be side
    this.name = name;
    this.attackSpeed = attackSpeed;
    this.attack = attack;
    this.range = range;
    this.armor = armor;
    this.hp = hp;
    this.speed = speed;
    this.accuracy = accuracy;
    this.positionY = side ? 25 : -25;
    this.count = count;
    this.shipsInRangeByName = [];
  }

  attackEnemyShipInRange(enemyShips) {
    if (!this.shipsInRangeByName.length) {
      return;
    }
    const enemyShipsInRange = enemyShips.filter(
      (ship) => this.shipsInRangeByName.includes(ship.name) && ship.count > 0
    );

    enemyShipsInRange.forEach((enemyShip) =>
      this.attackTarget(enemyShip, calculateAgro(enemyShipsInRange, enemyShip))
    );
  }

  attackTarget(target, agro) {
    let hitAmount =
      (agro * this.count * this.accuracy * this.attackSpeed) /
      (target.speed * 100);

    let totalDamage = Math.max(1, this.attack - target.armor) * hitAmount;

    let targetCount = Math.floor(
      (target.hp * target.count - totalDamage) / target.hp
    );

    target.count = targetCount;

    if (target.hp <= 0) {
      target.count = 0;
    }
    console.log(
      `${this.name} is attacking ${target.name} with ${hitAmount}, totalDamage ${totalDamage}, result ship: ${target.count}`
    );
    // let remainingShipCount = Math.round(((shipCount * this.hp) - totalDamage) / this.hp);
  }

  move() {
    // console.log('collecting', this.positionY);
    const edgePosition =
      this.positionY + this.speed * (isAttackerSide(this.side) ? -1 : 1);
    // console.log('edge', edgePosition);

    if (edgePosition > 25 || edgePosition < -25) {
      console.log('on the edge');
      return;
    }
    if (this.shipsInRangeByName.length > 0) {
      return;
    }
    console.log(this.name, 'is moving', this.positionY);
    
    this.positionY += this.speed * (isAttackerSide(this.side) ? -1 : 1);
  }

  checkEnemyShipInRange(enemyShips) {
    let shipsInRange = [];
    for (let enemyShip of enemyShips) {
      if (isInRange(this, enemyShip)) {
        shipsInRange.push(enemyShip.name);
        // greatestArmor = Math.max(greatestArmor, (ship2.armor));
      }
    }
    this.shipsInRangeByName = shipsInRange;
  }
  logShipSummary() {
    return;
    console.log(
      `Name: ${this.name}, Position: ${this.positionY}, ShipsInRange: ${this.shipsInRangeByName}, Count: ${this.count}, Hp: ${this.hp}`
    );
  }
}

function isAttackerSide(side) {
  return !!side;
}

function calculateAgro(enemyShipsInRange, enemyShip) {
  let greatestArmor = 0;
  let denominator = 0;
  enemyShipsInRange.forEach((ship) => {
    greatestArmor = Math.max(greatestArmor, ship.armor);
  });
  enemyShipsInRange.forEach(
    (ship) => (denominator += greatestArmor / ship.armor)
  );
  const share = greatestArmor / enemyShip.armor;

  return share / denominator;
}
function isInRange(attacker, target) {
  return Math.abs(attacker.positionY - target.positionY) <= attacker.range;
}

function calculateNavyShipCount(ships) {
  let navyShipCount = 0;
  ships.forEach((ship) => (navyShipCount += ship.count));
  return navyShipCount;
}

function isCollectingShip(ship) {
  const collectingShips = [
    'Large Transport Ship',
    'Small Transport Ship',
    'Assault Ship',
    'Landing Craft',
  ];

  return collectingShips.includes(ship.name);
}

class Navy {
  constructor(ships, side) {
    this.ships = ships;
    this.side = side;
    this.shipCount = calculateNavyShipCount(ships);
  }
  getAttackerShips() {
    return this.ships.filter((ship) => !isCollectingShip(ship));
  }
  getCollectingShips() {
    return this.ships.filter((ship) => isCollectingShip(ship));
  }
  getAliveShips() {
    return this.ships.filter((ship) => ship.count > 0);
  }
  moveAttackerShips() {
    this.getAttackerShips().forEach((ship) => ship.move());
  }
  moveCollectingStageShips() {
    this.getCollectingShips().forEach((ship) => ship.move());
  }
  checkShipsRange(enemyNavy) {
    this.getAttackerShips().forEach((ship) =>
      ship.checkEnemyShipInRange(enemyNavy.ships)
    );
  }

  checkSurvivalShips() {
    if (this.shipCount == 0) {
      return;
    }
    this.shipCount = calculateNavyShipCount(this.getAliveShips());
  }

  battleNavy(enemyNavy) {
    console.log('alive', this.getAliveShips());
    this.getAliveShips().forEach((ship) =>
      ship.attackEnemyShipInRange(enemyNavy.ships)
    );
  }
  logShips() {
    this.ships.forEach((ship) => ship.logShipSummary());
  }
}
class Game {
  constructor(navy1, navy2) {
    this.navy1 = navy1;
    this.navy2 = navy2;
  }
  //find better name
  runStep() {
    const { isCollectingStage } = this.checkCollectingStage();
    if (isCollectingStage) {
      console.log('Ships are going to collect');
      this.navy1.moveCollectingStageShips();
      // return;
    }
    this.logNavies();

    this.checkRanges();
    this.moveNavies();
    this.battleNavies();
    this.checkSurvivalStatus();
  }
  moveNavies() {
    this.navy1.moveAttackerShips(this.navy2);
    this.navy2.moveAttackerShips(this.navy1);
  }
  checkCollectingStage() {
    const isCollectingStage = this.navy1.shipCount / 2 >= this.navy2.shipCount;

    return { isCollectingStage };
  }
  checkRanges() {
    this.navy1.checkShipsRange(this.navy2);
    this.navy2.checkShipsRange(this.navy1);
  }
  checkSurvivalStatus() {
    this.navy1.checkSurvivalShips();
    this.navy2.checkSurvivalShips();
  }
  battleNavies() {
    this.navy1.battleNavy(this.navy2);
    this.navy2.battleNavy(this.navy1);
  }

  logNavies() {
    this.navy1.logShips();
    this.navy2.logShips();
  }

  start() {
    for (let phase = 0; phase < 15; phase++) {
      console.log(`Phase ${phase + 1}`);
      this.runStep();
    }
  }
}

function start() {
  // const user1Navy = [new ship(1, "FAC", 2, 4, 4, 1, 10, 8, 60, 4), new ship(1, "Large Transport Ship", 0, 0, 0, 2, 20, 3, 0, 5), new ship(1, "Assault Ship", 0, 0, 0, 1, 15, 10, 0, 4)];
  const navy1Ships = [
    new Ship(0, 'FAC1', 3, 4, 4, 1, 10, 8, 60, 4),
    new Ship(0, 'Corvette', 3, 3, 5, 2, 20, 5, 40, 2),
    new Ship(0, 'Large Transport Ship', 3, 3, 5, 2, 20, 5, 40, 2),
  ];
  const navy2Ships = [
    new Ship(1, 'FAC2', 3, 4, 4, 1, 10, 8, 60, 4),
    new Ship(1, 'Destroyer', 2, 2, 3, 1, 20, 7, 50, 4),

    // new Ship(1, 'Large Transport Ship', 3, 3, 5, 2, 20, 5, 40, 2),
  ];

  const navy1 = new Navy(navy1Ships, 0);
  const navy2 = new Navy(navy2Ships, 1);
  const game = new Game(navy1, navy2);

  game.start();
}
start();
