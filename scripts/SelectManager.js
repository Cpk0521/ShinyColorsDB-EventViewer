class SelectManager {
    constructor() {
        this._container = new PIXI.Container();
        this._loader = PIXI.Loader.shared;
        this._stMap = new Map();
        this._neededFrame = 1;
        //translate
        this._languageType = 0; // 0:jp 1:zh 2:jp+zh
    }

    get stageObj() {
        return this._container;
    }

    get neededFrame() {
        return this._neededFrame;
    }

    reset(clear = true) {
        this._container.removeChildren(0, this._container.children.length);
        this._neededFrame = 1;
        if (clear) {
            this._stMap.clear();
        }
    }

    processSelectByInput(selectDesc, nextLabel, onClick, afterSelection, translated_text, isFastForward) {
        if (!selectDesc) { return; }

        if (!this._stMap.has(`selectFrame${this.neededFrame}`)) {
            let thisSelectContainer = new PIXI.Container();
            thisSelectContainer.addChild(new PIXI.Sprite(this._loader.resources[`selectFrame${this.neededFrame}`].texture));
            let currentText = { jp: '', zh: '' };
            this._stMap.set(`selectFrame${this.neededFrame}`, { thisSelectContainer: thisSelectContainer, currentText: currentText });
        }

        let { thisSelectContainer, currentText } = this._stMap.get(`selectFrame${this.neededFrame}`);
        thisSelectContainer.interactive = true;
        const localBound = thisSelectContainer.getLocalBounds();
        thisSelectContainer.pivot.set(localBound.width / 2, localBound.height / 2);

        thisSelectContainer.on('click', () => {
            this._disableInteractive();

            TweenMax.to(thisSelectContainer, 0.1, { pixi: { scaleX: 1.2, scaleY: 1.2 } });

            setTimeout(() => {
                onClick(nextLabel);
                afterSelection();

                this._fadeOutOption();
            }, 800);

        }, { once: true });

        if (translated_text) {
            currentText.jp = selectDesc;
            currentText.zh = translated_text;
            selectDesc = this._languageType === 1 ? translated_text : selectDesc;
        }

        let family = translated_text && this._languageType === 1 ? zhcnFont : usedFont;
        let textObj = new PIXI.Text(selectDesc, {
            fontFamily: family,
            fontSize: 24,
            fill: 0x000000,
            align: 'center',
            padding: 3
        });
        thisSelectContainer.addChild(textObj);
        this._container.addChild(thisSelectContainer);

        // for selectFrame size is 318x172
        textObj.anchor.set(0.5);
        textObj.position.set(159, 86);

        switch (this.neededFrame) {
            case 1:
                thisSelectContainer.position.set(568, 125);
                break;
            case 2:
                thisSelectContainer.position.set(200, 240);
                break;
            case 3:
                thisSelectContainer.position.set(936, 240);
                break;
        }

        const tl = new TimelineMax({ repeat: -1, yoyo: true, repeatDelay: 0 });
        const yLocation = thisSelectContainer.y;
        tl.to(thisSelectContainer, 1, { pixi: { y: yLocation - 10 }, ease: Power1.easeInOut });
        tl.to(thisSelectContainer, 1, { pixi: { y: yLocation }, ease: Power1.easeInOut });
        this.frameForward();
    }

    frameForward() {
        this._neededFrame++;
    }

    frameReset() {
        this._neededFrame = 1;
    }

    toggleLanguage(type) {
        this._languageType = type;
        this._stMap.forEach((value, key) => {
            let { thisSelectContainer, currentText } = value;
            let textObj = thisSelectContainer.getChildAt(1);
            if (this._languageType === 0) {
                textObj.style.fontFamily = usedFont;
                textObj.text = currentText.jp;
            }
            else if (this._languageType === 1) {
                textObj.style.fontFamily = zhcnFont;
                textObj.text = currentText.zh;
            }
        });
    }

    _disableInteractive() {
        this._stMap.forEach(st => {
            st.interactive = false;
        });
    }

    _fadeOutOption() {
        this._stMap.forEach(st => {
            TweenMax.to(st, 1, { alpha: 0, ease: Power3.easeOut });
        });
        setTimeout(() => {
            this._container.removeChildren(0, this._container.children.length);
        }, 500);
    }
}
