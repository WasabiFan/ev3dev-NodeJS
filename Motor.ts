/// <reference path="node.d.ts"/>
/// <reference path="EV3Base.ts"/>

var fs = require("fs");
var base = require("./EV3Base.js");

var FilePathConstructor = base.FilePathConstructor;
var MotorPort = base.MotorPort;
var MotorProperty = base.MotorProperty;

class Motor {
    private port: MotorPort

    get speed(): number {
        return parseInt(this.readProperty(MotorProperty.speed));
    }

    get position(): number {
        var propertyPath: string = FilePathConstructor.motorProperty(this.port, MotorProperty.position);
        return parseInt(fs.readFileSync(propertyPath).toString());
    }

    private readProperty(property: MotorProperty): string {
        var propertyPath: string = FilePathConstructor.motorProperty(this.port, property);
        return fs.readFileSync(propertyPath).toString().match(/[0-9]+/)[0];
    }

    constructor(port: MotorPort) {
        this.port = port;
    }
}

module.exports = Motor;
module.exports.MotorPort = base.MotorPort;