import { DrumPad } from "./DrumPad.js";
import { StreamDeck } from "./StreamDeck.js";

// Mapping of the buttons, paged
const buttonConfig = [
    {
        0: {
			label: 'Guitar',
			keyCode: 'Digit1',
			textColor: '#fff',
			action: function(e) {
				this.activeButtonPageAtIndex(0);
			},
		},
		1: {
			label: 'Piano',
			keyCode: 'Digit2',
			action: function(e) {
				this.activeButtonPageAtIndex(1);
			},
		},
        3: {
            image: "pictures/drums.png",
            width: 1024,
            height: 765,
            // label: "Drums",
            keyCode: "KeyQ",
            audio: "sounds/drums-fast.wav",
            action: function (e) {
                this.playSound("KeyQ", 0.5);
            },
        },
        5: {
            // image: "pictures/guitar.png",
            // width: 822,
            // height: 2463,
            label: "B",
            keyCode: "KeyA",
            audio: "sounds/b.wav",
            action: function (e) {
                this.playSound("KeyA");
            },
        },
        6: {
            label: "C",
            keyCode: "KeyS",
            audio: "sounds/c.wav",
            action: function (e) {
                this.playSound("KeyS");
            },
        },
        7: {
            label: "D",
            keyCode: "KeyD",
            audio: "sounds/d.wav",
            action: function (e) {
                this.playSound("KeyD");
            },
        },
        8: {
            label: "E",
            keyCode: "KeyF",
            audio: "sounds/e.wav",
            action: function (e) {
                this.playSound("KeyF");
            },
        },
        9: {
            label: "G",
            keyCode: "KeyG",
            audio: "sounds/g.wav",
            action: function (e) {
                this.playSound("KeyG");
            },
        },
    },
    {
        0: {
			label: 'Guitar',
			keyCode: 'Digit1',
			action: function(e) {
				this.activeButtonPageAtIndex(0);
			},
		},
		1: {
			label: 'Piano',
			keyCode: 'Digit2',
			textColor: '#fff',
			action: function(e) {
				this.activeButtonPageAtIndex(1);
			},
		},
        3: {
            image: "pictures/drums.png",
            width: 1024,
            height: 765,
            // label: "Drums",
            keyCode: "KeyQ",
            audio: "sounds/drums-fast.wav",
            action: function (e) {
                this.playSound("KeyQ", 0.5);
            },
        },
        5: {
            label: "C",
            keyCode: "KeyX",
            audio: "sounds/pC.wav",
            action: function (e) {
                this.playSound("KeyX", 0.2);
            },
        },
        6: {
            label: "D",
            keyCode: "KeyC",
            audio: "sounds/pDd.wav",
            action: function (e) {
                this.playSound("KeyC", 0.2);
            },
        },
        7: {
            label: "E",
            keyCode: "KeyV",
            audio: "sounds/pE.wav",
            action: function (e) {
                this.playSound("KeyV", 0.2);
            },
        },
        8: {
            label: "G",
            keyCode: "KeyB",
            audio: "sounds/pG.wav",
            action: function (e) {
                this.playSound("KeyB", 0.2);
            },
        },
        10: {
            // image: "pictures/guitar.png",
            // width: 822,
            // height: 2463,
            label: "B2",
            keyCode: "KeyN",
            audio: "sounds/pB.wav",
            action: function (e) {
                this.playSound("KeyN", 0.2);
            },
        },
        11: {
            label: "C2",
            keyCode: "KeyM",
            audio: "sounds/pC2.wav",
            action: function (e) {
                this.playSound("KeyM", 0.2);
            },
        },
    },
];

const go = async () => {
    const drumPad = new DrumPad(buttonConfig, document.querySelector("#app"));
    await drumPad.init();

    if (navigator.hid) {
        const streamDeck = new StreamDeck();

        // Connect to previously connected device
        await streamDeck.connect();

        // A previously connected device was found
        if (streamDeck.isConnected) {
            drumPad.attachStreamDeck(streamDeck);
        }

        // No Previously connected device was found
        else {
            // Add button to connect new device
            const elem = document.createElement("button");
            elem.type = "button";
            elem.innerText = "Connect Stream Deck";
            elem.style = "position: absolute;top: 100px;left:100px;z-index:100";
            elem.addEventListener("click", async () => {
                elem.remove();
                await streamDeck.connect(true);
                drumPad.attachStreamDeck(streamDeck);
            });
            document.body.appendChild(elem);
        }

        streamDeck.setBrightness(90);
    }
};
go();
