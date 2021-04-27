const { createGame } = require('../controllers/games');
const { users } = require('./rooms');
const { drawTile, setRackWithTiles, checkBoard } = require('./game');
const { updateBalance } = require('../controllers/users');
const pointRate = { 3: 1, 10: 0.9, 32: 0.875, 100: 0.85 };
function createSocket(app) {
    const server = require("http").createServer(app,{cors:{ origin: '*', methods: ['GET', 'POST'] }});
    const io = require("socket.io")(server);
    io.on("connection", socket => {
        console.log("New client connected");
        let room, player, plys, rId, num;
        socket.on('user', id => {
            room = users[id];
            if (room) {
                plys = room.players;
                player = plys.find(p => p.id === id);
                player.sId = socket.id;
                num = room.numOfPlys;
                rId = room.id;
                socket.join(rId);
                if (num === plys.length && plys.every(p => p.sId)) {
                    let points = '-' + room.points;
                    for (const p of plys) {
                        const s = p.sId === socket.id ? socket : socket.to(p.sId);
                        s.emit('setRack', setRackWithTiles(room.tiles));
                        updateBalance(p.id, points);
                        p.init = true;
                    }
                    io.to(rId).emit('start', plys, room.tiles.length);
                    room.start = Date.now();
                }
            } else
                socket.disconnect();
        });
        const newTurn = () => {
            let i = ++room.turn % num;
            while (plys[i].left)
                i = ++room.turn % num;
            io.to(rId).emit('newTurn', i, room.tiles.length);
        }
        socket.on('turnEnd', (board, tRS, tRE) => {
            let tiles = checkBoard(board, player), draw;
            if (tiles) {
                tiles.push(drawTile(room.tiles));
                draw = room.tiles.length;
            } else {
                if (!tRE)
                    return endGame(player.id);
                room.board = board;
                tiles = [];
                draw = tRE === tRS;
            }
            draw && tiles.push(drawTile(room.tiles));
            if (tiles.length)
                socket.emit('tiles', tiles);
            else if (tRS > 32 && (tRS - tRE !== tRE % 2))
                socket.emit('trim', tRE);
            draw !== true && io.to(rId).emit('boardChange', room.board);
            if (room.tiles.length)
                newTurn();
            else
                io.to(rId).emit('sendRack');
        });
        socket.on('board', board => socket.to(rId).emit('boardChange', board));
        socket.on('evalRack', rack => {
            player.rack = rack.reduce((p, t) => p + (t && (t.num === 'J' ? 30 : t.num)));
            if (plys.every(p => p.left || p.rack)) {
                let min = plys[0].rack, p = 0;
                for (let i = 1; i < num; i++)
                    if (min > plys[i].rack) {
                        min = plys[i].rack;
                        p = i;
                    }
                endGame(plys[p].id);
            }
        });
        socket.on('leave', () => {
            if (!room.start) {
                plys.splice(plys.findIndex(p => p.id === player.id), 1);
                delete users[player.id];
                socket.disconnect();
            }
        })
        const endGame = winner => {
            let po = room.points, poWon = po * num * pointRate[po];
            updateBalance(winner, '+' + poWon);
            io.to(rId).emit('gameEnd', winner, poWon);
            let dif = (Date.now() - room.start) / 1000, m = dif / 60 | 0, s = Math.round(dif % 60);
            room.start = 0;
            createGame(po, poWon, m + ':' + (s < 10 ? '0' + s : s), winner, plys.map(p => p.id));
        }
        socket.on("disconnect", reason => {
            console.log("Client disconnected because of " + reason);
            if (reason !== 'server namespace disconnect') {
                let i = plys.findIndex(p => p.id === player.id);
                if (room.start) {
                    player.left = true;
                    let remainP = plys.filter(p => !p.left);
                    if (remainP.length === 1)
                        endGame(remainP[0].id);
                    else if (i === room.turn % num) {
                        socket.to(rId).emit('boardChange', room.board);
                        newTurn();
                    }
                } else if (room.start !== 0)
                    plys.splice(i, 1);
                delete users[player.id];
            }
        });
    });
    return server;
}
module.exports = createSocket;