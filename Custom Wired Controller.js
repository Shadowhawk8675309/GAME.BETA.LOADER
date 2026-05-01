(function (Scratch) {
    "use strict";

    let deadzone = 0.1;

    //  EDIT THESE TWO VALUES
    const color1 = "#ce4668"; // block fill color
    const color2 = "#62a1e4"; // block outline color

    const BUTTON_MAP = {
        "A": 2,
        "B": 1,
        "X": 3,
        "Y": 0,
        "L": 4,
        "R": 5,
        "ZL": 6,
        "ZR": 7,
        "+": 9,
        "-": 8,
        "LEFT STICK": 10,
        "RIGHT STICK": 11,
        "HOME": 12,
        "CAPTURE": 13,

        "DPAD UP": "DPAD_UP",
        "DPAD DOWN": "DPAD_DOWN",
        "DPAD LEFT": "DPAD_LEFT",
        "DPAD RIGHT": "DPAD_RIGHT"
    };

    const DPAD_AXIS_INDEX = 9;

    const DPAD_VALUES = {
        "DPAD_UP": -1,
        "DPAD_DOWN": 0.143,
        "DPAD_LEFT": 0.714,
        "DPAD_RIGHT": -0.429
    };

    const JOYSTICK_AXIS = {
        "L": { "HORIZONTAL": 0, "VERTICAL": 1 },
        "R": { "HORIZONTAL": 2, "VERTICAL": 5 }
    };

    function getController() {
        const pads = navigator.getGamepads();
        for (const pad of pads) {
            if (!pad) continue;
            if (pad.id.includes("20d6") && pad.id.includes("a711")) {
                return pad;
            }
        }
        return null;
    }

    function applyDeadzone(v) {
        return Math.abs(v) < deadzone ? 0 : v;
    }

    class ControllerExtension {
        getInfo() {
            return {
                id: "wiredSwitchPro",
                name: "Wired Pro Controller",

                // 🎨 COLOR THEME APPLIED HERE
                color1: color1,
                color2: color2,

                blocks: [
                    {
                        opcode: "isPressed",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "is [BTN] pressed?",
                        arguments: {
                            BTN: { type: Scratch.ArgumentType.STRING, menu: "buttons" }
                        }
                    },
                    {
                        opcode: "isConnected",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "is controller connected?"
                    },
                    {
                        opcode: "debugData",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "debug data"
                    },
                    {
                        opcode: "joystickValue",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "value of joystick [SIDE] [DIR]",
                        arguments: {
                            SIDE: { type: Scratch.ArgumentType.STRING, menu: "sides" },
                            DIR: { type: Scratch.ArgumentType.STRING, menu: "axes" }
                        }
                    },
                    {
                        opcode: "joystickPressed",
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: "is joystick [SIDE] pressed [DIR]?",
                        arguments: {
                            SIDE: { type: Scratch.ArgumentType.STRING, menu: "sides" },
                            DIR: { type: Scratch.ArgumentType.STRING, menu: "directions" }
                        }
                    },
                    {
                        opcode: "setDeadzone",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "set controller joystick deadzone to [VAL]",
                        arguments: {
                            VAL: { type: Scratch.ArgumentType.NUMBER, defaultValue: 0.1 }
                        }
                    }
                ],
                menus: {
                    buttons: { items: Object.keys(BUTTON_MAP) },
                    sides: { items: ["L", "R"] },
                    axes: { items: ["HORIZONTAL", "VERTICAL"] },
                    directions: { items: ["UP", "DOWN", "LEFT", "RIGHT"] }
                }
            };
        }

        isConnected() {
            return getController() !== null;
        }

        isPressed(args) {
            const pad = getController();
            if (!pad) return false;

            const key = BUTTON_MAP[args.BTN];

            if (typeof key === "string" && key.startsWith("DPAD")) {
                const axis = pad.axes[DPAD_AXIS_INDEX];
                return Math.abs(axis - DPAD_VALUES[key]) < 0.1;
            }

            return pad.buttons[key]?.pressed || false;
        }

        debugData() {
            const pad = getController();
            return pad ? JSON.stringify({ axes: pad.axes, buttons: pad.buttons.map(b => b.value) }) : "no controller";
        }

        joystickValue(args) {
            const pad = getController();
            if (!pad) return 0;

            const axisIndex = JOYSTICK_AXIS[args.SIDE][args.DIR];
            const raw = pad.axes[axisIndex] || 0;
            return applyDeadzone(raw);
        }

        joystickPressed(args) {
            const pad = getController();
            if (!pad) return false;

            const horiz = applyDeadzone(pad.axes[JOYSTICK_AXIS[args.SIDE].HORIZONTAL]);
            const vert = applyDeadzone(pad.axes[JOYSTICK_AXIS[args.SIDE].VERTICAL]);

            const threshold = deadzone;

            switch (args.DIR) {
                case "UP": return vert < -threshold;
                case "DOWN": return vert > threshold;
                case "LEFT": return horiz < -threshold;
                case "RIGHT": return horiz > threshold;
            }
            return false;
        }

        setDeadzone(args) {
            deadzone = Math.max(0, Math.min(1, Number(args.VAL)));
        }
    }

    Scratch.extensions.register(new ControllerExtension());
})(Scratch);
