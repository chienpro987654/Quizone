class Timer {
    constructor () {
        this.timers = [];
    }

    addTimer(pin, timer, counter){
        var timer = {pin, timer, counter};
        this.timers.push(timer);
        return timer;
    }

    getTimer(pin, counter){
        var obj = this.timers.filter((timer) => timer.pin === pin && timer.counter === counter)[0];
        return (obj) ? obj.timer : null;
    }

}

module.exports = {Timer};