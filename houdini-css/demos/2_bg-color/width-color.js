registerPaint('width-color', class {
    static get inputProperties() {
        return [
            'width',
            'height',
        ];
    }

    static get contextOptions() {
        return {
            alpha: true
        };
    }

    static get inputArguments() { return ['<number>']; }

    paint(ctx, geom, properties, args) {
        const
            w = geom.width,
            h = geom.height;
        const firstColor = `hsl(${Math.ceil(w / 2)}, 70%, 50%)`;
        const secondColor = `hsl(${Math.ceil(h / 2)}, 70%, 50%)`;
        var grd = ctx.createLinearGradient(0, 0, w, h);
        grd.addColorStop(0, firstColor);
        grd.addColorStop(1, secondColor);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, w, h);
    }
});
