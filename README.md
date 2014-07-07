ev3dev-NodeJS
=============

ev3dev-NodeJS is a NodeJS module that exposes the features of the ev3dev API. Your brick must be running [ev3dev](http://github.com/mindboards/ev3dev) and must have NodeJS installed.

We currently support:

- Motors
  - Run forever
  - Run time
  - Run servo/position
- LEDs

Motors
------
```
//Require the module
var ev3 = require('ev3dev');

//Create the motor on port A
var motorA = new ev3.Motor(ev3.MotorPort.A);

//Run the motor at 60% power for five seconds, and then hold it in place
motorA.startMotor({ 
    targetSpeed: 60,
    time: 5000,
    stopMode: 'hold'
});
```

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



Simple, right? Learn more about the [Motor](https://github.com/WasabiFan/ev3dev-NodeJS/wiki/Motors) and [LED](https://github.com/WasabiFan/ev3dev-NodeJS/wiki/LEDs) APIs on the Wiki.