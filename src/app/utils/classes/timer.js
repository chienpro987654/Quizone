class Timer {
    constructor () {
        this.timers = [];
    }

    addTimer(pin, timer, counter){
        var timer = {pin, timer, counter};
        this.timers.push(timer);
        return timer;
    }

    getTimer(pin){
        return this.timers.filter((timer) => timer.pin === pin)[0].timer;
    }

}

module.exports = {Timer};