/// <reference path="node.d.ts"/>
/// <reference path="EV3Base.ts"/>

var fs = require("fs");
var base = require("./EV3Base.js");

var FilePathConstructor = base.FilePathConstructor;
var MotorPort = base.MotorPort;
var MotorProperty = base.MotorProperty;
var MotorType = base.MotorType;

class Motor {
    private port: MotorPort

    get speed(): number {
        return parseInt(this.readProperty(MotorProperty.speed));
    }

    get position(): number {
        return parseInt(this.readProperty(MotorProperty.position));
    }

    get type(): string {
        return this.readProperty(MotorProperty.type);
    }

    private readProperty(property: MotorProperty): string {
        var propertyPath: string = FilePathConstructor.motorProperty(this.port, property);
        return fs.readFileSync(propertyPath).toString().match(/[0-9A-Za-z._]+/)[0];
    }

    constructor(port: MotorPort) {
        this.port = port;
    }
}

module.exports = Motor;
module.exports.MotorPort = base.MotorPort;