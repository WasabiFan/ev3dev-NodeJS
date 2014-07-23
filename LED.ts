/// <reference path="node.d.ts"/>
/// <reference path="EV3Base.ts"/>

// Require modules and globalize some stuff
var fs = require("fs");
var base = require("./EV3Base.js");

var FilePathConstructor = base.FilePathConstructor;
var softBoolean = base.softBoolean;
var ledPosition = base.ledPosition;
var ledUnitColor = base.ledUnitColor;
var ledColorSetting = base.ledColorSetting;

class LED {
    private position: ledPosition;

    constructor(position: ledPosition) {
        this.position = position;
    }

    get color(): ledColorSetting {
        var ledStatus = this.readLedStatus();

        if (!ledStatus.greenLED && !ledStatus.redLED)
            return ledColorSetting.off;
        else if (ledStatus.greenLED && ledStatus.redLED)
            return ledColorSetting.amber;
        else if (ledStatus.greenLED)
            return ledColorSetting.green;
        else if (ledStatus.redLED)
            return ledColorSetting.red;
    }

    set color(value: ledColorSetting) {
        var ledState = new LedState(false, false);

        switch (value) {
            case ledColorSetting.amber:
                ledState.greenLED = true;
                ledState.redLED = true;
                break;
            case ledColorSetting.green:
                ledState.greenLED = true;
                break;
            case ledColorSetting.red:
                ledState.redLED = true;
                break;
        }

        this.writeLedStatus(ledState);
    }

    /**
     * Reads the status of the LED unit from the file; includes error handling if the file doesn't exist
     */
    private readLedStatus(): LedState {
        var redPropertyPath: string = FilePathConstructor.ledBrightness(this.position, ledUnitColor.red);
        var greenPropertyPath: string = FilePathConstructor.ledBrightness(this.position, ledUnitColor.green);

        if (fs.existsSync(redPropertyPath) && fs.existsSync(greenPropertyPath))
            return new LedState(
                !!String.fromCharCode(fs.readFileSync(redPropertyPath)[0]),
                !!String.fromCharCode(fs.readFileSync(greenPropertyPath)[0])
                );
        else
            throw new Error('The file could not be found.');
    }

    /**
     * Sets the status of the LED unit.
     */
    private writeLedStatus(value: LedState) {
        var redPropertyPath: string = FilePathConstructor.ledBrightness(this.position, ledUnitColor.red);
        var greenPropertyPath: string = FilePathConstructor.ledBrightness(this.position, ledUnitColor.green);

        if (fs.existsSync(redPropertyPath) && fs.existsSync(greenPropertyPath)) {
            fs.writeFileSync(redPropertyPath, softBoolean(value.redLED, 0, 1));
            fs.writeFileSync(greenPropertyPath, softBoolean(value.greenLED, 0, 1));
        }
        else
            throw new Error('The file could not be found.');
    }
}

class LedState {
    redLED: boolean;
    greenLED: boolean;

    constructor(redLED: boolean, greenLED: boolean) {
        this.redLED = redLED;
        this.greenLED = greenLED;
    }
}

module.exports = LED;