/**
 * A lightweight Arduino-style interpreter for the browser - NOT a real C++
 * compiler or CPU emulator (see the chat explanation for why that's out of
 * scope). It transpiles a common subset of Arduino sketch syntax into JS via
 * regex-based source rewriting, then runs setup()/loop() as JS generator
 * functions so delay() can pause execution without freezing the tab.
 *
 * KNOWN LIMITATIONS (v1):
 *  - delay() only pauses correctly when called directly inside setup()/
 *    loop() (including inside their if/for/while blocks). A delay() call
 *    inside a separately-declared helper function will NOT pause - it's
 *    silently treated as instant. This keeps the transpiler tractable
 *    without a full parser; most beginner sketches don't hit this.
 *  - Type-stripping (int/float/bool/etc -> let) is regex-based, not a real
 *    parser. Unusual formatting can break it.
 *  - No I2C/SPI/WiFi/Bluetooth - digital/analog I/O and Serial only.
 *  - PWM (analogWrite) is modeled as a duty-cycle-averaged DC voltage, not
 *    an actual fast switching signal.
 */

const TYPE_KEYWORDS = "void|int|float|double|bool|boolean|char|byte|long|unsigned\\s+long|unsigned\\s+int|String";

function stripTypesAndConvertFunctions(src) {
  let out = src;
  // function defs: "void setup()" / "int add(int a, int b)" -> "function setup()" / "function add(a, b)"
  out = out.replace(new RegExp(`\\b(?:${TYPE_KEYWORDS})\\s+(\\w+)\\s*\\(`, "g"), "function $1(");
  // strip parameter types inside signatures: "a, int b)" -> "a, b)"
  out = out.replace(new RegExp(`\\b(?:${TYPE_KEYWORDS})\\s+(\\w+)(?=\\s*[,)])`, "g"), "$1");
  // remaining "type name" pairs are variable declarations -> "let name"
  out = out.replace(new RegExp(`\\b(?:${TYPE_KEYWORDS})\\s+(\\w+)`, "g"), "let $1");
  // Arduino HIGH/LOW/etc as bare words are handled by injecting them as
  // function arguments below, so no rewrite needed for those.
  return out;
}

function findMatchingBrace(src, openBraceIdx) {
  let depth = 0;
  for (let i = openBraceIdx; i < src.length; i++) {
    if (src[i] === "{") depth++;
    else if (src[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function extractFunctionBody(src, fnName) {
  const re = new RegExp(`function\\s+${fnName}\\s*\\([^)]*\\)\\s*{`);
  const m = re.exec(src);
  if (!m) return null;
  const openIdx = m.index + m[0].length - 1;
  const closeIdx = findMatchingBrace(src, openIdx);
  if (closeIdx === -1) return null;
  return {
    fullMatchStart: m.index,
    fullMatchEnd: closeIdx + 1,
    signature: m[0].slice(0, -1), // without trailing {
    body: src.slice(openIdx + 1, closeIdx),
  };
}

function yieldifyDelays(body) {
  return body.replace(/\bdelay\s*\(/g, "yield __delay(").replace(/\bdelayMicroseconds\s*\(/g, "__delayMicros(");
}

/** Transpiles raw Arduino-ish source into a JS function body that, when run
 * through `new Function(...)`, returns { setup, loop } generator functions. */
export function transpile(rawSource) {
  let src = stripTypesAndConvertFunctions(rawSource);

  const setupInfo = extractFunctionBody(src, "setup");
  const loopInfo = extractFunctionBody(src, "loop");
  if (!setupInfo || !loopInfo) {
    throw new Error("Couldn't find both setup() and loop() - every sketch needs both.");
  }

  const newSetupBody = yieldifyDelays(setupInfo.body);
  const newLoopBody = yieldifyDelays(loopInfo.body);

  // Replace loop() first if it comes after setup() in the source so
  // setup()'s earlier replacement doesn't shift loop()'s indices.
  const pieces = [
    { start: setupInfo.fullMatchStart, end: setupInfo.fullMatchEnd, text: `function* setup() {${newSetupBody}}` },
    { start: loopInfo.fullMatchStart, end: loopInfo.fullMatchEnd, text: `function* loop() {${newLoopBody}}` },
  ].sort((a, b) => a.start - b.start);

  let rebuilt = "";
  let cursor = 0;
  for (const p of pieces) {
    rebuilt += src.slice(cursor, p.start) + p.text;
    cursor = p.end;
  }
  rebuilt += src.slice(cursor);

  return rebuilt + "\nreturn { setup, loop };";
}

const ARG_NAMES = [
  "pinMode", "digitalWrite", "digitalRead", "analogWrite", "analogRead",
  "millis", "__delay", "__delayMicros", "Serial", "WiFi",
  "HIGH", "LOW", "INPUT", "OUTPUT", "INPUT_PULLUP", "WL_CONNECTED", "WL_DISCONNECTED",
];

export class ArduinoRuntime {
  /**
   * @param {object} node - the placed ESP32 node (needs .pins and .default_value)
   * @param {object} callbacks
   *   onPinWrite(terminal, volts) - called synchronously whenever code drives a pin
   *   getPinVoltage(terminal) => number - latest known voltage at a pin (from the last solve)
   *   onSerial(text) - Serial.print/println output
   *   onStatus({running, error}) - lifecycle/error updates
   */
  constructor(node, callbacks) {
    this.node = node;
    this.callbacks = callbacks;
    this.gpioToTerminal = {};
    for (const p of node.pins || []) {
      if (p.role === "gpio" && p.gpio != null) this.gpioToTerminal[p.gpio] = p.terminal;
    }
    this.vcc = node.default_value || 3.3;
    this.rafId = null;
    this.setupGen = null;
    this.loopGen = null;
    this.setupDone = false;
    this.pendingUntil = 0;
    this.startTime = 0;
    this.running = false;
  }

  _pinMode() {
    /* not electrically meaningful in this simplified model - direction is
       inferred from which function (digitalWrite vs digitalRead) is called */
  }

  _digitalWrite = (pin, value) => {
    const terminal = this.gpioToTerminal[pin];
    if (!terminal) return;
    this.callbacks.onPinWrite(terminal, value ? this.vcc : 0);
  };

  _digitalRead = (pin) => {
    const terminal = this.gpioToTerminal[pin];
    if (!terminal) return 0;
    const v = this.callbacks.getPinVoltage(terminal) || 0;
    return v > this.vcc / 2 ? 1 : 0;
  };

  _analogWrite = (pin, value) => {
    const terminal = this.gpioToTerminal[pin];
    if (!terminal) return;
    const duty = Math.max(0, Math.min(255, value)) / 255;
    this.callbacks.onPinWrite(terminal, duty * this.vcc);
  };

  _analogRead = (pin) => {
    const terminal = this.gpioToTerminal[pin];
    if (!terminal) return 0;
    const v = this.callbacks.getPinVoltage(terminal) || 0;
    return Math.round(Math.max(0, Math.min(1, v / this.vcc)) * 4095); // 12-bit ADC
  };

  _millis = () => Math.floor(performance.now() - this.startTime);

  _serial = {
    begin: () => {},
    print: (x) => this.callbacks.onSerial(String(x)),
    println: (x) => this.callbacks.onSerial(String(x) + "\n"),
  };

  // SIMULATED WiFi - there is no real network stack here. begin() always
  // "succeeds" after a short fake delay so IoT-style sketches (which
  // almost universally start with WiFi.begin(ssid, pass) and poll
  // WiFi.status()) run without throwing "WiFi is not defined", and
  // Serial.print output can narrate what a real device would be doing
  // (connecting, sending to a server, etc). No actual data goes anywhere.
  _wifiConnected = false;
  _wifi = {
    begin: (ssid) => {
      this.callbacks.onSerial(`[sim] Connecting to WiFi "${ssid || ""}"...\n`);
      this._wifiConnected = true;
    },
    status: () => (this._wifiConnected ? 3 : 0), // 3 mirrors real WL_CONNECTED's value
    localIP: () => "192.168.1.42", // fake, illustrative only
    disconnect: () => {
      this._wifiConnected = false;
    },
  };

  start(code) {
    this.stop();
    let program;
    try {
      const body = transpile(code);
      const factory = new Function(...ARG_NAMES, body);
      program = factory(
        this._pinMode, this._digitalWrite, this._digitalRead, this._analogWrite, this._analogRead,
        this._millis, (ms) => ({ __delay: true, ms }), () => {}, this._serial, this._wifi,
        1, 0, 0, 1, 2, 3, 0 // HIGH, LOW, INPUT, OUTPUT, INPUT_PULLUP, WL_CONNECTED, WL_DISCONNECTED
      );
    } catch (err) {
      this.callbacks.onStatus({ running: false, error: err.message });
      return;
    }

    this.program = program;
    this.setupGen = null;
    this.loopGen = null;
    this.setupDone = false;
    this.pendingUntil = 0;
    this.startTime = performance.now();
    this.running = true;
    this.callbacks.onStatus({ running: true, error: null });
    this.rafId = requestAnimationFrame(this._tick);
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    this.rafId = null;
    this.running = false;
    this.callbacks.onStatus({ running: false, error: null });
  }

  _tick = (now) => {
    if (!this.running) return;
    try {
      if (now < this.pendingUntil) {
        this.rafId = requestAnimationFrame(this._tick);
        return;
      }
      this.pendingUntil = 0;

      if (!this.setupDone) {
        if (!this.setupGen) this.setupGen = this.program.setup();
        const r = this.setupGen.next();
        if (r.done) this.setupDone = true;
        else this._handleYield(r.value, now);
      } else {
        if (!this.loopGen) this.loopGen = this.program.loop();
        const r = this.loopGen.next();
        if (r.done) this.loopGen = null; // one pass of loop() finished - start the next
        else this._handleYield(r.value, now);
      }
      this.rafId = requestAnimationFrame(this._tick);
    } catch (err) {
      this.callbacks.onStatus({ running: false, error: err.message });
      this.running = false;
    }
  };

  _handleYield(value, now) {
    if (value && value.__delay) this.pendingUntil = now + value.ms;
  }
}