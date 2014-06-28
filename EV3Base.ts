/// <reference path="node.d.ts"/>
var fs = require("fs");
var path = require('path');

module FilePathConstructor {
    var motorDeviceDir: string = '/sys/class/tacho-motor/';
    var motorDirName: string = 'out{0}:motor:tacho';

    export function motor(port: MotorPort) {
        return path.join(motorDeviceDir, motorDirName.format(MotorPort[port]), '/');
    }

    export function motorProperty(port: MotorPort, property: MotorProperty) {
        return path.join(motor(port), MotorProperty[property]);
    }
}

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

enum MotorPort {
    A, B, C, D
}

enum MotorProperty {
    device,
    state,
    target_speed,
    direction,
    stop_mode,
    target_steer,
    mode,
    subsystem,
    target_tacho,
    power,
    tacho,
    target_time,
    ramp_mode,
    tacho_mode,
    target_total_count,
    regulation_mode,
    target_power,
    time,
    run,
    target_ramp_down_count,
    type,
    speed,
    target_ramp_up_count,
    uevent,
    position
}

enum MotorType {
    tacho,
    minitacho
}

module.exports.FilePathConstructor = FilePathConstructor;
module.exports.MotorPort = MotorPort;
module.exports.MotorProperty = MotorProperty;
module.exports.MotorType = MotorType;