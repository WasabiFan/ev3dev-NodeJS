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
        
        if (fs.existsSync(numValuesProperty))
            this.numValues = fs.readFileSync(numValuesProperty).toString().match(/[0-9A-Za-z._]+/)[0];
    }

    public getValue(valueN: number) {

        if (valueN < this.numValues)
            return this.sterilePropertyRead('value' + valueN).match(/[0-9A-Za-z._]+/)[0];
        else
            throw new Error('The value index must be less than ' + this.numValues);
    }

    //Get the possible sensor modes
    get modes(): string[] {
        return this.sterilePropertyRead('modes').split(' ');
    }
    
    //Get the current sensor mode
    get mode(): string {
        return this.sterilePropertyRead('mode'); 
    }  
    
    private sterilePropertyRead(property) {
        var propertyPath: string = FilePathConstructor.sensorProperty(this.sensorIndex, property);

        if (fs.existsSync(propertyPath))
            return fs.readFileSync(propertyPath).toString().replace('\n', '');
        else
            throw new Error('The property file could not be found. Either the specified sensor is not available or the property does not exist.');
    }  

    //Set the sensor mode
    set mode(value: string) {
        this.sterilePropertyWrite('mode', value);
    } 

    private sterilePropertyWrite(property, value) {
        var propertyPath: string = FilePathConstructor.sensorProperty(this.sensorIndex, property);

        if (fs.existsSync(propertyPath))
            fs.writeFileSync(propertyPath, value);
        else
            throw new Error('The property file could not be found. Either the specified sensor is not available or the property does not exist.');
    } 
}

module.exports.GenericSensor = GenericSensor;