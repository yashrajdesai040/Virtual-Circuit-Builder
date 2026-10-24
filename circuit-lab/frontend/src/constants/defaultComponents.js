export const DEFAULT_COMPONENTS = [
  {
    "key": "resistor",
    "name": "Resistor",
    "category": "passive",
    "description": "Limits current flow and divides voltage. Higher resistance means less current for a given voltage, per Ohm's Law (V = IR).",
    "model_type": "resistor",
    "unit": "\u03a9",
    "default_value": 220,
    "terminal_count": 2,
    "spec": {
      "tolerance": "\u00b15%",
      "power_rating": "0.25 W"
    }
  },
  {
    "key": "capacitor_electrolytic",
    "name": "Electrolytic Capacitor",
    "category": "passive",
    "description": "Polarized capacitor with high capacitance in a small package. Stores charge for smoothing and filtering \u2014 must be wired the right way round or it can fail.",
    "model_type": "capacitor_electrolytic",
    "unit": "\u00b5F",
    "default_value": 100,
    "terminal_count": 2,
    "spec": {
      "voltage_rating": "16V",
      "polarized": "yes"
    }
  },
  {
    "key": "capacitor_ceramic",
    "name": "Ceramic Capacitor",
    "category": "passive",
    "description": "Small, unpolarized disc capacitor used for decoupling and high-frequency filtering. Can be wired either way round.",
    "model_type": "capacitor_ceramic",
    "unit": "nF",
    "default_value": 100,
    "terminal_count": 2,
    "spec": {
      "voltage_rating": "50V",
      "polarized": "no"
    }
  },
  {
    "key": "inductor",
    "name": "Inductor",
    "category": "passive",
    "description": "Coil of wire that resists changes in current by storing energy in a magnetic field. Used in filters, converters, and chokes.",
    "model_type": "inductor",
    "unit": "mH",
    "default_value": 10,
    "terminal_count": 2,
    "spec": {
      "core": "ferrite"
    }
  },
  {
    "key": "potentiometer",
    "name": "Potentiometer",
    "category": "passive",
    "description": "A variable resistor with a rotating wiper \u2014 turning the knob changes resistance, commonly used for volume or brightness control.",
    "model_type": "potentiometer",
    "unit": "k\u03a9",
    "default_value": 10,
    "terminal_count": 3,
    "spec": {
      "taper": "linear"
    }
  },
  {
    "key": "fuse",
    "name": "Fuse",
    "category": "passive",
    "description": "Sacrificial link that melts and breaks the circuit if current exceeds a safe limit, protecting the rest of the components from damage.",
    "model_type": "fuse",
    "unit": "A",
    "default_value": 1,
    "terminal_count": 2,
    "spec": {
      "type": "fast-blow"
    }
  },
  {
    "key": "wire",
    "name": "Wire",
    "category": "passive",
    "description": "Connects two points with (ideally) zero resistance. In the builder, wires are what you draw between component terminals to complete a circuit.",
    "model_type": "wire",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {}
  },
  {
    "key": "led",
    "name": "LED",
    "category": "active",
    "description": "Light-emitting diode \u2014 conducts current in one direction only and emits light when forward biased. Needs a current-limiting resistor in series or it burns out.",
    "model_type": "led",
    "unit": "V",
    "default_value": 2.0,
    "terminal_count": 2,
    "spec": {
      "forward_voltage": "2.0V",
      "max_current": "20mA"
    }
  },
  {
    "key": "diode",
    "name": "Diode",
    "category": "active",
    "description": "Allows current to flow in only one direction. Used for rectification, protection against reverse voltage, and signal steering.",
    "model_type": "diode",
    "unit": "V",
    "default_value": 0.7,
    "terminal_count": 2,
    "spec": {
      "forward_voltage": "0.7V",
      "type": "silicon rectifier"
    }
  },
  {
    "key": "zener_diode",
    "name": "Zener Diode",
    "category": "active",
    "description": "A diode designed to conduct in reverse once a specific breakdown voltage is reached \u2014 used to hold a steady reference voltage.",
    "model_type": "zener_diode",
    "unit": "V",
    "default_value": 5.1,
    "terminal_count": 2,
    "spec": {
      "zener_voltage": "5.1V"
    }
  },
  {
    "key": "transistor_npn",
    "name": "NPN Transistor",
    "category": "active",
    "description": "Three-terminal switch/amplifier. A small current into the base lets a much larger current flow from collector to emitter.",
    "model_type": "transistor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "package": "TO-92",
      "type": "NPN (e.g. 2N2222)"
    }
  },
  {
    "key": "transistor_pnp",
    "name": "PNP Transistor",
    "category": "active",
    "description": "Like an NPN transistor but with current flow reversed \u2014 conducts when the base is pulled low relative to the emitter.",
    "model_type": "transistor_pnp",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "package": "TO-92",
      "type": "PNP (e.g. 2N3906)"
    }
  },
  {
    "key": "mosfet",
    "name": "MOSFET",
    "category": "active",
    "description": "Voltage-controlled switch used for higher-power switching than a regular transistor \u2014 the basis of most modern power electronics.",
    "model_type": "mosfet",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "package": "TO-220",
      "type": "N-channel"
    }
  },
  {
    "key": "ic_555",
    "name": "555 Timer IC",
    "category": "ic",
    "description": "Classic general-purpose timer chip used to build oscillators, delays, and pulse generators \u2014 a staple of beginner electronics.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 8,
    "spec": {
      "package": "DIP-8"
    }
  },
  {
    "key": "ic_opamp",
    "name": "Op-Amp IC",
    "category": "ic",
    "description": "Operational amplifier \u2014 a high-gain voltage amplifier used for signal conditioning, filtering, and comparison circuits.",
    "model_type": "ic_opamp",
    "unit": null,
    "default_value": null,
    "terminal_count": 8,
    "spec": {
      "package": "DIP-8",
      "type": "e.g. LM358"
    }
  },
  {
    "key": "voltage_regulator",
    "name": "Voltage Regulator",
    "category": "ic",
    "description": "Takes a variable input voltage and outputs a fixed, stable voltage \u2014 e.g. a 7805 turns anything from ~7-25V into a clean 5V.",
    "model_type": "voltage_regulator",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 3,
    "spec": {
      "package": "TO-220",
      "type": "7805 (5V fixed)"
    }
  },
  {
    "key": "battery_9v",
    "name": "9V Battery",
    "category": "source",
    "description": "Rectangular DC voltage source with snap terminals, commonly used to power small breadboard circuits.",
    "model_type": "battery_9v",
    "unit": "V",
    "default_value": 9.0,
    "terminal_count": 2,
    "spec": {
      "chemistry": "alkaline"
    }
  },
  {
    "key": "battery_aa",
    "name": "AA Battery",
    "category": "source",
    "description": "Cylindrical 1.5V cell. Combine several in series to build up higher voltages for a circuit.",
    "model_type": "battery_aa",
    "unit": "V",
    "default_value": 1.5,
    "terminal_count": 2,
    "spec": {
      "chemistry": "alkaline"
    }
  },
  {
    "key": "solar_panel",
    "name": "Solar Panel",
    "category": "source",
    "description": "Converts light into DC voltage via the photovoltaic effect. Output varies with how much light is hitting it.",
    "model_type": "solar_panel",
    "unit": "V",
    "default_value": 6.0,
    "terminal_count": 2,
    "spec": {
      "type": "polycrystalline"
    }
  },
  {
    "key": "switch",
    "name": "Switch",
    "category": "control",
    "description": "Mechanically opens or closes a circuit path. Open = infinite resistance, no current flows. Closed = near-zero resistance, current flows freely.",
    "model_type": "switch",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "SPST"
    }
  },
  {
    "key": "push_button",
    "name": "Push Button",
    "category": "control",
    "description": "Momentary switch \u2014 only closes the circuit while it's physically held down, then springs back open.",
    "model_type": "push_button",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "momentary, normally-open"
    }
  },
  {
    "key": "relay",
    "name": "Relay",
    "category": "control",
    "description": "An electromagnetic switch \u2014 a small control current energizes a coil that mechanically closes a separate, often higher-power, circuit.",
    "model_type": "relay",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 4,
    "spec": {
      "coil_voltage": "5V"
    }
  },
  {
    "key": "dip_switch",
    "name": "DIP Switch",
    "category": "control",
    "description": "A bank of small individual on/off switches in one package, often used to set configuration options on a board.",
    "model_type": "dip_switch",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "positions": 4
    }
  },
  {
    "key": "buzzer",
    "name": "Buzzer",
    "category": "output",
    "description": "Piezoelectric component that produces a tone when voltage is applied \u2014 commonly used for alerts and simple feedback.",
    "model_type": "buzzer",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 2,
    "spec": {
      "type": "piezo"
    }
  },
  {
    "key": "dc_motor",
    "name": "DC Motor",
    "category": "output",
    "description": "Converts electrical energy into rotational motion. Speed roughly scales with applied voltage.",
    "model_type": "dc_motor",
    "unit": "V",
    "default_value": 6.0,
    "terminal_count": 2,
    "spec": {
      "type": "brushed"
    }
  },
  {
    "key": "speaker",
    "name": "Speaker",
    "category": "output",
    "description": "Converts an electrical audio signal into sound via a vibrating cone driven by a magnet and coil.",
    "model_type": "speaker",
    "unit": "\u03a9",
    "default_value": 8,
    "terminal_count": 2,
    "spec": {
      "impedance": "8\u03a9"
    }
  },
  {
    "key": "ldr",
    "name": "Photoresistor (LDR)",
    "category": "sensor",
    "description": "Light-dependent resistor \u2014 its resistance drops as more light hits it, commonly used to detect brightness or darkness.",
    "model_type": "ldr",
    "unit": "k\u03a9",
    "default_value": 10,
    "terminal_count": 2,
    "spec": {
      "dark_resistance": "~1M\u03a9",
      "light_resistance": "~1k\u03a9"
    }
  },
  {
    "key": "thermistor",
    "name": "Thermistor",
    "category": "sensor",
    "description": "Temperature-dependent resistor \u2014 resistance changes predictably with temperature, used to build simple temperature sensors.",
    "model_type": "thermistor",
    "unit": "k\u03a9",
    "default_value": 10,
    "terminal_count": 2,
    "spec": {
      "type": "NTC"
    }
  },
  {
    "key": "esp32",
    "name": "ESP32 Dev Board",
    "category": "board",
    "description": "A 32-bit dual-core microcontroller board with built-in Wi-Fi and Bluetooth \u2014 the go-to choice for IoT projects that need wireless connectivity.",
    "model_type": "dev_board",
    "unit": "V",
    "default_value": 3.3,
    "terminal_count": 30,
    "spec": {
      "cpu": "dual-core 240MHz",
      "wifi": "802.11 b/g/n",
      "flash": "4MB",
      "gpio_pins": 30
    }
  },
  {
    "key": "arduino_uno",
    "name": "Arduino Uno",
    "category": "board",
    "description": "The classic beginner-friendly microcontroller board built around the ATmega328P chip \u2014 simple, well-documented, and everywhere in tutorials.",
    "model_type": "arduino_uno",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 20,
    "spec": {
      "microcontroller": "ATmega328P",
      "digital_pins": 14,
      "analog_pins": 6,
      "clock_speed": "16MHz"
    }
  },
  {
    "key": "raspberry_pi_pico",
    "name": "Raspberry Pi Pico",
    "category": "board",
    "description": "A tiny, low-cost microcontroller board built around the RP2040 chip, with a generous number of GPIO pins and dual-core processing.",
    "model_type": "raspberry_pi_pico",
    "unit": "V",
    "default_value": 3.3,
    "terminal_count": 26,
    "spec": {
      "chip": "RP2040",
      "gpio_pins": 26,
      "clock_speed": "133MHz"
    }
  },
  {
    "key": "arduino_nano",
    "name": "Arduino Nano",
    "category": "board",
    "description": "A breadboard-friendly, compact version of the Arduino Uno \u2014 same ATmega328P chip in a much smaller footprint.",
    "model_type": "arduino_nano",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 22,
    "spec": {
      "microcontroller": "ATmega328P",
      "size": "compact"
    }
  },
  {
    "key": "coin_cell",
    "name": "Coin Cell (CR2032)",
    "category": "source",
    "description": "A small flat 3V lithium battery commonly used to power low-drain circuits like clocks and small sensor boards.",
    "model_type": "coin_cell",
    "unit": "V",
    "default_value": 3.0,
    "terminal_count": 2,
    "spec": {
      "chemistry": "lithium",
      "size": "CR2032"
    }
  },
  {
    "key": "bench_power_supply",
    "name": "Bench Power Supply",
    "category": "source",
    "description": "A lab instrument that provides an adjustable, regulated DC voltage \u2014 used for testing circuits without a battery.",
    "model_type": "bench_psu",
    "unit": "V",
    "default_value": 12.0,
    "terminal_count": 2,
    "spec": {
      "adjustable": "0-30V",
      "current_limit": "3A"
    }
  },
  {
    "key": "usb_power",
    "name": "USB Power",
    "category": "source",
    "description": "A standard USB port supplying a regulated 5V \u2014 the most common way to power small microcontroller projects.",
    "model_type": "usb_power",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 2,
    "spec": {
      "connector": "USB-A/C"
    }
  },
  {
    "key": "schottky_diode",
    "name": "Schottky Diode",
    "category": "active",
    "description": "A fast-switching diode with a lower forward-voltage drop than a standard silicon diode \u2014 common in power supply and protection circuits.",
    "model_type": "schottky_diode",
    "unit": "V",
    "default_value": 0.3,
    "terminal_count": 2,
    "spec": {
      "forward_voltage": "0.3V",
      "type": "fast recovery"
    }
  },
  {
    "key": "bridge_rectifier",
    "name": "Bridge Rectifier",
    "category": "active",
    "description": "Four diodes arranged to convert AC into pulsing DC \u2014 the first stage of most simple power supplies.",
    "model_type": "bridge_rectifier",
    "unit": null,
    "default_value": null,
    "terminal_count": 4,
    "spec": {
      "package": "4-pin bridge"
    }
  },
  {
    "key": "rgb_led",
    "name": "RGB LED",
    "category": "active",
    "description": "An LED with red, green, and blue elements in one package, mixed to produce any color \u2014 usually needs a resistor per channel just like a regular LED.",
    "model_type": "rgb_led",
    "unit": "V",
    "default_value": 2.0,
    "terminal_count": 2,
    "spec": {
      "type": "common cathode"
    }
  },
  {
    "key": "rocker_switch",
    "name": "Rocker Switch",
    "category": "control",
    "description": "A rectangular rocker-style ON/OFF switch, commonly seen on the back of power supplies and appliances.",
    "model_type": "rocker_switch",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "SPST"
    }
  },
  {
    "key": "slide_switch",
    "name": "Slide Switch",
    "category": "control",
    "description": "A small switch toggled by sliding a lever from one side to the other \u2014 common on battery compartments.",
    "model_type": "slide_switch",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "SPDT"
    }
  },
  {
    "key": "temperature_sensor",
    "name": "Temperature Sensor",
    "category": "sensor",
    "description": "Outputs a voltage or digital signal proportional to temperature \u2014 e.g. an LM35 or DS18B20, used to build thermometers and thermostats.",
    "model_type": "to92_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "package": "TO-92",
      "type": "e.g. LM35 / DS18B20"
    }
  },
  {
    "key": "ultrasonic_sensor",
    "name": "Ultrasonic Sensor",
    "category": "sensor",
    "description": "Measures distance by timing an ultrasonic pulse's echo \u2014 the classic HC-SR04 module used in robotics for obstacle detection.",
    "model_type": "ultrasonic_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 4,
    "spec": {
      "range": "2cm - 4m",
      "type": "HC-SR04"
    }
  },
  {
    "key": "ir_sensor",
    "name": "IR Sensor",
    "category": "sensor",
    "description": "Detects infrared light \u2014 used for line-following robots, remote control receivers, and simple proximity detection.",
    "model_type": "ir_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "type": "reflective IR pair"
    }
  },
  {
    "key": "pir_motion_sensor",
    "name": "PIR Motion Sensor",
    "category": "sensor",
    "description": "Detects movement by sensing changes in infrared radiation from warm bodies \u2014 the sensor behind most motion-activated lights.",
    "model_type": "pir_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "range": "~7m",
      "type": "passive infrared"
    }
  },
  {
    "key": "gas_sensor",
    "name": "Gas Sensor",
    "category": "sensor",
    "description": "Detects the concentration of gases like smoke, LPG, or CO in the air \u2014 commonly an MQ-series module.",
    "model_type": "gas_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 4,
    "spec": {
      "type": "MQ-series"
    }
  },
  {
    "key": "humidity_sensor",
    "name": "Humidity Sensor",
    "category": "sensor",
    "description": "Measures relative humidity (and often temperature too) \u2014 a DHT11/DHT22 is the classic beginner module for this.",
    "model_type": "humidity_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "type": "DHT11/DHT22"
    }
  },
  {
    "key": "hall_effect_sensor",
    "name": "Hall Effect Sensor",
    "category": "sensor",
    "description": "Detects the presence and strength of a magnetic field \u2014 used for contactless switches, speed sensing, and position detection.",
    "model_type": "to92_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "package": "TO-92"
    }
  },
  {
    "key": "touch_sensor",
    "name": "Touch Sensor",
    "category": "sensor",
    "description": "Detects a touch via capacitive sensing on a small pad \u2014 used as a simple button replacement with no moving parts.",
    "model_type": "touch_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "type": "capacitive"
    }
  },
  {
    "key": "logic_and",
    "name": "AND Gate IC",
    "category": "ic",
    "description": "Outputs high only when all its inputs are high \u2014 a fundamental digital logic building block, typically a 74-series chip.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7408"
    }
  },
  {
    "key": "logic_or",
    "name": "OR Gate IC",
    "category": "ic",
    "description": "Outputs high when at least one input is high.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7432"
    }
  },
  {
    "key": "logic_xor",
    "name": "XOR Gate IC",
    "category": "ic",
    "description": "Outputs high only when its inputs differ \u2014 used for comparators and parity/adder circuits.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7486"
    }
  },
  {
    "key": "logic_nand",
    "name": "NAND Gate IC",
    "category": "ic",
    "description": "The inverse of AND \u2014 functionally complete, meaning any other logic gate can be built from NAND gates alone.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7400"
    }
  },
  {
    "key": "logic_nor",
    "name": "NOR Gate IC",
    "category": "ic",
    "description": "The inverse of OR \u2014 also functionally complete on its own, like NAND.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7402"
    }
  },
  {
    "key": "logic_not",
    "name": "NOT Gate IC (Inverter)",
    "category": "ic",
    "description": "Flips its input \u2014 high becomes low, low becomes high. The simplest possible logic gate.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7404"
    }
  },
  {
    "key": "flip_flop",
    "name": "Flip-Flop IC",
    "category": "ic",
    "description": "A basic memory element that stores one bit \u2014 the building block of registers, counters, and sequential logic circuits.",
    "model_type": "ic_dip",
    "unit": null,
    "default_value": null,
    "terminal_count": 14,
    "spec": {
      "package": "DIP-14",
      "type": "e.g. 7474 D flip-flop"
    }
  },
  {
    "key": "seven_segment_display",
    "name": "7-Segment Display",
    "category": "display",
    "description": "Seven LED segments arranged to show a single digit (0-9) \u2014 the classic display for clocks, counters, and simple readouts.",
    "model_type": "seven_segment",
    "unit": null,
    "default_value": null,
    "terminal_count": 10,
    "spec": {
      "digits": 1,
      "type": "common cathode"
    }
  },
  {
    "key": "lcd_display",
    "name": "LCD Display (16x2)",
    "category": "display",
    "description": "A character liquid-crystal display, typically 16 columns by 2 rows \u2014 a staple for showing readable text output from a project.",
    "model_type": "lcd_display",
    "unit": null,
    "default_value": null,
    "terminal_count": 16,
    "spec": {
      "size": "16x2",
      "backlight": "yes"
    }
  },
  {
    "key": "oled_display",
    "name": "OLED Display",
    "category": "display",
    "description": "A small, high-contrast pixel display that doesn't need a backlight \u2014 common in wearables and compact projects.",
    "model_type": "oled_display",
    "unit": null,
    "default_value": null,
    "terminal_count": 4,
    "spec": {
      "size": "0.96 inch",
      "interface": "I2C"
    }
  },
  {
    "key": "led_matrix",
    "name": "LED Matrix",
    "category": "display",
    "description": "A grid of individually addressable LEDs used to display simple graphics, scrolling text, or animations.",
    "model_type": "led_matrix",
    "unit": null,
    "default_value": null,
    "terminal_count": 16,
    "spec": {
      "size": "8x8"
    }
  },
  {
    "key": "servo_motor",
    "name": "Servo Motor",
    "category": "output",
    "description": "A motor with built-in position control \u2014 send it a signal and its shaft moves to (and holds) a specific angle. Common in robotics.",
    "model_type": "servo_motor",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 2,
    "spec": {
      "rotation": "0-180\u00b0",
      "control": "PWM"
    }
  },
  {
    "key": "stepper_motor",
    "name": "Stepper Motor",
    "category": "output",
    "description": "Moves in small, precise steps rather than spinning freely \u2014 used wherever exact positioning matters, like 3D printers.",
    "model_type": "stepper_motor",
    "unit": "V",
    "default_value": 12.0,
    "terminal_count": 2,
    "spec": {
      "type": "bipolar",
      "steps_per_rev": 200
    }
  },
  {
    "key": "fan",
    "name": "DC Fan",
    "category": "output",
    "description": "A small brushless fan for cooling \u2014 spins faster with more applied voltage, just like a DC motor.",
    "model_type": "fan",
    "unit": "V",
    "default_value": 12.0,
    "terminal_count": 2,
    "spec": {
      "type": "brushless"
    }
  },
  {
    "key": "crystal_oscillator",
    "name": "Crystal Oscillator",
    "category": "passive",
    "description": "A quartz crystal that vibrates at a precise frequency when powered, giving microcontrollers an accurate clock signal.",
    "model_type": "crystal_oscillator",
    "unit": "MHz",
    "default_value": 16,
    "terminal_count": 2,
    "spec": {
      "frequency": "16MHz"
    }
  },
  {
    "key": "ic_socket",
    "name": "IC Socket",
    "category": "ic",
    "description": "A socket you solder to a board so a chip can be plugged in and swapped out later, rather than soldered in permanently.",
    "model_type": "ic_socket",
    "unit": null,
    "default_value": null,
    "terminal_count": 8,
    "spec": {
      "package": "DIP-8"
    }
  },
  {
    "key": "breadboard",
    "name": "Breadboard",
    "category": "passive",
    "description": "A reusable prototyping board with a grid of connected holes \u2014 lets you build and rewire circuits without soldering anything.",
    "model_type": "breadboard",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "tie_points": "830"
    }
  },
  {
    "key": "terminal_block",
    "name": "Terminal Block",
    "category": "passive",
    "description": "A row of screw terminals for making solid, reusable wire connections without soldering.",
    "model_type": "terminal_block",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "positions": 2
    }
  },
  {
    "key": "resistor_variable",
    "name": "Trimmer Potentiometer",
    "category": "passive",
    "description": "A small screw-adjustable variable resistor, meant to be tuned once during calibration rather than used as a user control.",
    "model_type": "resistor_variable",
    "unit": "k\u03a9",
    "default_value": 10,
    "terminal_count": 3,
    "spec": {
      "adjustment": "screwdriver trim"
    }
  },
  {
    "key": "polyester_capacitor",
    "name": "Polyester Film Capacitor",
    "category": "passive",
    "description": "An unpolarized capacitor with stable, low-loss characteristics \u2014 common in audio and timing circuits where precision matters more than raw capacitance.",
    "model_type": "polyester_capacitor",
    "unit": "nF",
    "default_value": 100,
    "terminal_count": 2,
    "spec": {
      "voltage_rating": "63V",
      "polarized": "no"
    }
  },
  {
    "key": "varistor",
    "name": "Varistor (MOV)",
    "category": "passive",
    "description": "A voltage-dependent resistor that stays near-infinite resistance until a trigger voltage is exceeded, then conducts heavily \u2014 used to clamp voltage spikes and protect circuits.",
    "model_type": "varistor",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "metal oxide varistor"
    }
  },
  {
    "key": "ferrite_bead",
    "name": "Ferrite Bead",
    "category": "passive",
    "description": "A small bead of ferrite material threaded onto a wire to suppress high-frequency noise, while passing DC and low-frequency signal through freely.",
    "model_type": "ferrite_bead",
    "unit": "\u03a9",
    "default_value": 100,
    "terminal_count": 2,
    "spec": {
      "impedance_at_100MHz": "100\u03a9"
    }
  },
  {
    "key": "jumper_wire",
    "name": "Jumper Wire",
    "category": "passive",
    "description": "A pre-terminated wire used for breadboard prototyping \u2014 male or female ends for making quick, solderless connections.",
    "model_type": "jumper_wire",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "male-male"
    }
  },
  {
    "key": "ir_led",
    "name": "Infrared LED",
    "category": "active",
    "description": "An LED that emits invisible infrared light instead of visible light \u2014 the transmitter half of most remote controls and IR proximity sensors.",
    "model_type": "ir_led",
    "unit": "V",
    "default_value": 1.2,
    "terminal_count": 2,
    "spec": {
      "wavelength": "940nm",
      "max_current": "20mA"
    }
  },
  {
    "key": "laser_diode",
    "name": "Laser Diode",
    "category": "active",
    "description": "A diode that emits a coherent, focused beam of light rather than the diffuse glow of an LED \u2014 used in laser pointers, barcode scanners, and optical drives.",
    "model_type": "laser_diode",
    "unit": "V",
    "default_value": 2.2,
    "terminal_count": 2,
    "spec": {
      "output_power": "5mW (typical low-power)"
    }
  },
  {
    "key": "photodiode",
    "name": "Photodiode",
    "category": "sensor",
    "description": "A diode that generates a small current proportional to the light hitting it \u2014 the receiving half of IR remotes, and used in light meters and optical sensors.",
    "model_type": "photodiode",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "PIN photodiode"
    }
  },
  {
    "key": "led_strip",
    "name": "LED Strip (per segment)",
    "category": "output",
    "description": "A flexible strip of individually-wired LEDs, modeled here as a single lighting segment \u2014 used for backlighting and decorative lighting runs.",
    "model_type": "led_strip",
    "unit": "V",
    "default_value": 2.0,
    "terminal_count": 2,
    "spec": {
      "leds_per_meter": 60
    }
  },
  {
    "key": "microcontroller_atmega328",
    "name": "ATmega328 IC",
    "category": "ic",
    "description": "The bare microcontroller chip at the heart of the Arduino Uno \u2014 the same processor, without the board, power regulation, or USB interface around it.",
    "model_type": "microcontroller_atmega328",
    "unit": null,
    "default_value": null,
    "terminal_count": 28,
    "spec": {
      "package": "DIP-28",
      "flash": "32KB"
    }
  },
  {
    "key": "eeprom_ic",
    "name": "EEPROM IC",
    "category": "ic",
    "description": "Non-volatile memory that retains stored data even with power removed \u2014 commonly used to save settings or logs that need to survive a reset.",
    "model_type": "eeprom_ic",
    "unit": null,
    "default_value": null,
    "terminal_count": 8,
    "spec": {
      "package": "DIP-8",
      "capacity": "256Kbit"
    }
  },
  {
    "key": "adc_ic",
    "name": "ADC IC",
    "category": "ic",
    "description": "An analog-to-digital converter chip \u2014 turns a continuously variable voltage into a digital number a microcontroller can read directly.",
    "model_type": "adc_ic",
    "unit": null,
    "default_value": null,
    "terminal_count": 8,
    "spec": {
      "package": "DIP-8",
      "resolution": "12-bit"
    }
  },
  {
    "key": "accelerometer",
    "name": "Accelerometer",
    "category": "sensor",
    "description": "Measures acceleration along one or more axes \u2014 used to detect tilt, motion, orientation, and vibration in everything from phones to drones.",
    "model_type": "accelerometer",
    "unit": null,
    "default_value": null,
    "terminal_count": 8,
    "spec": {
      "axes": 3,
      "interface": "I2C"
    }
  },
  {
    "key": "lithium_battery",
    "name": "18650 Li-ion Cell",
    "category": "source",
    "description": "A rechargeable cylindrical lithium-ion cell, the same form factor used in laptop battery packs, power tools, and many DIY battery builds.",
    "model_type": "lithium_battery",
    "unit": "V",
    "default_value": 3.7,
    "terminal_count": 2,
    "spec": {
      "chemistry": "Li-ion",
      "capacity": "2600mAh (typical)"
    }
  },
  {
    "key": "power_bank",
    "name": "USB Power Bank",
    "category": "source",
    "description": "A portable rechargeable battery pack with a regulated 5V USB output \u2014 a convenient, stable power source for breadboard projects away from a wall outlet.",
    "model_type": "power_bank",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 2,
    "spec": {
      "output": "5V USB",
      "capacity": "10000mAh (typical)"
    }
  },
  {
    "key": "limit_switch",
    "name": "Limit Switch",
    "category": "control",
    "description": "A mechanical switch triggered by physical contact with a lever or plunger \u2014 used to detect the end of travel on motors, doors, and moving mechanisms.",
    "model_type": "limit_switch",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "normally-open, lever-actuated"
    }
  },
  {
    "key": "reed_switch",
    "name": "Reed Switch",
    "category": "control",
    "description": "A switch that closes when a magnet passes nearby \u2014 the sensor behind most door/window alarm contacts.",
    "model_type": "reed_switch",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "type": "magnetically actuated"
    }
  },
  {
    "key": "solenoid",
    "name": "Solenoid Actuator",
    "category": "output",
    "description": "An electromagnetic coil that pulls a metal plunger when energized, converting electrical current directly into linear mechanical motion.",
    "model_type": "solenoid",
    "unit": "V",
    "default_value": 12.0,
    "terminal_count": 2,
    "spec": {
      "stroke": "10mm (typical)"
    }
  },
  {
    "key": "vibration_motor",
    "name": "Vibration Motor",
    "category": "output",
    "description": "A small DC motor with an off-center weight on its shaft \u2014 spins to produce vibration rather than useful rotation, as used in phone haptics.",
    "model_type": "vibration_motor",
    "unit": "V",
    "default_value": 3.0,
    "terminal_count": 2,
    "spec": {
      "type": "coin / pager motor"
    }
  },
  {
    "key": "rgb_led_display",
    "name": "RGB LED Indicator Bar",
    "category": "display",
    "description": "A row of individually addressable RGB LEDs used as a compact status or level indicator, rather than a full pixel display.",
    "model_type": "rgb_led_display",
    "unit": null,
    "default_value": null,
    "terminal_count": 3,
    "spec": {
      "leds": 8
    }
  },
  {
    "key": "nixie_tube",
    "name": "Nixie Tube",
    "category": "display",
    "description": "A vintage glow-discharge display tube that lights up one glowing digit at a time \u2014 the retro numeric display of choice before LEDs took over.",
    "model_type": "nixie_tube",
    "unit": null,
    "default_value": null,
    "terminal_count": 11,
    "spec": {
      "style": "vintage / retro"
    }
  },
  {
    "key": "arduino_mega",
    "name": "Arduino Mega",
    "category": "board",
    "description": "A larger Arduino board with far more I/O pins and memory than the Uno \u2014 used when a project outgrows the Uno's 14 digital pins.",
    "model_type": "arduino_mega",
    "unit": "V",
    "default_value": 5.0,
    "terminal_count": 54,
    "spec": {
      "microcontroller": "ATmega2560",
      "digital_pins": 54,
      "analog_pins": 16
    }
  },
  {
    "key": "teensy",
    "name": "Teensy 4.0",
    "category": "board",
    "description": "A very small, very fast USB-based microcontroller board \u2014 popular for projects that need serious processing power in a tiny footprint.",
    "model_type": "teensy",
    "unit": "V",
    "default_value": 3.3,
    "terminal_count": 40,
    "spec": {
      "clock_speed": "600MHz"
    }
  },
  {
    "key": "heat_sink",
    "name": "Heat Sink",
    "category": "passive",
    "description": "A finned metal block that draws heat away from a hot component and dissipates it into the surrounding air \u2014 a purely thermal, not electrical, part.",
    "model_type": "heat_sink",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "material": "aluminum"
    }
  },
  {
    "key": "soil_moisture_sensor",
    "name": "Soil Moisture Sensor",
    "category": "sensor",
    "description": "Measures how much moisture is in soil by reading the conductivity between two probes \u2014 the core sensor behind most automatic plant-watering projects.",
    "model_type": "soil_moisture_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "output": "analog"
    }
  },
  {
    "key": "flame_sensor",
    "name": "Flame Sensor",
    "category": "sensor",
    "description": "Detects the infrared light signature of a flame within a few meters \u2014 commonly used in fire-detection and safety-shutoff projects.",
    "model_type": "flame_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "range": "~1m"
    }
  },
  {
    "key": "water_level_sensor",
    "name": "Water Level Sensor",
    "category": "sensor",
    "description": "A row of exposed traces that reads how far up they're submerged in water, giving a rough analog reading of liquid level.",
    "model_type": "water_level_sensor",
    "unit": null,
    "default_value": null,
    "terminal_count": 2,
    "spec": {
      "output": "analog"
    }
  }
];
export default DEFAULT_COMPONENTS;
