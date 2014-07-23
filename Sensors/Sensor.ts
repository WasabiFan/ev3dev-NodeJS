/// <reference path="../node.d.ts"/>

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

        if (fs.existsSync(numValuesProperty))
            this.numValues = fs.readFileSync(numValuesProperty).toString().match(/[0-9A-Za-z._]+/)[0];
    }

    public getValue(valueN: number): string {
        var val;

        if (valueN < this.numValues)
            val = this.readProperty('value' + valueN);
        else
            throw new Error('The value index must be less than ' + this.numValues);

        val = val.match(/[0-9A-Za-z._]+/)[0]

        var dpVal = val / Math.pow(10, parseInt(this.readProperty('dp')));

        if (!isNaN(dpVal))
            return dpVal;

        return val;
    }

    //Get the possible sensor modes
    get modes(): string[] {
        return this.readProperty('modes').split(' ');
    }

    //Get the current sensor mode
    get mode(): string {
        return this.readProperty('mode');
    }

    //Get the sensor type_id
    get typeId(): string {
        return this.readProperty('type_id');
    }

    private readProperty(property: string): string {
        var propertyPath: string = FilePathConstructor.sensorProperty(this.sensorIndex, property);

        if (fs.existsSync(propertyPath))
            return fs.readFileSync(propertyPath).toString().replace('\n', '');
        else
            throw new Error('The property file could not be found. Either the specified sensor is not available or the property does not exist.');
    }

    //Set the sensor mode
    set mode(value: string) {
        this.writeProperty('mode', value);
    }

    private writeProperty(property: string, value: any) {
        var propertyPath: string = FilePathConstructor.sensorProperty(this.sensorIndex, property);
        
        if (fs.existsSync(propertyPath))
            fs.writeFileSync(propertyPath, value);
        else
            throw new Error('The property file could not be found. Either the specified sensor is not available or the property does not exist.');
    }
}

module.exports = GenericSensor;