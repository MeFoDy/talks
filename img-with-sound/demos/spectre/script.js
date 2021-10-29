const fileInput = document.getElementById('file');
const goButton = document.getElementById('go');
const stopButton = document.getElementById('stop');
const logarithmCheckbox = document.getElementById('logarithm');

const osciCanvas = document.getElementById('oscilogram');
const osciCanvasCtx = osciCanvas.getContext('2d');
osciCanvas.width = osciCanvas.offsetWidth * getCurrentPixelRatio(osciCanvas);
osciCanvas.height = osciCanvas.offsetHeight * getCurrentPixelRatio(osciCanvas);
let needToStop = false;
let isPlaying = false;

const spectreCanvas = document.getElementById('spectre');
const spectreCanvasCtx = spectreCanvas.getContext('2d');

const audioCtx = new (AudioContext || webkitAudioContext)();

let activeSource = null;
let activeAnalyzer = null;

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
            const buffer = await audioCtx.decodeAudioData(e.target.result);
            playSound(buffer);
            process(buffer);
        };
        fileReader.readAsArrayBuffer(file);
    },
    false
);

function reset() {
    if (isPlaying) {
        needToStop = true;

        if (activeSource) {
            activeSource.stop(0);
        }
    }
}

function resetSpectreCanvas() {
    spectreCanvasCtx.fillStyle = '#111';
    spectreCanvasCtx.fillRect(0, 0, spectreCanvas.width, spectreCanvas.height);
}

function resetOscillogramCanvas() {
    osciCanvasCtx.fillStyle = '#111';
    osciCanvasCtx.fillRect(0, 0, osciCanvas.width, osciCanvas.height);
}

function process(buffer) {
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

    resetSpectreCanvas();
    await drawSpectre(buffer);
}

async function drawSpectre(audioBuffer) {
    const isLogarithmic = logarithmCheckbox.checked;
    if (isLogarithmic) {
        spectreCanvas.classList.add('logarithmic');
        osciCanvas.classList.add('logarithmic');
    } else {
        spectreCanvas.classList.remove('logarithmic');
        osciCanvas.classList.remove('logarithmic');
    }

    spectreCanvas.width =
        spectreCanvas.offsetWidth * getCurrentPixelRatio(spectreCanvas);
    spectreCanvas.height =
        spectreCanvas.offsetHeight * getCurrentPixelRatio(spectreCanvas);

    const config = {
        fftResolution: 4096,
        smoothingTimeConstant: 0.02,
        processorBufferSize: 2048,
    };

    const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    );
    const offlineSource = offlineCtx.createBufferSource();
    offlineSource.buffer = audioBuffer;
    offlineSource.channelCount = audioBuffer.numberOfChannels;

    const generalAnalyzer = offlineCtx.createAnalyser();
    generalAnalyzer.fftSize = config.fftResolution;
    generalAnalyzer.smoothingTimeConstant = config.smoothingTimeConstant;

    const channelFFtDataBuffer = new Uint8Array(
        (audioBuffer.length / config.processorBufferSize) *
            (config.fftResolution / 2)
    );

    offlineSource.connect(generalAnalyzer);
    const channelDbRange = {
        minDecibels: generalAnalyzer.minDecibels,
        maxDecibels: generalAnalyzer.maxDecibels,
    };

    offlineCtx.createScriptProcessor =
        offlineCtx.createScriptProcessor || offlineCtx.createJavaScriptNode;
    const processor = offlineCtx.createScriptProcessor(
        config.processorBufferSize,
        1,
        1
    );
    let offset = 0;
    processor.onaudioprocess = (e) => {
        const freqData = new Uint8Array(
            channelFFtDataBuffer.buffer,
            offset,
            generalAnalyzer.frequencyBinCount
        );
        generalAnalyzer.getByteFrequencyData(freqData);

        offset += generalAnalyzer.frequencyBinCount;
    };
    offlineSource.connect(processor);
    processor.connect(offlineCtx.destination);

    offlineSource.start(0);

    await offlineCtx.startRendering();

    const data = {
        channel: channelFFtDataBuffer,
        channelDbRange: channelDbRange,
        stride: generalAnalyzer.frequencyBinCount,
        tickCount: Math.ceil(audioBuffer.length / config.processorBufferSize),
        maxFreq: offlineCtx.sampleRate / 2,
        duration: audioBuffer.duration,
    };

    const w = spectreCanvas.width;
    const h = spectreCanvas.height;
    const ticksPerLine = Math.ceil(data.tickCount / w);
    const cellHeight = h / data.stride;
    const cellWidth = w / (data.tickCount / ticksPerLine);

    spectreCanvasCtx.fillStyle = 'hsl(280, 100%, 10%)';
    spectreCanvasCtx.fillRect(0, 0, w, h);
    const sColor = '100%';
    const logScale = new LogScale(0, data.stride);

    for (let i = 0; i < w; i++) {
        const startIndex = i * ticksPerLine * data.stride;
        for (let j = 0; j < data.stride; j++) {
            let index;
            if (isLogarithmic) {
                const channelIndex = Math.floor(
                    logScale.linearToLogarithmic(j / data.stride)
                );
                index = startIndex + channelIndex;
            } else {
                index = startIndex + j;
            }
            const db = data.channel[index] / 255;
            const hColor = Math.round((db * 120 + 280) % 360);
            const lColor = 10 + 70 * db + '%';
            spectreCanvasCtx.fillStyle = `hsl(${hColor}, ${sColor}, ${lColor})`;
            spectreCanvasCtx.fillRect(
                i * cellWidth,
                h - cellHeight * j,
                cellWidth,
                cellHeight
            );
        }
    }
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

    const start = audioCtx.currentTime;
    const ch = osciCanvas.height;
    const saved = osciCanvasCtx.getImageData(0, 0, w, ch);
    requestAnimationFrame(function x() {
        if (needToStop) {
            needToStop = false;
            return;
        }
        const c = (audioCtx.currentTime - start) % d;
        console.log(c, d);
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

// https://github.com/TeespringLabs/log-scale/blob/master/log_scale.js
/**
 * Constructor
 * @param {Number} minValue
 * @param {Number} maxValue
 */
function LogScale(minValue, maxValue) {
    this.minValue = minValue;
    this.maxValue = maxValue;
}
/**
 * Gets the range between the min and max values
 * @returns {Number}
 */
LogScale.prototype.getRange = function () {
    return this.maxValue - this.minValue;
};

/**
 * Maps linear 0-1 point to logarithmic scale between min and max
 * f(0) = minValue
 * f(1) = maxValue
 * f(x) = (range + 1)^x + minValue
 * @param linearValue {Number} from 0 to 1 in linear scale
 * @returns {Number} between min and max inclusive
 */
LogScale.prototype.linearToLogarithmic = function (linearValue) {
    var value = Math.round(
        Math.pow(this.getRange() + 1, linearValue) + this.minValue - 1
    );

    if (value < this.minValue) {
        value = this.minValue;
    } else if (value > this.maxValue) {
        value = this.maxValue;
    }

    return value;
};
/**
 * Maps a logarithmic value to a fractional point between 0-1 on the scale
 * g(minValue) = 0
 * g(maxValue) = 1
 * g(x) = log(base range + 1)(x)
 * @param value {Number}
 * @returns {Number} 0 to 1
 */
LogScale.prototype.logarithmicToLinear = function (value) {
    var normalizedValue = value - this.minValue + 1;

    if (normalizedValue <= 0) {
        return 0;
    } else if (value >= this.maxValue) {
        return 1;
    } else {
        return Math.log(normalizedValue) / Math.log(this.getRange() + 1);
    }
};
