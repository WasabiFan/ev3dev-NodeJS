/// <reference path="../node.d.ts"/>
/// <reference path="../EV3Base.ts"/>

//Require modules and globalize some stuff
var fs = require("fs");
var base = require("../EV3Base.js");

var FilePathConstructor = base.FilePathConstructor;
var softBoolean = base.softBoolean;

class GenericSensor {
    sensorPort: number;
    sensorIndex: number;
    numValues: number;

    constructor(sensorPort: number) {
        this.sensorPort = sensorPort;
        this.sensorIndex = FilePathConstructor.sensorNumber(sensorPort);

        var numValuesProperty: string = FilePathConstructor.sensorProperty(this.sensorIndex, 'num_values');

        if (fs.exists(numValuesProperty))
            this.numValues = fs.readFileSync(numValuesProperty).toString().match(/[0-9A-Za-z._]+/)[0];
    }

    public getValue(valueN: number) {
        var propertyPath: string = FilePathConstructor.sensorProperty(this.sensorIndex, 'value' + valueN);
        if (valueN < this.numValues && fs.existsSync(propertyPath))
            return fs.readFileSync(propertyPath).toString().match(/[0-9A-Za-z._]+/)[0];
        else
            throw new Error('The property file could not be found. Either the specified sensor is not available or the property does not exist.');
    }       
}

module.exports.GenericSensor = GenericSensor;