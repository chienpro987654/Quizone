class Players {
    constructor () {
        this.players = [];
    }

    addPlayer(pin, name){
        var player = {pin, name};
        this.players.push(player);
        return player;
    }

    getPlayer(pin, name){
        return this.players.filter((player) => player.pin === pin && player.name === name)[0];
    }

    addDataPlayer(pin, name, counter, answer){
        var player = this.getPlayer(pin, name);
        player.data = {[counter]: answer};
        return player;
    }

    removePlayer(pin,name){
            var player = this.getPlayer(pin,name);
            
            if(player){
                this.players = this.players.filter((player) => player.pin !== pin && player.name !== name);
            }
            return player;
        }

    // addPlayer(hostId, playerId, name, gameData){
    //     var player = {hostId, playerId, name, gameData};
    //     this.players.push(player);
    //     return player;
    // }
    // removePlayer(playerId){
    //     var player = this.getPlayer(playerId);
        
    //     if(player){
    //         this.players = this.players.filter((player) => player.playerId !== playerId);
    //     }
    //     return player;
    // }
    // getPlayer(playerId){
    //     return this.players.filter((player) => player.playerId === playerId)[0]
    // }
    // getPlayers(hostId){
    //     return this.players.filter((player) => player.hostId === hostId);
    // }
}

module.exports = {Players};