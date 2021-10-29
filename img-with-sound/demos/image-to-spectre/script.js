const fileInput = document.getElementById('file');
const goButton = document.getElementById('go');
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
            URL.revokeObjectURL(this.src);
            const w = (canvas.width = this.width);
            const h = (canvas.height = this.height);
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            const imgData = ctx.getImageData(0, 0, w, h).data;

            const durationSeconds = 10;
            const sampleRate = 44100;
            const channelsCount = 1;
            const samplesCount = Math.round(sampleRate * durationSeconds);
            const maxPossibleFrequency = 20000; // Hz
            const coeff = maxPossibleFrequency / h;
            const samplesPerLineX = Math.floor(samplesCount / w);
            const samples = [];
            let maxFreq = -Infinity;
            let yFactor = 2;

            for (let i = 0; i < samplesCount; i++) {
                const x = Math.floor(i / samplesPerLineX);
                let reX = 0;

                for (let y = 0; y < h; y += yFactor) {
                    const index = (y * w + x) * 4;
                    const r = imgData[index];
                    const g = imgData[index + 1];
                    const b = imgData[index + 2];

                    const sum = r + b + g;
                    const volume = Math.pow((sum / (255 * 3)) * 100, 2);

                    const freq = Math.round(coeff * (h - y + 1));
                    reX += Math.floor(
                        volume * Math.cos((freq * 2 * Math.PI * i) / sampleRate)
                    );
                }

                samples.push(reX);

                if (Math.abs(reX) > maxFreq) {
                    maxFreq = Math.abs(reX);
                }
            }

            const waveData = samples.map((s) => (32767 * s) / maxFreq);
            const wave = new RIFFWAVE();
            wave.header.sampleRate = sampleRate;
            wave.header.numChannels = channelsCount;
            wave.header.bitsPerSample = 16;
            wave.Make(waveData);
            const tBlob = dataURLtoBlob(wave.dataURI);

            console.log(tBlob);

            audio.src = wave.dataURI;
            audio.title = file.name + '.wav';
        };
        img.src = url;
    },
    false
);

// https://stackoverflow.com/questions/23150333/html5-javascript-dataurl-to-blob-blob-to-dataurl/30407959#30407959
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','),
        mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]),
        n = bstr.length,
        u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
