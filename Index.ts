/// <reference path="node.d.ts"/>
var base = require("./EV3Base.js");
var LED = require("./LED.js");
var Motor = require("./Motor.js");

module.exports.Motor = Motor;
module.exports.LED = LED;

module.exports.MotorPort = base.MotorPort;
module.exports.ledColorSetting = base.ledColorSetting;
module.exports.ledPosition = base.ledPosition;