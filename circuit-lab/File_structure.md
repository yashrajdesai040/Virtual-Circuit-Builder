Virtual Circuit Builder/
└── circuit-lab/
    ├── backend/
    │   ├── venv/
    │   ├── app.py                      <- registers all blueprints
    │   ├── auth.py
    │   ├── config.py
    │   ├── models.py                   <- User, Project, ProjectCollaborator,
    │   │                                   ProjectInvite, Follow, ProjectLike,
    │   │                                   ProjectComment
    │   ├── component_model.py          <- Component table definition
    │   ├── components.py               <- GET /api/components
    │   ├── electrical_models.py        <- classify(), board_pins()
    │   ├── mna_solver.py               <- solve_circuit()
    │   ├── projects.py                 <- CRUD, collaborators, invites (send)
    │   ├── invites.py                  <- list/accept/decline invites
    │   ├── users.py                    <- profile, follow, search
    │   ├── community.py                <- public gallery, likes, comments
    │   ├── Simulate.py                 <- /simulate and /simulate/live
    │   ├── seed.py                     <- component catalog, incl. esp32 pins
    │   ├── email_utils.py
    │   ├── migrate_db.py
    │   ├── requirements.txt
    │   └── circuitlab.db
    │
    └── frontend/
        ├── node_modules/
        ├── package.json
        ├── package-lock.json
        ├── vite.config.js
        ├── index.html
        └── src/
            ├── main.jsx
            ├── App.jsx                         <- all routes, incl. /u/:username, /people
            ├── index.css
            ├── api/
            │   └── client.js
            ├── context/
            │   └── AuthContext.jsx
            ├── constants/
            │   └── categoryColors.js
            ├── utils/
            │   ├── timeAgo.js
            │   └── arduinoRuntime.js           <- Arduino transpiler + runtime
            ├── pages/
            │   ├── Login.jsx
            │   ├── Register.jsx
            │   ├── VerifyEmail.jsx
            │   ├── Dashboard.jsx                <- refetches on invite-accept
            │   ├── Builder.jsx                  <- code editor + live sim wiring
            │   ├── Components.jsx
            │   ├── Tutorials.jsx
            │   ├── Share.jsx
            │   ├── CircuitView.jsx
            │   └── Profile.jsx                  <- /u/:username
            └── components/
                ├── AppShell.jsx                 <- nav, search icon, Profile tab
                ├── NotificationBell.jsx          <- red dot, invite-accepted event
                ├── ShareModal.jsx
                ├── PeopleSearch.jsx              <- /people route
                ├── FollowList.jsx                <- not yet wired (pending)
                ├── ProtectedRoute.jsx
                ├── CustomCursor.jsx
                ├── PageTransition.jsx
                ├── 3d/
                │   ├── PartModels.jsx
                │   └── PartViewer.jsx
                ├── builder/
                │   ├── ComponentPalette.jsx
                │   └── BoardCodeEditor.jsx       <- renamed from ESP32CodeEditor
                └── builder3d/
                    ├── Scene3D.jsx               <- multi-pin wire fix, onOpenCode
                    ├── PlacedPart3D.jsx           <- multi-pin rendering
                    ├── Wire3D.jsx
                    └── raycast.js