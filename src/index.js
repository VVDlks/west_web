import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';

// Отвечает является ли карта уткой.
function isDuck(card) {
    return card && card.quacks && card.swims;
}

// Отвечает является ли карта собакой.
function isDog(card) {
    return card instanceof Dog;
}

// Дает описание существа по схожести с утками и собаками
function getCreatureDescription(card) {
    if (isDuck(card) && isDog(card)) {
        return 'Утка-Собака';
    }
    if (isDuck(card)) {
        return 'Утка';
    }
    if (isDog(card)) {
        return 'Собака';
    }
    return 'Существо';
}

class Creature extends Card {
    constructor(name, maxPower) {
        super(name, maxPower);
    }

    getDescriptions() {
        const creatureDescription = getCreatureDescription(this);
        const description = super.getDescriptions();
        return [creatureDescription, ...description];
    }
}

class Gatling extends Creature {
    constructor(name = 'Гатлинг', power = 6) {
        super(name, power);
    }

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for (let i = 0; i < oppositePlayer.table.length; i++) {
            const card = oppositePlayer.table[i];
            if (card) {
                const cardContext = {
                    currentPlayer,
                    oppositePlayer,
                    position: i,
                    updateView
                };

                taskQueue.push(onDone => {
                    this.dealDamageToCreature(2, card, cardContext, onDone);
                });
            }
        }

        taskQueue.continueWith(continuation);
    }
}

// Основа для утки.
class Duck extends Creature {
    constructor(name = 'Мирная утка', power = 2) {
        super(name, power);
    }

    quacks() {
        console.log('quack');
    }

    swims() {
        console.log('float: both;');
    }
}

// Основа для собаки.
class Dog extends Creature {
    constructor(name = 'Бандит', power = 3) {
        super(name, power);
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Gatling(), // Гатлинг на позиции 0
    new Dog('Бандит', 3),
];

// Колода Бандита, верхнего игрока.
const banditStartDeck = [
    new Dog('Бандит', 3),
    new Dog('Бандит', 3),
    new Dog('Бандит', 3),
    new Dog('Пес-бандит', 3),
];

// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});