(function (Scratch) {
    'use strict';

    const DPAD_AXIS = 9;

    function getDpadDirection(value) {
        if (value <= -0.7) return "dpad up";          // -1.0
        if (value > -0.7 && value <= -0.2) return "dpad right";  // -0.43
        if (value > -0.2 && value <= 0.4) return "dpad down";    // 0.14
        if (value > 0.4 && value <= 1.0) return "dpad left";     // 0.71
        return "neutral";                       // 1.28
    }

    class AfterglowExtension {
        getInfo() {
            return {
                id: 'afterglowcontroller',
                name: 'Custom Controller',
                color1: '#1b5a9d',
                color2: '#FFFFFF',
                color3: '#887ba3',
                blocks: [
                    {
                        opcode: 'isInputPressed',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'IS [INPUT] PRESSED?',
                        arguments: {
                            INPUT: {
                                type: Scratch.ArgumentType.STRING,
                                menu: 'inputMenu'
                            }
                        }
                    },
                    {
                        opcode: 'isConnected',
                        blockType: Scratch.BlockType.BOOLEAN,
                        text: 'Controller Connected?'
                    },
                    {
                        opcode: 'rawDump',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'Debug Data'
                    }
                ],
                menus: {
                    inputMenu: {
                        acceptReporters: false,
                        items: [
                            'A','B','X','Y',
                            'L','R','ZL','ZR',
                            '+','-',
                            'HOME','CAPTURE',
                            'LS CLICK','RS CLICK',
                            'DPAD UP','DPAD DOWN','DPAD LEFT','DPAD RIGHT'
                        ]
                    }
                }
            };
        }

        _pad() {
            const pads = navigator.getGamepads();
            return pads[0] || null;
        }

        isConnected() {
            return this._pad() !== null;
        }

        isInputPressed(args) {
            const pad = this._pad();
            if (!pad) return false;

            const input = args.INPUT.toUpperCase();

            // Button map
            const buttonMap = {
                'B': 0,
                'A': 1,
                'Y': 2,
                'X': 3,
                'L': 4,
                'R': 5,
                'ZL': 6,
                'ZR': 7,
                '-': 8,
                '+': 9,
                'LS CLICK': 10,
                'RS CLICK': 11,
                'HOME': 12,
                'CAPTURE': 13
            };

            // If it's a button, check button state
            if (buttonMap[input] !== undefined) {
                return pad.buttons[buttonMap[input]]?.pressed ?? false;
            }

            // Otherwise it's a DPAD direction
            const value = pad.axes[DPAD_AXIS];
            const dir = getDpadDirection(value);

            return dir === input.toLowerCase();
        }

        rawDump() {
            const pad = this._pad();
            if (!pad) return "no controller";

            const axes = pad.axes?.map(v => Number(v.toFixed(3))) || [];
            const buttons = pad.buttons?.map(b => b.value) || [];

            return JSON.stringify({
                id: pad.id,
                axes: axes,
                buttons: buttons
            });
        }
    }

    Scratch.extensions.register(new AfterglowExtension());
})(Scratch);
