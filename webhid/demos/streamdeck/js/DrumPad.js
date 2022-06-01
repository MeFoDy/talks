class DrumPad {
    targetNode = null;
    buttonConfig = null;
    streamDeck = null;
    activePageIndex = null;

    constructor(buttonConfig, targetNode) {
        this.targetNode = targetNode;
        this.buttonConfig = buttonConfig;

        for (const pageConfig of this.buttonConfig) {
            for (const [buttonIndex, entry] of Object.entries(pageConfig)) {
                console.log(entry);
                if (entry.action) entry.action = entry.action.bind(this);
            }
        }
    }

    init = async () => {
        this.bindEvents();
        this.render();
        await this.activeButtonPageAtIndex(0);
    };

    bindEvents = () => {
        document.addEventListener("keydown", (e) => {
            const $button = document.querySelector(
                `button[data-page-index="${this.activePageIndex}"][data-keycode="${e.code}"]`
            );
            if ($button) {
                $button.focus();
                $button.click();
            }
        });

        document.addEventListener("click", (e) => {
            if (e.target.nodeName == "BUTTON") {
                const buttonConfig =
                    this.buttonConfig[
                        e.target.getAttribute("data-page-index")
                    ]?.[e.target.getAttribute("data-button-index")] ?? null;
                if (buttonConfig && buttonConfig.action) {
                    buttonConfig.action(e);
                }
            }
        });
    };

    activeButtonPageAtIndex = async (pageIndex) => {
        if (pageIndex !== this.activePageIndex) {
            this.activePageIndex = pageIndex;
            this.targetNode.setAttribute(
                "data-active-page-index",
                this.activePageIndex
            );
            if (this.streamDeck) {
                await this.streamDeck.clearAllButtons();
                await this.drawStreamDeckButtons();
            }
        }
    };

    playSound = (keyCode, volume) => {
        const $el = document.getElementById(keyCode);

        if (!$el) {
            return;
        }

        $el.currentTime = 0;
        if (volume) $el.volume = volume;
        $el.play().catch((error) => {
            alert(
                "Could not play audio. Please interact with the document first by clicking anywhere on the page."
            );
        });
    };

    attachStreamDeck = async (streamDeck) => {
        this.streamDeck = streamDeck;

        await this.streamDeck.clearAllButtons();

        this.streamDeck.addEventListener("keydown", (e) => {
            const $button = document.querySelector(
                `button[data-page-index="${this.activePageIndex}"][data-button-index="${e.detail.buttonId}"]`
            );
            if ($button) {
                $button.focus();
                $button.click();
            }
        });

        await this.drawStreamDeckButtons();
    };

    drawTextOnStreamDeckButtonAtIndex = async (
        index,
        textString,
        backgroundColor,
        textColor
    ) => {
        var ICON_SIZE = 72,
            ICON_SIZE_HALF = ICON_SIZE / 2,
            canvas = new OffscreenCanvas(ICON_SIZE, ICON_SIZE),
            ctx = canvas.getContext("2d"),
            fontSize = 12;

        canvas.width = ICON_SIZE;
        canvas.height = ICON_SIZE;

        // Text was rotated 180 degrees. This fixes it somehow …
        ctx.translate(ICON_SIZE_HALF, ICON_SIZE_HALF);
        ctx.rotate((180 * Math.PI) / 180);
        ctx.translate(ICON_SIZE_HALF * -1, ICON_SIZE_HALF * -1);

        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = `normal bold ${fontSize}px sans-serif`;
        ctx.fillStyle = textColor;

        var textWidth = ctx.measureText(textString).width;

        ctx.fillText(
            textString,
            canvas.width / 2 - textWidth / 2,
            (canvas.height + fontSize) / 2
        );

        await this.streamDeck.fillCanvas(index, canvas);
    };

    drawStreamDeckButtons = async () => {
        Object.entries(this.buttonConfig[this.activePageIndex]).forEach(
            async ([index, button]) => {
                if (button.label) {
                    await this.drawTextOnStreamDeckButtonAtIndex(
                        index,
                        button.label,
                        button.bgColor ?? "black",
                        button.textColor ?? "red"
                    );
                } else if (button.image) {
                    await this.streamDeck.fillURL(index, button.image, true);
                }
            }
        );
    };

    render = () => {
        this.targetNode.innerHTML = `
			<div class="streamdeck">
				${this.buttonConfig
                    .map((pageButtons, pageIndex) => {
                        return [...Array(15)]
                            .map((_, index) => {
                                const buttonConfig = pageButtons[index] ?? null;

                                if (buttonConfig) {
                                    return `
								<button class="button--label" data-page-index="${pageIndex}" data-keycode="${
                                        buttonConfig.keyCode ?? ""
                                    }" data-button-index="${index}" style="--text-color:${
                                        buttonConfig.textColor ?? ""
                                    };--bg-color:${
                                        buttonConfig.bgColor ?? ""
                                    };">
									${buttonConfig.label ?? false ? `<span>${buttonConfig.label}</span>` : ""}
									${
                                        buttonConfig.audio ?? false
                                            ? `<audio id="${
                                                  buttonConfig.keyCode
                                              }" src=${
                                                  buttonConfig.audio
                                              } preload="auto" ${
                                                  buttonConfig.volume
                                                      ? 'volume="' +
                                                        buttonConfig.volume +
                                                        '"'
                                                      : ""
                                              }></audio>`
                                            : ""
                                    }
									${
                                        buttonConfig.image ?? false
                                            ? `<img src="${buttonConfig.image}" alt="" title="" width="${buttonConfig.width}"  height="${buttonConfig.height}" />`
                                            : ""
                                    }
								</button>
							`;
                                } else {
                                    return `<button data-page-index="${pageIndex}" data-button-index="${index}"></button>`;
                                }
                            })
                            .join("");
                    })
                    .join("")}
			</div>
		`;
    };
}

export { DrumPad };
