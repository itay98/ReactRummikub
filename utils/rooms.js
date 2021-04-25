const users = require('../socket'), { createAllTiles } = require('./game');
let count = 1;
class Room {
    constructor(points,num) {
        this.id = 'room' + count++;
        this.players = [];
        this.turn = 0;
        this.tiles = createAllTiles();
        this.board = Array(64).fill(false);
        this.points = points;
        this.numOfPlys = num;
    }
}
const waitingRoom = {};
function joinRoom(user, players, points) {
    let room = waitingRoom[players + '-' + points];
    if(!room || room.players.length === players){
        room = new Room(points,players);
        waitingRoom[players + '-' + points] = room;
    }
    room.players.push(user);
    users[user.id] = room;
}
module.exports = { joinRoom };