ev3dev-NodeJS
=============

ev3dev-NodeJS is a NodeJS module that exposes the features of the ev3dev API. Your brick must be running [ev3dev](http://github.com/mindboards/ev3dev) and must have NodeJS installed.

We currently support:

- Motors
  - Run forever
- LEDs

Motors
------
```
//Require the module
var ev3 = require('ev3dev');

//Create the motor on port A
var motorA = new ev3.Motor(ev3.MotorPort.A);

//Run the motor at 60% power
motorA.startMotor({ targetSpeed: 60 });

//Wait five seconds before turning off the motor and letting it coast
setTimeout(function () {
    motorA.coast();
}, 5000);
```
Simple, right? Learn more about the Motor APIs on the Wiki.

LEDs
----
```
//Require the module
var ev3 = require('ev3dev');

//Initialize both LEDs
var leftLED = new ev3.LED(ev3.ledPosition.left);
var rightLED = new ev3.LED(ev3.ledPosition.right);

//Set their color
leftLED.color = ev3.ledColorSetting.green;
rightLED.color = ev3.ledColorSetting.red;
```
More docs are also on the Wiki.