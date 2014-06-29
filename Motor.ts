/// <reference path="node.d.ts"/>
/// <reference path="EV3Base.ts"/>

//Require modules and globalize some stuff
var fs = require("fs");
var base = require("./EV3Base.js");

var FilePathConstructor = base.FilePathConstructor;
var MotorPort = base.MotorPort;
var MotorProperty = base.MotorProperty;
var MotorPropertyValidation = base.MotorPropertyValidation;
var MotorType = base.MotorType;
var softBoolean = base.softBoolean;

//Class to hold the basic function of the motor
class Motor {
    private port: MotorPort

    //Read-only properties
    get speed(): number { //Indication of relative speed
        return parseInt(this.readProperty(MotorProperty.speed));
    }

    get position(): number { //Number of tacho ticks
        return parseInt(this.readProperty(MotorProperty.position));
    }

    get power(): number { //The power being sent to the motor
        return parseInt(this.readProperty(MotorProperty.power));
    }

    get type(): string { //The type of motor
        return this.readProperty(MotorProperty.type);
    }

    /**
     * Reads the value of a property from the file; includes error handling if the file doesn't exist
     * @param {MotorProperty} property The property to read
     */
    private readProperty(property: MotorProperty): string {
        var propertyPath: string = FilePathConstructor.motorProperty(this.port, property);
        if (fs.existsSync(propertyPath))
            return fs.readFileSync(propertyPath).toString().match(/[0-9A-Za-z._]+/)[0];
        else
            throw new Error('The property file could not be found. Either the specified motor is not available or the property does not exist.');
    }

    //Writable properties

    //targetSpeed: The speed_setpoint
    get targetSpeed(): number { 
        return parseInt(this.readProperty(MotorProperty.speed_setpoint));
    }

    set targetSpeed(value: number) {
        this.writeProperty(MotorProperty.speed_setpoint, value);
    }

    //run: enables the motors. any type.
    get run(): number {
        return parseInt(this.readProperty(MotorProperty.run));
    }

    set run(value: number) {
        this.writeProperty(MotorProperty.run, softBoolean(value, 0, 1));
    }

    //holdMode: Will actively hold the motor position after it stops
    get holdMode(): any {
        return this.readProperty(MotorProperty.hold_mode);
    }

    set holdMode(value: any) {
        this.writeProperty(MotorProperty.hold_mode, softBoolean(value, 'off', 'on'));
    }

    //brakeMode: Will reverse the motor direction when it stops
    get brakeMode(): any {
        return this.readProperty(MotorProperty.brake_mode);
    }

    set brakeMode(value: any) {
        this.writeProperty(MotorProperty.brake_mode, softBoolean(value, 'off', 'on'));
    }

    /**
     * Writes a value for a property.
     * Checks the input against the validation params specified for each property; will throw if the input isn't valid.
     */
    private writeProperty(property: MotorProperty, value: any) {
        var propertySpec = MotorPropertyValidation[property];

        switch (propertySpec.type) {
            case 'number':
                if (isNaN(value))
                    throw new Error('The specified value is not a number.');

                if (typeof propertySpec.min != 'undefined')
                    if (value < propertySpec.min)
                        throw new Error('The specified value must be greater than or equal to' + propertySpec.min + '.');

                if (typeof propertySpec.max != 'undefined')
                    if (value > propertySpec.max)
                        throw new Error('The specified value must be less than or equal to' + propertySpec.max + '.');

                if (typeof propertySpec.values != 'undefined')
                    if (propertySpec.values.indexOf(value) == -1)
                        throw new Error('"' + value + '" is not an acceptable value.');

                break;

            case 'string':
                if (typeof propertySpec.values != 'undefined')
                    if (propertySpec.values.indexOf(value) == -1)
                        throw new Error('"' + value + '" is not an acceptable value.');
                break;
        }

        var propertyPath: string = FilePathConstructor.motorProperty(this.port, property);

        if (fs.existsSync(propertyPath))
            return fs.writeFileSync(propertyPath, value);
        else
            throw new Error('The property file could not be found. Either the specified motor is not available or the property does not exist.');
    }

    /**
     * Starts the motor.
     */
    public runMotor(options: motorRunOptions) {
        for (var i in defaultMotorRunOptions)
            if (options[i] == undefined)
                options[i] = defaultMotorRunOptions[i];

        this.writeProperty(MotorProperty.regulation_mode, softBoolean(options.regulationMode, 'off', 'on'));
        this.writeProperty(MotorProperty.run, softBoolean(options.run,0,1));
        this.writeProperty(MotorProperty.speed_setpoint, options.targetSpeed);
    }

    /**
     * Stops the motor by reversing the direction
     */
    public brake() {
        this.holdMode = false;
        this.brakeMode = true; 

        this.runMotor({ run: false });
    }

    /**
     * Stops the motor and actively holds it in place
     */
    public hold() {
        this.holdMode = true;
        this.brakeMode = false;

        this.runMotor({ run: false });
    }

    /**
     * Turns off the motor but allows it to coast
     */
    public coast() {
        this.holdMode = false;
        this.brakeMode = false;

        this.runMotor({ run: false });
    }

    constructor(port: MotorPort) {
        this.port = port;
    }
}

interface motorRunOptions {
    targetSpeed?: number //equates to speed_setpoint. Default: 0
    run?: any //will accept numbers 0 and 1, strings 'off' and 'on', and booleans true and false. Default: true
    regulationMode?: any //will accept numbers 0 and 1, strings 'off' and 'on', and booleans true and false. Default: false

}

var defaultMotorRunOptions = {
    targetSpeed: 0,
    run: 1,
    regulationMode: false
}

module.exports = Motor;
module.exports.MotorPort = base.MotorPort;