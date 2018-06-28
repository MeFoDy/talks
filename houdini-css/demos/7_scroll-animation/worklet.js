registerAnimator(
    'scroll-position-animator',
    class {
        constructor(options) {
            this.options = options;
        }

        animate(currentTime, effect) {
            effect.localTime = currentTime;
        }
    });
