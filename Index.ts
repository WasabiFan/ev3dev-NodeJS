/// <reference path="node.d.ts"/>
var base = require("./EV3Base.js");
var LED = require("./LED.js");
var Motor = require("./Motor.js");
var Sensor = require("./Sensors/Sensor.js");
var SimpleSensors = require("./Sensors/SimpleSensors.js");

module.exports.Motor = Motor;
module.exports.LED = LED;

module.exports.GenericSensor = Sensor;
module.exports.TouchSensor = SimpleSensors.TouchSensor;
module.exports.UltrasonicSensor = SimpleSensors.UltrasonicSensor;

module.exports.MotorPort = base.MotorPort;
module.exports.ledColorSetting = base.ledColorSetting;
module.exports.ledPosition = base.ledPosition;
module.exports.MotorRunMode = base.MotorRunMode;