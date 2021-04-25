class Tile {
    constructor(num, color) {
        this.num = num;
        this.color = color;
        this.board = false;
    }
}
const BS = { 64: { c: 16, r: 4, n: 120 }, 120: { c: 20, r: 6, n: 225 }, 225: { c: 25, r: 9 } };
function createAllTiles() {
    const allTiles = [], colors = ["black", "red", "orange", "blue"];
    for (let d = 0; d < 2; d++) {
        for (let i = 1; i < 14; i++) {
            for (let j = 0; j < 4; j++)
                allTiles.push(new Tile(i, colors[j]));
        }
        allTiles.push(new Tile("J", "joker"));
    }
    return allTiles;
}
function drawTile(tiles) {
    return tiles.splice(Math.random() * tiles.length | 0, 1)[0];
}
function setRackWithTiles(tiles) {
    const r = [];
    for (let i = 0; i < 14; i++)
        r.push(drawTile(tiles));
    return r.concat(...Array(18));
}
function validRun(tiles, len) {
    for (let i = 1; i < len; i++) {
        const n = tiles[i].num, prev = tiles[i - 1].num;
        if (n === 1 || prev === 13)
            return false;
        if (n !== 'J')
            if (prev !== 'J') {
                if (n !== prev + 1)
                    return false;
            } else if (i > 1 && n !== tiles[i - 2].num + 2)
                return false;
    }
    return true;
}
function validSet(tiles, len) {
    if (len < 3)
        return false;
    const j = tiles.filter(t => t.num === 'J').length;
    if (j === 2)
        return false;
    else if (j === 0) {
        const c = tiles[0].color;
        if (c === tiles[1].color) {
            for (let i = 1; i < len; i++)
                if (tiles[i].num !== tiles[i - 1].num + 1 || tiles[i].color !== c)
                    return false;
            return true;
        }
        if (len > 4)
            return false;
        for (let i = 1; i < len; i++)
            if (tiles[len - 1].color === tiles[i - 1].color || tiles[i].num !== tiles[0].num)
                return false;
        if (len === 3)
            return true;
        return c !== tiles[2].color && tiles[1].color !== tiles[2].color;
    } else {
        const colors = { 'black': 0, 'orange': 0, 'blue': 0, 'red': 0 };
        const noJoke = tiles.filter(t => t.num !== 'J');
        for (const tile of noJoke)
            colors[tile.color]++;
        for (const c in colors)
            if (colors[c] > 1)
                return colors[c] === len - 1 && validRun(tiles, len);
        const n = noJoke[0].num, valid = len < 5 && n === noJoke[1].num;
        return valid && (len === 3 || n === noJoke[2].num);
    }
}
function sumSets(sets, sum) {
    for (const set of sets) {
        const noJoke = set.filter(t => t.num !== 'J'), len = set.length;
        if (len > noJoke.length) {
            if (noJoke[0].num === noJoke[1].num)
                sum += len * noJoke[0].num;
            else
                for (let i = 0; i < len; i++)
                    if (set[i].num === 'J')
                        if (i === 0)
                            sum += set[i + 1].num - 1;
                        else
                            sum += set[i - 1].num + 1;
                    else
                        sum += set[i].num;
        } else
            set.forEach(t => sum += t.num);
    }
    return sum;
}
function validBoard(board, len, player, set) {
    const { c, r } = BS[len], iSets = player.init && [];
    for (let i = 0; i < r; i++) {
        const row = board.slice(i * c, (i + 1) * c).concat(undefined);
        for (const t of row)
            if (t)
                set.push(t);
            else if (set.length)
                if (validSet(set, set.length)) {
                    if (iSets && set.some(t => !t.board)) {
                        if (set.some(t => t.board))
                            return false;
                        iSets.push(set);
                    }
                    set = [];
                } else
                    return false;
    }
    if (iSets && iSets.length)
        if (sumSets(iSets, 0) < 30)
            return false;
        else
            player.init = false;
    return true;
}
function boardGrow(board, len) {
    const { c, r, n } = BS[len], { c: c1, r: r1 } = BS[n];
    const r2 = Array((r1 - r) * c1), c2 = Array(c1 - c);
    board.splice(len, 0, ...r2);
    for (let i = r; i > 0; i--)
        board.splice(c * i, 0, ...c2);
}
function checkBoard(board, player) {
    const tiles = board.filter(t => t && !t.board), len = board.length;
    if (!validBoard(board, len, player, []))
        return tiles;
    tiles.forEach(t => t.board = true);
    if (len < 225 && board.filter(t => t).length > len * .4)
        boardGrow(board, len);
}
module.exports = { createAllTiles, setRackWithTiles, drawTile, checkBoard };