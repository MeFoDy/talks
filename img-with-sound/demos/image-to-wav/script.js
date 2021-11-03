const fileInput = document.getElementById('file');
const goButton = document.getElementById('go');
const stopButton = document.getElementById('stop');
const canvas = document.getElementById('image');

const audio = document.getElementById('audio');

const audioCtx = new (AudioContext || webkitAudioContext)();

goButton.addEventListener(
    'click',
    function () {
        const file = fileInput.files[0];

        if (file === undefined) {
            return false;
        }

        if (!file.type.startsWith('image')) {
            return false;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = function () {
            audio.src = '';

            URL.revokeObjectURL(this.src);
            const w = (canvas.width = this.width);
            const h = (canvas.height = this.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            const data = ctx.getImageData(0, 0, w, h).data;

            const buffersCount = Math.round(h / w);
            const bufferLength = (data.length * 3) / 4 / buffersCount;
            const audioBuffer = new AudioBuffer({
                length: bufferLength,
                sampleRate: 44100,
                numberOfChannels: buffersCount,
            });

            for (let j = 0; j < buffersCount; j++) {
                const pixels = [];
                const dotsCount = data.length / 4 / buffersCount;
                for (let i = 0; i < dotsCount; i++) {
                    const index = j * dotsCount * 4 + i * 4;
                    const r = (data[index] * 2) / 255 - 1;
                    const g = (data[index + 1] * 2) / 255 - 1;
                    const b = (data[index + 2] * 2) / 255 - 1;
                    pixels.push(r);
                    pixels.push(g);
                    pixels.push(b);
                }
                const buffer = Float32Array.from(pixels);
                audioBuffer.copyToChannel(buffer, j, 0);
            }

            setBufferToAudio(audioBuffer, bufferLength, file.name);
        };
        img.src = url;
    },
    false
);

function setBufferToAudio(abuffer, total_samples, filename) {
    const objectUrl = URL.createObjectURL(bufferToWave(abuffer, total_samples));

    audio.src = objectUrl;
    audio.title = filename + '.wav';
}

// source: ttps://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/
function bufferToWave(abuffer, len) {
    var numOfChan = abuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [],
        i,
        sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952); // "RIFF"
    setUint32(length - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(abuffer.sampleRate);
    setUint32(abuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit (hardcoded in this demo)

    setUint32(0x61746164); // "data" - chunk
    setUint32(length - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < abuffer.numberOfChannels; i++)
        channels.push(abuffer.getChannelData(i));

    while (pos < length) {
        for (i = 0; i < numOfChan; i++) {
            // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++; // next source sample
    }

    // create Blob
    return new Blob([buffer], { type: 'audio/wav' });

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}
