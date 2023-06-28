class LiveGames {
    constructor() {
        this.games = [];
    }

    // addGame(pin, hostId, gameLive, gameData){
    //     var game = {pin, hostId, gameLive, gameData};
    //     this.games.push(game);
    //     return game;
    // }
    addGame(hostId, quizId, socketId, pin, finished, running) {
        var game = { hostId, quizId, socketId, pin, finished, running };
        this.games.push(game);
        return game;
    }

    updateGame(pin, socket_id) {
        var game = this.getGame(pin);

        if (game) {
            game.socket_id = socket_id;
        }
    }

    removeGame(hostId) {
        var game = this.getGame(hostId);

        if (game) {
            this.games = this.games.filter((game) => game.hostId !== hostId);
        }
        return game;
    }

    // getGame(hostId){
    //     return this.games.filter((game) => game.hostId === hostId)[0];
    // }

    getGame(pin) {
        return this.games.filter((game) => game.pin === pin)[0];
    }

    // isDuplicate(pin) {
    //     return this.games.filter((game) => game.pin === pin);
    // }
}

module.exports = { LiveGames };