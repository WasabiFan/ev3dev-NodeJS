/// <reference path="../node.d.ts"/>

var GenericSensor = require('./Sensor.js');
var base = require("../EV3Base.js");

var softBoolean = base.softBoolean;

class TouchSensor extends GenericSensor {
    get touchState(): boolean {
        return softBoolean(this.getValue(0));
    }
}

class UltrasonicSensor extends GenericSensor {
    constructor(sensorPort: number) {
        super(sensorPort);
        this.unitMode = 'in';
    }

    get unitMode(): string {
        switch (this.mode) {
            case 'US-DIST-CM':
            case 'US-SI-CM':
            case 'NXT-US-CM':
            case 'NXT-US-SI-CM':
                return 'CM';
            case 'US-DIST-IN':
            case 'US-SI-IN':
            case 'NXT-US-IN':
            case 'NXT-US-SI-IN':
                return 'IN';
        }
    }

    set unitMode(unit: string) {
        if (parseInt(this.typeId) == 5)
            this.mode = 'NXT-US-' + unit.toUpperCase();
        else
            this.mode = 'US-DIST-' + unit.toUpperCase();
    }

    get distanceValue(): number {
        return parseFloat(this.getValue(0));
    }
}

module.exports.TouchSensor = TouchSensor;
module.exports.UltrasonicSensor = UltrasonicSensor;