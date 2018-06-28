isWorkletReady
    .then(() => {
        const animatorName = 'scroll-position-animator';

        const scrollSource = document.querySelector('.page-wrapper');
        const positionElement = document.querySelector('.scroll-position');

        const headerHeight = document.querySelector('.header').clientHeight;
        const windowWidth = document.querySelector('.header').clientWidth;
        const footerOffsetTop = document.querySelector('.site-footer').offsetTop;
        const pageHeight = scrollSource.scrollHeight;

        const positionFrames = [
            new KeyframeEffect(
                positionElement,
                [
                    { 'transform': `translateX(-${windowWidth}px)` },
                    { 'transform': `translateX(${0}px)` }
                ],
                {
                    duration: 1,
                    iterations: 1,
                    fill: 'both',
                }),
        ];
        const positionTimeline = new ScrollTimeline({
            orientation: 'block',
            timeRange: 1,
            scrollSource,
            //startScrollOffset: headerHeight + 'px',
            //endScrollOffset: (footerOffsetTop - scrollSource.clientHeight) + 'px',
        });
        const positionAnimation = new WorkletAnimation(animatorName, positionFrames, positionTimeline);
        positionAnimation.play();

    }).catch(console.error);
