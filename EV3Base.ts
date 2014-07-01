/// <reference path="node.d.ts"/>
var fs = require("fs");
var path = require('path');

/**
 * A module to handle path creation from known properties
 */
module FilePathConstructor {
    var motorDeviceDir: string = '/sys/class/tacho-motor/';
    var motorDirName: string = 'out{0}:motor:tacho';

    var ledDeviceDir: string = '/sys/class/leds/';
    var ledDirName: string = 'ev3:{0}:{1}';

    export function motor(port: MotorPort) {
        return path.join(motorDeviceDir, motorDirName.format(MotorPort[port]), '/');
    }

    export function motorProperty(port: MotorPort, property: MotorProperty) {
        return path.join(motor(port), MotorProperty[property]);
    }

    export function ledBrightness(position: ledPosition, color: ledUnitColor) {

        return path.join(ledDeviceDir, ledDirName.format(ledUnitColor[color], ledPosition[position]), '/brightness');
    }
}

//Extend the string prototype
interface String {
    format(...args: any[]): string
}

String.prototype.format = function () {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function (match, number) {
        return typeof args[number] != 'undefined'
            ? args[number]
            : match
            ;
    });
};

/**
 * Takes any of the logical ways to express a boolean and normalizes them.
 */
function softBoolean(value: any, falseValue?: any, trueValue?: any) : boolean{
    switch (value) {
        case 0:        
        case 'off':
        case false:
            return falseValue == undefined? false : falseValue;

        case 1:
        case 'on':
        case true:
            return trueValue == undefined? true : trueValue;

        default:
            return undefined;
    }
}

enum MotorPort {
    A, B, C, D
}

enum MotorProperty {
    brake_mode,
    hold_mode,
    position,
    position_setpoint,
    pulses_per_second,
    ramp_up,
    reset,
    run_mode,
    speed_setpoint,
    subsystem,
    type,
    device,
    polarity_mode,
    position_mode,
    power,
    ramp_down,
    regulation_mode,
    run,
    speed,
    state,
    time_setpoint,
    uevent
}

var MotorPropertyValidation = {
    0: { type: 'string', values: ['on', 'off'] }, //brake_mode
    1: { type: 'string', values: ['on', 'off'] }, //hold_mode
    2: { type: 'number', min: -2147483648, max: 2147483648 }, //position
    7: { type: 'string', values: ['forever', 'time', 'position'] }, //run_mode
    8: { type: 'number', min: -100, max: 100 }, //speed_setpoint
    10: { type: 'string', values: ['tacho', 'minitacho'] }, //type
    14: { type: 'number', min: -100, max: 100 }, //power
    16: { type: 'string', values: ['on', 'off'] }, //regulation_mode
    17: { type: 'number', values: [0, 1] }, //run
    18: { type: 'number', min: -100, max: 100 }, //speed

}

class motorRunOptions {
    targetSpeed: number; //equates to speed_setpoint. Default: 0
    run: any; //will accept numbers 0 and 1, strings 'off' and 'on', and booleans true and false. Default: true
    regulationMode: any; //will accept numbers 0 and 1, strings 'off' and 'on', and booleans true and false. Default: false

    constructor(targetSpeed?: number, run?: any, regulationMode?: any) {
        this.targetSpeed = targetSpeed;
        this.run = run;
        this.regulationMode = regulationMode;
    }
}

enum MotorType {
    tacho,
    minitacho
}

enum ledPosition {
    left,
    right
}

enum ledUnitColor {
    green,
    red
}

enum ledColorSetting {
    green,
    amber,
    red,
    off
}

module.exports.FilePathConstructor = FilePathConstructor;
module.exports.MotorPort = MotorPort;
module.exports.MotorProperty = MotorProperty;
module.exports.MotorType = MotorType;
module.exports.MotorPropertyValidation = MotorPropertyValidation;
module.exports.softBoolean = softBoolean;
module.exports.ledUnitColor = ledUnitColor;
module.exports.ledColorSetting = ledColorSetting;
module.exports.ledPosition = ledPosition;
module.exports.motorRunOptions = motorRunOptions;