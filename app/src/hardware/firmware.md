# micro:bit Firmware for CryptoBlocks

This is the MakeCode JavaScript source for the relay firmware that runs
on the micro:bit. You flash it **once**, and from then on the micro:bit
will pair over Bluetooth with CryptoBlocks in any Chrome/Edge tab.

## How to flash it

1. Go to https://makecode.microbit.org
2. Click **New Project** → name it "CryptoBlocks Relay"
3. Click the **⚙️ gear icon** → **Project Settings**
4. Enable these flags:
   - ✅ **No Pairing Required: Anyone can connect via Bluetooth**
   - ✅ (optional) Disable the radio if you're not using it
5. Click **Extensions** → search for `bluetooth` → add the Bluetooth package
6. Click **JavaScript** (top toggle) to switch from blocks to code view
7. Paste the source below (replace anything already there)
8. Click **Download** — the `.hex` file downloads to your computer
9. Plug the micro:bit into your computer via USB
10. Drag the `.hex` file onto the `MICROBIT` drive that appears
11. When the yellow light stops blinking, you're done forever

## Testing it

After flashing, open CryptoBlocks → click the micro:bit button in the
toolbar → pick your device from the pairing dialog. The micro:bit should
show a checkmark (`✓`) on its LED matrix when connected.

## Firmware source

```typescript
// CryptoBlocks Relay Firmware
// Exposes the micro:bit's LED matrix, buttons, speaker, accelerometer,
// compass, temperature, light sensor, and pin control to CryptoBlocks
// over the Nordic UART Bluetooth service.

bluetooth.startUartService()

bluetooth.onBluetoothConnected(function () {
    basic.showIcon(IconNames.Yes)
})

bluetooth.onBluetoothDisconnected(function () {
    basic.showIcon(IconNames.No)
})

// Edge-triggered events — fire once when the button is pressed
input.onButtonPressed(Button.A, function () {
    bluetooth.uartWriteLine("B:A:1")
})
input.onButtonPressed(Button.B, function () {
    bluetooth.uartWriteLine("B:B:1")
})
input.onButtonPressed(Button.AB, function () {
    bluetooth.uartWriteLine("B:AB:1")
})

// Shake
input.onGesture(Gesture.Shake, function () {
    bluetooth.uartWriteLine("M:S")
})

// Listen for commands from CryptoBlocks
bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
    const cmd = bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine))
    handleCommand(cmd)
})

function handleCommand(cmd: string): void {
    if (cmd.length < 2) return
    const kind = cmd.charAt(0)

    if (kind === "T") {
        // T:<text>
        basic.showString(cmd.substr(2))
    } else if (kind === "I") {
        // I:<icon>  — map name → IconNames
        showNamedIcon(cmd.substr(2))
    } else if (kind === "P") {
        // P:<hz>:<ms>
        const parts = cmd.substr(2).split(":")
        const freq = parseInt(parts[0])
        const ms = parseInt(parts[1])
        music.playTone(freq, ms)
    } else if (kind === "C") {
        // C:   clear screen
        basic.clearScreen()
    } else if (kind === "L") {
        // L:<x>:<y>:<0|1>
        const parts = cmd.substr(2).split(":")
        const x = parseInt(parts[0])
        const y = parseInt(parts[1])
        if (parts[2] === "1") {
            led.plot(x, y)
        } else {
            led.unplot(x, y)
        }
    } else if (kind === "V") {
        // V:<pin>:<angle>   → set servo
        const parts = cmd.substr(2).split(":")
        const pin = parseInt(parts[0])
        const angle = parseInt(parts[1])
        pins.servoWritePin(pinFromNumber(pin), angle)
    } else if (kind === "D") {
        // D:<pin>:<0|1>     → digital write
        const parts = cmd.substr(2).split(":")
        const pin = parseInt(parts[0])
        const val = parseInt(parts[1])
        pins.digitalWritePin(pinFromNumber(pin), val)
    }
}

// Stream a sensor frame ~10× per second so CryptoBlocks' read blocks
// always have a fresh value to return.
basic.forever(function () {
    const temp = input.temperature()
    const light = input.lightLevel()
    const ax = input.acceleration(Dimension.X)
    const ay = input.acceleration(Dimension.Y)
    const az = input.acceleration(Dimension.Z)
    const heading = input.compassHeading()
    const ba = input.buttonIsPressed(Button.A) ? 1 : 0
    const bb = input.buttonIsPressed(Button.B) ? 1 : 0
    const frame =
        "S:t:" + temp +
        ":l:" + light +
        ":ax:" + ax +
        ":ay:" + ay +
        ":az:" + az +
        ":h:" + heading +
        ":ba:" + ba +
        ":bb:" + bb
    bluetooth.uartWriteLine(frame)
    basic.pause(100)
})

// Map a pin number (0..20) to the micro:bit's AnalogPin enum.
// Unknown pins default to P0 to satisfy MakeCode's strict enum type —
// the calling code checks range before invoking.
function pinFromNumber(n: number): AnalogPin {
    if (n === 1) return AnalogPin.P1
    if (n === 2) return AnalogPin.P2
    if (n === 3) return AnalogPin.P3
    if (n === 4) return AnalogPin.P4
    if (n === 5) return AnalogPin.P5
    if (n === 6) return AnalogPin.P6
    if (n === 7) return AnalogPin.P7
    if (n === 8) return AnalogPin.P8
    if (n === 9) return AnalogPin.P9
    if (n === 10) return AnalogPin.P10
    if (n === 11) return AnalogPin.P11
    if (n === 12) return AnalogPin.P12
    if (n === 13) return AnalogPin.P13
    if (n === 14) return AnalogPin.P14
    if (n === 15) return AnalogPin.P15
    if (n === 16) return AnalogPin.P16
    if (n === 19) return AnalogPin.P19
    if (n === 20) return AnalogPin.P20
    return AnalogPin.P0
}

function showNamedIcon(name: string): void {
    // Keep this list in sync with the block icon dropdown in the app
    if (name === "heart") basic.showIcon(IconNames.Heart)
    else if (name === "yes" || name === "check") basic.showIcon(IconNames.Yes)
    else if (name === "no" || name === "x") basic.showIcon(IconNames.No)
    else if (name === "happy" || name === "smile") basic.showIcon(IconNames.Happy)
    else if (name === "sad") basic.showIcon(IconNames.Sad)
    else if (name === "surprised") basic.showIcon(IconNames.Surprised)
    else if (name === "asleep") basic.showIcon(IconNames.Asleep)
    else if (name === "confused") basic.showIcon(IconNames.Confused)
    else if (name === "angry") basic.showIcon(IconNames.Angry)
    else if (name === "skull") basic.showIcon(IconNames.Skull)
    else if (name === "triangle") basic.showIcon(IconNames.Triangle)
    else if (name === "diamond") basic.showIcon(IconNames.Diamond)
    else if (name === "square") basic.showIcon(IconNames.Square)
    else if (name === "target") basic.showIcon(IconNames.Target)
    else if (name === "arrow-up") basic.showArrow(ArrowNames.North)
    else if (name === "arrow-down") basic.showArrow(ArrowNames.South)
    else if (name === "arrow-left") basic.showArrow(ArrowNames.West)
    else if (name === "arrow-right") basic.showArrow(ArrowNames.East)
}

// Tell the world we're alive
basic.showIcon(IconNames.Asleep)
```

## Troubleshooting

- **Browser says "No device found"** — make sure Bluetooth is on and the
  micro:bit is powered (USB or battery pack). The device advertises as
  `BBC micro:bit [XXXXX]` where the 5 characters are its unique name.
- **Pairing dialog appears but fails** — double-check that "No Pairing
  Required" is enabled in MakeCode Project Settings. Re-flash if you
  changed it.
- **Only works in Chrome/Edge** — Web Bluetooth is not supported in
  Safari or Firefox. This is a browser limitation, not a CryptoBlocks one.
- **Works on desktop, not iPad** — same reason. iPad Safari can't use
  Web Bluetooth. The Tauri desktop app wrapper will solve this for mobile.
