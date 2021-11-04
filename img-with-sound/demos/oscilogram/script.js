const fileInput = document.getElementById('file');
const goButton = document.getElementById('go');
const stopButton = document.getElementById('stop');

const osciCanvas = document.getElementById('oscilogram');
const osciCanvasCtx = osciCanvas.getContext('2d');
osciCanvas.width = osciCanvas.offsetWidth * getCurrentPixelRatio(osciCanvas);
osciCanvas.height = osciCanvas.offsetHeight * getCurrentPixelRatio(osciCanvas);
let needToStop = false;
let isPlaying = false;

const audioCtx = new (AudioContext || webkitAudioContext)();

let activeSource = null;

stopButton.addEventListener('click', () => {
    reset();
});

goButton.addEventListener(
    'click',
    async function () {
        reset();

        const file = fileInput.files[0];

        if (file === undefined) {
            return false;
        }

        if (!file.type.startsWith('audio')) {
            return false;
        }

        const fileReader = new FileReader();
        fileReader.onload = async function (e) {
            showLoader();

            const buffer = await audioCtx.decodeAudioData(e.target.result);
            processOscillogram(buffer);

            playSound(buffer);
            drawProgress(buffer.duration);

            hideLoader();
        };
        fileReader.readAsArrayBuffer(file);
    },
    false
);

function showLoader() {
    document.querySelector('html').classList.add('loading');
}

function hideLoader() {
    document.querySelector('html').classList.remove('loading');
}

function reset() {
    if (isPlaying) {
        needToStop = true;

        if (activeSource) {
            activeSource.stop(0);
        }
    }
}
function resetOscillogramCanvas() {
    osciCanvasCtx.fillStyle = '#111';
    osciCanvasCtx.fillRect(0, 0, osciCanvas.width, osciCanvas.height);
}

function processOscillogram(buffer) {
    const leftBuffer = buffer.getChannelData(0);
    const hasMultipleChannels = buffer.numberOfChannels > 1;

    resetOscillogramCanvas();
    const h = osciCanvas.height;
    drawOscilogram(
        leftBuffer,
        0,
        hasMultipleChannels ? h / 2 : h,
        buffer.duration
    );

    if (hasMultipleChannels) {
        const rightBuffer = buffer.getChannelData(1);
        drawOscilogram(rightBuffer, h / 2, h / 2, buffer.duration);
    }
}

async function playSound(buffer) {
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    activeSource = source;

    // const splitterNode = new ChannelSplitterNode(audioCtx, {
    //     numberOfOutputs: 2,
    // });
    // const mergerNode = new ChannelMergerNode(audioCtx, {
    //     numberOfInputs: 1,
    // });
    // source.connect(splitterNode);
    // splitterNode.connect(mergerNode, 1, 0);
    // mergerNode.connect(audioCtx.destination);

    source.connect(audioCtx.destination);
    source.start(0);
    isPlaying = true;
    needToStop = false;
}

function drawOscilogram(buffer, y, h, d) {
    const w = osciCanvas.width;
    const yCenter = Math.floor(h / 2);

    const dotsCount = buffer.length;
    const dotsInPixel = Math.floor(dotsCount / w);
    const values = [];

    for (let i = 0; i < w; i++) {
        let sum = 0;
        for (let j = i * dotsInPixel; j < (i + 1) * dotsInPixel; j++) {
            sum += Math.pow(buffer[j], 2);
        }
        values.push(Math.sqrt(sum));
    }
    const maxValue = Math.ceil(Math.max(...values));

    osciCanvasCtx.fillStyle = 'royalblue';
    for (let i = 0; i < w; i++) {
        const currentValue = Math.round((values[i] / maxValue) * h * 0.8);
        osciCanvasCtx.fillRect(
            i,
            y + yCenter - currentValue / 2,
            1,
            currentValue
        );
    }
}

function drawProgress(d) {
    const start = audioCtx.currentTime;
    const w = osciCanvas.width;
    const ch = osciCanvas.height;
    const saved = osciCanvasCtx.getImageData(0, 0, w, ch);

    requestAnimationFrame(function x() {
        if (needToStop) {
            needToStop = false;
            return;
        }
        const c = (audioCtx.currentTime - start) % d;
        osciCanvasCtx.putImageData(saved, 0, 0);
        osciCanvasCtx.fillStyle = 'hsla(260, 80%, 30%, 0.5)';
        osciCanvasCtx.fillRect(0, 0, w * (c / d), ch);

        requestAnimationFrame(x);
    });
}

function getCanvasBackingStorePixelRatio(canvas) {
    const ctx = canvas.getContext('2d');
    return (
        ctx.backingStorePixelRatio ||
        ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        1
    );
}
function getCurrentPixelRatio(canvas) {
    const canvasPixelRatio = getCanvasBackingStorePixelRatio(canvas);
    return Math.max(canvasPixelRatio, window.devicePixelRatio);
}

CSS.registerProperty({
    name: '--h',
    syntax: '<integer>',
    inherits: false,
    initialValue: '0',
});
