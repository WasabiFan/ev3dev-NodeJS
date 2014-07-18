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
var motorRunOptions = base.motorRunOptions;
var MotorRunMode = base.MotorRunMode;

//Class to hold the basic function of the motor
class Motor {
    private port: MotorPort;
    private index: number;

    //Read-only properties
    get position(): number { //Number of tacho ticks
        return parseInt(this.readProperty(MotorProperty.position));
    }

    get type(): string { //The type of motor
        return this.readProperty(MotorProperty.type);
    }

    private scale(value: number, oldMin: number, oldMax: number, newMin: number, newMax: number): number {
        return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
    }

    /**
     * Reads the value of a property from the file; includes error handling if the file doesn't exist
     * @param {MotorProperty} property The property to read
     */
    private readProperty(property: MotorProperty): string {
        var propertyPath: string = FilePathConstructor.motorProperty(this.index, property);

        base.debugLog('READING PROPERTY {0}', propertyPath);

        if (fs.existsSync(propertyPath))
            return fs.readFileSync(propertyPath).toString().match(/[0-9A-Za-z._]+/)[0];
        else
            throw new Error('The property file could not be found. Either the specified motor is not available or the property does not exist.');
    }

    //Writable properties

    //targetSpeed: The speed setpoint
    get targetSpeed(): number { 
        if (this.regulationMode == 'on') {
            switch (this.type) {
                case MotorType[MotorType.tacho]:
                    return this.scale(this.readProperty(MotorProperty.pulses_per_second), -900, 900, -100, 100);
                case MotorType[MotorType.minitacho]:
                    return this.scale(this.readProperty(MotorProperty.pulses_per_second), -1200, 1200, -100, 100);
            }
        }
    }

    set targetSpeed(value: number) {
        if (this.regulationMode == 'on') {
            switch (this.type) {
                case MotorType[MotorType.tacho]:
                    this.writeProperty(MotorProperty.pulses_per_second_sp, parseInt(this.scale(value, -100, 100, -900, 900)));
                    break;
                case MotorType[MotorType.minitacho]:
                    this.writeProperty(MotorProperty.pulses_per_second_sp, parseInt(this.scale(value, -100, 100, -1200, 1200)));
                    break;
            }
        }
    }

    //run: enables the motors. any type.
    get run(): any {
        return !!parseInt(this.readProperty(MotorProperty.run));
    }

    set run(value: any) {
        this.writeProperty(MotorProperty.run, softBoolean(value, 0, 1));
    }

    //regulationMode
    get regulationMode(): number {
        return parseInt(this.readProperty(MotorProperty.regulation_mode));
    }

    set regulationMode(value: number) {
        if (this.run)
            this.writeProperty(MotorProperty.regulation_mode, softBoolean(value, 'off', 'on'));
        else
            throw new Error('You must stop the motor before changing the regulation mode.');
    }

    //stopMode: Choses how to stop the motor
    get stopMode(): string {
        return this.readProperty(MotorProperty.stop_mode);
    }

    set stopMode(value: string) {
        this.writeProperty(MotorProperty.stop_mode, value);
    }

    /**
     * Writes a value for a property.
     * Checks the input against the validation params specified for each property; will throw if the input isn't valid.
     */
    private writeProperty(property: MotorProperty, value: any) {
        var propertySpec = MotorPropertyValidation[property];
        switch (propertySpec.type) {
            case 'number':
                //console.log(typeof value + ', ' + value);
                if (isNaN(value))
                    throw new Error('The specified value is not a number.');

                if (typeof propertySpec.min != 'undefined')
                    if (value < propertySpec.min)
                        throw new Error('The specified value must be greater than or equal to ' + propertySpec.min + '. Property: ' + MotorProperty[property]);

                if (typeof propertySpec.max != 'undefined')
                    if (value > propertySpec.max)
                        throw new Error('The specified value must be less than or equal to ' + propertySpec.max + '. Property: ' + MotorProperty[property]);

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

        var propertyPath: string = FilePathConstructor.motorProperty(this.index, property);

        base.debugLog('WRITING PROPERTY {0}', propertyPath);

        if (fs.existsSync(propertyPath))
            return fs.writeFileSync(propertyPath, value);
        else
            throw new Error('The property file could not be found. Either the specified motor is not available or the property does not exist.');
    }

    /**
     * Starts the motor.
     */
    public startMotor(options: any) {
        base.debugLog('STARTING MOTOR {0},{1} with options {2}', MotorPort[this.port], this.index, options);

        for (var i in defaultMotorRunOptions)
            if (options[i] == undefined)
                options[i] = defaultMotorRunOptions[i];

        if (options.time != undefined) {
            this.writeProperty(MotorProperty.run_mode, MotorRunMode[MotorRunMode.time]);
            this.writeProperty(MotorProperty.time_sp, options.time);
        }
        else
            this.writeProperty(MotorProperty.run_mode, MotorRunMode[MotorRunMode.forever])

        this.writeProperty(MotorProperty.regulation_mode, softBoolean(options.regulationMode, 'off', 'on'));

        if (softBoolean(options.regulationMode)) {
            switch (this.type) {
                case MotorType[MotorType.tacho]:
                    this.writeProperty(MotorProperty.pulses_per_second_sp, parseInt(this.scale(options.targetSpeed, -100, 100, -900, 900)));
                    break;
                case MotorType[MotorType.minitacho]:
                    this.writeProperty(MotorProperty.pulses_per_second_sp, parseInt(this.scale(options.targetSpeed, -100, 100, -1200, 1200)));
                    break;
            }
        }
        else
            this.writeProperty(MotorProperty.duty_cycle_sp, options.targetSpeed);

        this.writeProperty(MotorProperty.stop_mode, options.stopMode);
        this.writeProperty(MotorProperty.run, softBoolean(options.run, 0, 1));
    }

    /**
     * Runs the motor to a specified position. Works well with holdMode and brakeMode.
     */
    public runServo(options: any) {
        base.debugLog('RUNNING SERVO {0},{1} with options {2}', MotorPort[this.port], this.index, options);
        for (var i in defaultServoRunOptions)
            if (options[i] == undefined)
                options[i] = defaultServoRunOptions[i];

        this.writeProperty(MotorProperty.run, 0);

        switch (this.type) {
            case MotorType[MotorType.tacho]:
                this.writeProperty(MotorProperty.pulses_per_second_sp, parseInt(this.scale(options.targetSpeed, -100, 100, -900, 900)));
                break;
            case MotorType[MotorType.minitacho]:
                this.writeProperty(MotorProperty.pulses_per_second_sp, parseInt(this.scale(options.targetSpeed, -100, 100, -1200, 1200)));
                break;
        }

        this.writeProperty(MotorProperty.regulation_mode, 'on');

        this.writeProperty(MotorProperty.position_mode, options.positionMode);

        this.writeProperty(MotorProperty.position_sp, options.position);
        this.writeProperty(MotorProperty.stop_mode, options.stopMode);
        this.writeProperty(MotorProperty.run, 1);
    }

    /**
     * Stops the motor by reversing the direction
     */
    public brake() {
        this.stopMode = 'brake';

        this.startMotor({ run: false });
    }

    /**
     * Stops the motor and actively holds it in place
     */
    public hold() {
        this.stopMode = 'hold';

        this.startMotor({ run: false });
    }

    /**
     * Turns off the motor but allows it to coast
     */
    public coast() {
        this.stopMode = 'coast';

        this.startMotor({ run: false });
    }

    constructor(port: MotorPort) {
        this.port = port;
        this.index = FilePathConstructor.motorIndex(port);

        base.debugLog('MOTOR CREATED at index {0} on port {1}', this.index, MotorPort[this.port]);
    }
}

var defaultMotorRunOptions = {
    targetSpeed: 0,
    run: 1,
    regulationMode: false,
    time: undefined,
    stopMode: 'coast'
}

var defaultServoRunOptions = {
    targetSpeed: 30,
    positionMode: 'relative',
    position: 0,
    stopMode: 'coast'
}

module.exports = Motor;