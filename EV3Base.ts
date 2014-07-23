/// <reference path="node.d.ts"/>
/// <reference path="linq.d.ts"/>
var fs = require("fs");
var path = require('path');
var Enumerable: linqjs.EnumerableStatic = require('linq');

//Debug settings
var DEBUG = false;

/**
 * A module to handle path creation from known properties
 */
module FilePathConstructor {
    var motorDeviceDir: string = '/sys/class/tacho-motor/';
    var motorDirName: string = 'tacho-motor{0}';

    var sensorDeviceDir: string = '/sys/class/msensor';
    var sensorDirName: string = 'sensor{0}';

    var ledDeviceDir: string = '/sys/class/leds/';
    var ledDirName: string = 'ev3:{0}:{1}';

    export function motorIndex(port: MotorPort) {
        if (!fs.existsSync(motorDeviceDir))
            throw new Error('The motor class directory does not exist.');


        var motorFile = Enumerable.from(fs.readdirSync(motorDeviceDir))
            .firstOrDefault(file => fs.readFileSync(
                path.join(motorDeviceDir, file, '/port_name')
                ).toString()
                .indexOf('out' + MotorPort[port]) == 0);

        return motorFile.match(/[0-9]+/)[0];
    }


    export function motor(index: number) {
        return path.join(motorDeviceDir, motorDirName.format(index), '/');
    }

    export function motorProperty(index: number, property: MotorProperty) {
        return path.join(motor(index), MotorProperty[property]);
    }

    export function sensorNumber(port: number) {
        if (!fs.existsSync(sensorDeviceDir))
            throw new Error('The sensor class directory does not exist.');

        var sensorFile = Enumerable.from(fs.readdirSync(sensorDeviceDir))
            .firstOrDefault(file => fs.readFileSync(
                path.join(sensorDeviceDir, '/', file, '/port_name')
                ).toString()
                .indexOf('in' + port) == 0);

        return sensorFile.match(/[0-9]+/)[0];
    }

    export function sensor(sensorNumber: number) {
        return path.join(sensorDeviceDir, sensorDirName.format(sensorNumber), '/');
    }

    export function sensorProperty(sensorNumber: number, property: string) {
        return path.join(sensor(sensorNumber), property);
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
    var args: IArguments = arguments;
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
function softBoolean(value: any, falseValue?: any, trueValue?: any): boolean {
    switch (value) {
        case 0:
        case '0':
        case 'off':
        case false:
        case 'false':
            return falseValue == undefined ? false : falseValue;

        case 1:
        case '1':
        case 'on':
        case true:
        case 'true':
            return trueValue == undefined ? true : trueValue;

        default:
            return undefined;
    }
}

module.exports.debugLog = function (text: string, ...args: any[]) {
    if (DEBUG) {
        console.log("DEBUG: " + text.replace(/{(\d+)}/g, function (match, i) {
            return typeof args[i] != 'undefined'
                ? (typeof args[i] == 'object' ? JSON.stringify(args[i]) : args[i])
                : match
                ;
        }));
    }
}

enum MotorPort {
    A, B, C, D
}

enum MotorRunMode {
    forever,
    time,
    position
}

enum MotorProperty {
    uevent,
    subsystem,
    device,
    port_name,
    type,
    position,
    state,
    duty_cycle,
    pulses_per_second,
    duty_cycle_sp,
    pulses_per_second_sp,
    time_sp,
    position_sp,
    run_mode,
    regulation_mode,
    stop_modes,
    stop_mode,
    position_mode,
    polarity_mode,
    ramp_up_sp,
    ramp_down_sp,
    speed_regulation_P,
    speed_regulation_I,
    speed_regulation_D,
    speed_regulation_K,
    run,
    estop,
    reset,
}

var MotorPropertyValidation: any = {
    4: { type: 'string', values: ['tacho', 'minitacho'] }, //type
    5: { type: 'number', min: -2147483648, max: 2147483648 }, //position
    9: { type: 'number', min: -100, max: 100 }, //duty_cycle_sp
    10: { type: 'number', min: -2000, max: 2000 }, //pulses_per_second_sp
    11: { type: 'number', min: 0 }, //time_sp
    12: { type: 'number', min: -2147483648, max: 2147483648 }, //position_sp
    13: { type: 'string', values: ['forever', 'time', 'position'] }, //run_mode
    14: { type: 'string', values: ['on', 'off'] }, //regulation_mode
    16: { type: 'string', values: ['coast', 'brake', 'hold'] }, //stop_mode
    17: { type: 'string', values: ['absolute', 'relative'] }, //position_mode
    18: { type: 'string', values: ['positive', 'negative'] },//polarity_mode
    25: { type: 'number', values: [0, 1] }, //run
    19: { type: 'number' }, //ramp_up_sp
    20: { type: 'number' }, //ramp_down_sp
    21: { type: 'number' }, //speed_regulation_P
    22: { type: 'number' }, //speed_regulation_I
    23: { type: 'number' }, //speed_regulation_D
    24: { type: 'number' }, //speed_regulation_K


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
module.exports.MotorRunMode = MotorRunMode;