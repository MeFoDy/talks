registerAnimator('parallax', class {
    constructor(options) {
        this._rate = options.rate;
    }

    animate(currentTime, effect) {
        effect.localTime = currentTime * this._rate;
    }
});
