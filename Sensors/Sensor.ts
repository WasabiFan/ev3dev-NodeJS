/// <reference path="../node.d.ts"/>
/// <reference path="../EV3Base.ts"/>

//Require modules and globalize some stuff
var fs = require("fs");
var base = require("../EV3Base.js");

var FilePathConstructor = base.FilePathConstructor;
var softBoolean = base.softBoolean;

class AnalogSensor {
    sensorPort: number;
    sensorIndex: number;

    constructor(sensorPort: number) {
        this.sensorPort = sensorPort;
        this.sensorIndex = FilePathConstructor.sensorNumber(sensorPort);
    }

    get analogValue(): number {
        var propertyPath: string = FilePathConstructor.sensorProperty(this.sensorIndex, 'value0');
        if (fs.existsSync(propertyPath))
            return fs.readFileSync(propertyPath).toString().match(/[0-9A-Za-z._]+/)[0];
        else
            throw new Error('The property file could not be found. Either the specified motor is not available or the property does not exist.');
    }
}

module.exports.AnalogSensor = AnalogSensor;