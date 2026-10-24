# ⚡ Virtual Circuit Builder (CircuitLab)

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-0.166-000000?style=flat-square&logo=three.js&logoColor=white)](https://threejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=flat-square&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![NumPy](https://img.shields.io/badge/NumPy-MNA%20Solver-013243?style=flat-square&logo=numpy&logoColor=white)](https://numpy.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)

An interactive, full-stack **3D Electronics Prototyping and Simulation Environment**. Build virtual circuits on breadboards with realistic 3D component models, write code for microcontrollers (ESP32/Arduino) in an integrated in-browser editor, and simulate DC circuits in real time using a custom **Modified Nodal Analysis (MNA)** solver powered by NumPy.

---

## 📸 Overview & Highlights

- **Interactive 3D Workspace**: Manipulate and place realistic 3D electrical components with precision pin-snapping and spline-based wire routing.
- **Real-Time Linear Simulation**: Backend SPICE-like Modified Nodal Analysis engine solves Kirchhoff's Current Law ($KCL$) and Ohm's Law matrices on the fly.
- **In-Browser Arduino / ESP32 Runtime**: Write sketch code directly in the browser; non-blocking generator execution drives virtual GPIO pins, analog signals, and serial debugging.
- **Cyberpunk / PCB Dark Aesthetics**: Inspired by electronic instrumentation, featuring animated trace backgrounds, liquid-metal feedback buttons, and oscilloscope HUD readouts.
- **Full-Stack Collaboration**: User authentication (JWT), project save/fork/versioning, community showcase, and real-time collaboration invites.

---

## 🛠️ Architecture & Tech Stack

```
                     ┌──────────────────────────────────────────────┐
                     │            VIRTUAL CIRCUIT BUILDER           │
                     └──────────────────────┬───────────────────────┘
                                            │
                    ┌───────────────────────┴───────────────────────┐
                    ▼                                               ▼
     ┌─────────────────────────────┐                 ┌─────────────────────────────┐
     │       FRONTEND (Vite)       │                 │       BACKEND (Flask)       │
     ├─────────────────────────────┤                 ├─────────────────────────────┤
     │ • React 18 + React Router   │                 │ • Flask 3.0 REST API        │
     │ • React Three Fiber + Drei  │ ──HTTP Proxy──► │ • NumPy MNA DC Solver       │
     │ • In-Browser Arduino Runtime│    (/api/*)     │ • SQLAlchemy ORM (SQLite)   │
     │ • GSAP + Framer Motion      │                 │ • Flask-JWT-Extended Auth   │
     │ • Canvas & Audio Effects    │                 │ • Blueprint modular routing │
     └─────────────────────────────┘                 └─────────────────────────────┘
```

### Frontend (`/circuit-lab/frontend`)
- **React 18 & Vite**: Lightning-fast hot module replacement and bundle optimization.
- **Three.js & @react-three/fiber / drei**: 3D raycasting, orbital controls, and component rendering.
- **React Flow**: Schematic and 2D topology integration.
- **Framer Motion & GSAP**: High-fidelity micro-interactions and transitions.
- **Custom Sound Synthesizer**: Subtle UI audio feedback on wire connection, switch toggles, and errors.

### Backend (`/circuit-lab/backend`)
- **Flask**: Lightweight, scalable REST microframework.
- **NumPy**: Matrix generation and linear system solving ($\mathbf{A}\mathbf{x} = \mathbf{z}$) for electrical networks.
- **SQLAlchemy & SQLite**: Persistence for users, projects, component catalogs, likes, and comments.
- **Flask-JWT-Extended**: Secure authentication and session management.

---

## 🧩 Key Features

### 1. 3D Circuit Canvas & Wire Routing
- Full 3D orbital camera with pan, zoom, and rotate.
- Terminal raycasting with intuitive pin highlight and magnetic snap-to-terminal.
- Dynamic 3D cubic Bezier wire curves that update naturally when parts are repositioned.
- Animated current indicators and continuity LED status.

### 2. MNA Electrical Simulation Engine
- Solves DC circuits using **Modified Nodal Analysis (MNA)**:
  $$\begin{bmatrix} \mathbf{G} & \mathbf{B} \\ \mathbf{C} & \mathbf{D} \end{bmatrix} \begin{bmatrix} \mathbf{v} \\ \mathbf{j} \end{bmatrix} = \begin{bmatrix} \mathbf{i} \\ \mathbf{e} \end{bmatrix}$$
- Accurately models independent voltage sources, ground references, diode threshold drops, and resistive loads.
- Evaluates net floating states, short circuits, and active branch currents.

### 3. In-Browser Arduino / ESP32 Code Editor
- Embedded code editor supporting common Arduino syntax (`setup()`, `loop()`, `pinMode()`, `digitalWrite()`, `delay()`).
- Transpiles sketch code into JavaScript generator functions to pause execution cleanly without blocking the browser thread.
- Direct bidirectional binding between code-driven GPIO pin states and the 3D circuit simulation.

### 4. Component Catalog
- **Microcontrollers**: ESP32 DevKit, Arduino Uno.
- **Passives & Active Parts**: Resistors (standard color-band values), Ceramic/Electrolytic Capacitors, LEDs (Red, Green, Blue, Yellow, RGB), Diodes.
- **Interactive Controls**: Pushbuttons, Toggle Switches, Potentiometers, Buzzers.
- **Power**: 9V Batteries, 5V DC supplies, 3.3V regulated rails, Ground bus.
- **Prototyping**: Standard solderless breadboards with connected power and terminal rails.

---

## 📁 Repository Structure

```
Virtual-Circuit-Builder/
├── circuit-lab/
│   ├── backend/                     # Flask REST API & Physics Engine
│   │   ├── app.py                   # App factory and blueprint configuration
│   │   ├── auth.py                  # User register, login, me endpoints
│   │   ├── models.py                # Database models (User, Project, Comment, etc.)
│   │   ├── mna_solver.py            # Modified Nodal Analysis (MNA) DC solver
│   │   ├── Simulate.py              # Circuit validation and simulation endpoints
│   │   ├── electrical_models.py     # Component classification and pin mapping
│   │   ├── seed.py                  # Component catalog database seed script
│   │   ├── requirements.txt         # Python dependencies
│   │   └── circuitlab.db            # SQLite database (auto-generated)
│   │
│   ├── frontend/                    # React 18 + Vite 3D Web App
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── 3d/              # 3D models & procedural mesh builders
│   │   │   │   ├── builder/         # Palette, code editor, measurements panel
│   │   │   │   ├── builder3d/       # Scene3D, PlacedPart3D, Wire3D, raycasting
│   │   │   │   └── AppShell.jsx     # Navigation and header HUD
│   │   │   ├── pages/               # Builder, Dashboard, Login, Register, Profile
│   │   │   ├── utils/
│   │   │   │   └── arduinoRuntime.js# In-browser Arduino sketch transpiler
│   │   │   ├── App.jsx              # Application router
│   │   │   └── main.jsx             # React entry point
│   │   ├── package.json             # NPM dependencies
│   │   └── vite.config.js           # Vite dev server + backend proxy setup
│   │
│   ├── design-system/               # Design specifications and token guidelines
│   └── README.md                    # Internal phase documentation
├── .gitignore                       # Clean repository exclusions
├── rt.pdf                           # Reference and research documentation
└── README.md                        # Project root documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or later) & **npm**
- **Python** (v3.10 or later)
- **Git**

---

### 1. Backend Setup

```bash
# Navigate to the backend directory
cd circuit-lab/backend

# Create a Python virtual environment
python -m venv venv

# Activate the virtual environment
# Windows (PowerShell):
venv\Scripts\Activate.ps1
# macOS / Linux:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt

# Run the Flask backend
python app.py
```

The backend server will start on **`http://127.0.0.1:5000`**. The SQLite database (`circuitlab.db`) is automatically initialized on the first launch.

---

### 2. Frontend Setup

In a separate terminal:

```bash
# Navigate to the frontend directory
cd circuit-lab/frontend

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

The frontend will run at **`http://localhost:5173`**. The Vite development server automatically proxies all `/api/*` requests to the Flask backend on port `5000`.

---

## 🧪 Running the Application

1. Open **`http://localhost:5173`** in your browser.
2. Sign up or log into your account.
3. Open the **Builder**:
   - Drag components from the **Component Palette** onto the 3D breadboard.
   - Click pins to connect wires.
   - Click on the microcontroller board to open the **Code Editor** and upload your Arduino code.
   - Press **Simulate** to run the live MNA electrical calculations and see your circuit come to life!

---

## 🤝 Contributing

Contributions, bug reports, and feature suggestions are welcome!

1. Fork the Project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  Built with passion for electronic hardware engineering, 3D web design, and simulation.
</p>
