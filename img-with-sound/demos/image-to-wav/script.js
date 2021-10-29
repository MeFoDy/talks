const fileInput = document.getElementById('file');
const goButton = document.getElementById('go');
const stopButton = document.getElementById('stop');
const canvas = document.getElementById('image');

const audio = document.getElementById('audio');

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

        if (!file.type.startsWith('image')) {
            return false;
        }

        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = function () {
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

            const source = audioCtx.createBufferSource();
            source.buffer = audioBuffer;
            source.loop = true;
            source.connect(audioCtx.destination);
            source.start(0);
            activeSource = source;
        };
        img.src = url;
    },
    false
);
