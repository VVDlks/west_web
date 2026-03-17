import Card from './Card.js';
import Game from './Game.js';
import TaskQueue from './TaskQueue.js';
import SpeedRate from './SpeedRate.js';
import card from "./Card.js";

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

    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };

    attack(gameContext, continuation) {
        const taskQueue = new TaskQueue();
        const {currentPlayer, oppositePlayer, updateView} = gameContext;

        taskQueue.push(onDone => this.view.showAttack(onDone));

        for (let i = 0; i < gameContext.oppositePlayer.table.length; i++) {
            const card = gameContext.oppositePlayer.table[i];
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
    quacks() { console.log('quack') };
    swims() { console.log('float: both;') };
}

// Основа для собаки.
class Dog extends Creature{
    constructor(name = 'Бандит', power = 3) {
        super(name, power);
    }
}

class Trasher extends Dog {
    constructor(name = 'Бандит', power = 5) {
        super(name, power);
    }
    modifyTakenDamage(value, fromCard, gameContext, continuation){
        this.view.signalAbility(() => {continuation(value - 1);})
    }

    getDescriptions (){
        const description = super.getDescriptions();
        return [...description, 'Громила: -1 урон'];
    }
}

// Колода Шерифа, нижнего игрока.
const seriffStartDeck = [
    new Duck(),
    new Duck(),
    new Duck(),
    new Gatling(),
];
const banditStartDeck = [
    new Trasher(),
    new Dog(),
    new Dog(),
];


// Создание игры.
const game = new Game(seriffStartDeck, banditStartDeck);

// Глобальный объект, позволяющий управлять скоростью всех анимаций.
SpeedRate.set(1);

// Запуск игры.
game.play(false, (winner) => {
    alert('Победил ' + winner.name);
});
