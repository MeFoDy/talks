const fileInput = document.getElementById('file');
const goButton = document.getElementById('go');
const stopButton = document.getElementById('stop');

const canvas = document.getElementById('image');
const canvasCtx = canvas.getContext('2d');
canvas.width = canvas.offsetWidth * getCurrentPixelRatio(canvas);
canvas.height = canvas.offsetHeight * getCurrentPixelRatio(canvas);

const audioCtx = new (AudioContext || webkitAudioContext)();

let activeSource = null;

stopButton.addEventListener('click', () => {
    activeSource?.stop();
});

goButton.addEventListener(
    'click',
    function () {
        const file = fileInput.files[0];

        if (file === undefined) {
            return false;
        }

        if (!file.type.startsWith('audio')) {
            return false;
        }

        const fileReader = new FileReader();
        fileReader.onload = async function (e) {
            const buffer = await audioCtx.decodeAudioData(e.target.result);
            playSound(buffer);
        };
        fileReader.readAsArrayBuffer(file);
    },
    false
);

function playSound(buffer) {
    activeSource?.stop();

    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;

    source.connect(audioCtx.destination);
    source.start(0);
    activeSource = source;

    drawSound(source);
}

function drawSound(source) {
    const buffers = [];
    const buffersCount = source.buffer.numberOfChannels;

    for (let i = 0; i < buffersCount; i++) {
        buffers.push(source.buffer.getChannelData(i));
    }

    const size = Math.ceil(Math.sqrt(buffers[0].length / 3));
    const cellSize = 1;
    const h = (canvas.height = size * cellSize * buffersCount);
    const w = (canvas.width = size * cellSize);

    canvasCtx.fillStyle = '#000';
    canvasCtx.fillRect(0, 0, w, h);

    for (let i = 0; i < buffersCount; i++) {
        const buffer = buffers[i];

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const index = (y * size + x) * 3;
                const r = Math.floor((255 * (buffer[index] + 1)) / 2);
                const g = Math.floor((255 * (buffer[index + 1] + 1)) / 2);
                const b = Math.floor((255 * (buffer[index + 2] + 1)) / 2);
                const fillStyle = `rgb(${r}, ${g}, ${b})`;
                canvasCtx.fillStyle = fillStyle;
                canvasCtx.fillRect(
                    x * cellSize,
                    y * cellSize + i * w,
                    cellSize,
                    cellSize
                );
            }
        }
    }
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
