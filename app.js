/* ==========================================
   IR-BVHT PORTAL - INTERACTIVE LOGIC ENGINE
   ========================================== */

// --- DATA STRUCTURES ---

// 1. Component Data per Manufacturer
const componentsData = {
    amit: {
        'node-pan': {
            title: 'Amit Lavatory Pan & Spray',
            desc: 'The stainless steel bowl interface. Features specialized high-pressure spray nozzle arrays to flush fecal matter using only 0.5 - 0.75 L of water.',
            pressure: '0.8 - 1.2 bar (Water)',
            voltage: 'N/A',
            fault: 'Spray nozzle scaling / Water sensor bypass fault.',
            video: 'air_ejector_maintenance.webm'
        },
        'node-inlet-valve': {
            title: 'Amit Inlet Pinch Valve',
            desc: 'Pneumatically-actuated pinch sleeve valve. When the flush starts, pilot solenoid activates air pressure to compress or release the rubber sleeve, opening/closing the bowl seal.',
            pressure: '5.0 - 6.0 bar (Pneumatic Pilot)',
            voltage: '110V DC (Solenoid Coil)',
            fault: 'Sleeve puncture (E02) or solenoid coil burnout.',
            video: 'amit_pinch_valve_replacement.webm'
        },
        'node-vacuum-tank': {
            title: 'Amit Intermediate Vacuum Tank',
            desc: 'A robust steel chamber that holds negative pressure (-0.35 bar). It acts as a temporary holding zone to store waste sucked from the pan before discharging it to the bio-digester.',
            pressure: '-0.30 to -0.40 bar (Vacuum)',
            voltage: 'N/A',
            fault: 'Vacuum drop due to weld hairline cracks or seal aging.',
            video: 'air_ejector_maintenance.webm'
        },
        'node-ejector': {
            title: 'Amit Venturi Ejector & Regulator',
            desc: 'Uses pressurized air through a venturi nozzle to generate vacuum in the intermediate tank. Equipped with a micro-regulator to filter and stabilize feed air.',
            pressure: '5.0 bar feed / -0.35 bar output',
            voltage: '110V DC Solenoid Control',
            fault: 'Nozzle blocking / regulator diaphragm rupture (E01).',
            video: 'air_ejector_maintenance.webm'
        },
        'node-outlet-valve': {
            title: 'Amit Outlet Pinch Valve',
            desc: 'Sits at the base of the vacuum tank. Controls the pressurized ejection cycle of waste from the intermediate tank into the primary bio-digester.',
            pressure: '5.0 - 6.0 bar (Pneumatic Pilot)',
            voltage: '110V DC (Solenoid Coil)',
            fault: 'Discharge blockage / valve failed to open (E03).',
            video: 'amit_pinch_valve_replacement.webm'
        },
        'node-digester': {
            title: 'Amit DRDO Bio-Digester Tank',
            desc: 'Multi-chamber anaerobic biodegrader tank containing specialized bacteria to decompose waste into water and carbon dioxide, eliminating smell and disposal hazards.',
            pressure: 'Atmospheric',
            voltage: 'N/A',
            fault: 'Bacterial culture depletion due to chemical disinfectant washing.',
            video: 'soft_reverse_procedure_guide.webm'
        }
    },
    oasis: {
        'node-pan': {
            title: 'Oasis Lavatory Pan & Jet',
            desc: 'High-polish ergonomic bowl designed for Indian Railways coaches, utilizing a pressurized water jet ring to ensure complete wash with minimal fluid footprint.',
            pressure: '1.0 - 1.5 bar (Water)',
            voltage: 'N/A',
            fault: 'Jet collar block / low water pressure alarm (F-03).',
            video: 'oasis_solenoid_calibration.webm'
        },
        'node-inlet-valve': {
            title: 'Oasis Inlet Pinch Valve',
            desc: 'Heavy-duty pneumatic pinch valve with integrated magnetic limit switches to report open/closed state directly to the Oasis Micro-PLC.',
            pressure: '4.8 - 5.5 bar (Pneumatic Pilot)',
            voltage: '110V DC',
            fault: 'Limit switch misalignment / valve sleeve jam (F-04).',
            video: 'oasis_solenoid_calibration.webm'
        },
        'node-vacuum-tank': {
            title: 'Oasis Intermediate Tank',
            desc: 'Compact vacuum-rated reservoir that serves as the pneumatic lock buffer between the toilet pan and the under-slung biodigester.',
            pressure: '-0.32 to -0.38 bar',
            voltage: 'N/A',
            fault: 'Level safety switch malfunction (fails to lock out flush).',
            video: 'air_ejector_maintenance.webm'
        },
        'node-ejector': {
            title: 'Oasis Vacuum Ejector Block',
            desc: 'Pneumatic ejector assembly equipped with dual solenoid valves (vacuum cycle & positive discharge pressuring) and diagnostic pressure ports.',
            pressure: '4.8 bar min feed / -0.35 bar vacuum',
            voltage: '110V DC (Dual coils)',
            fault: 'Ejector solenoid coil insulation failure (F-02).',
            video: 'oasis_solenoid_calibration.webm'
        },
        'node-outlet-valve': {
            title: 'Oasis Outlet Pinch Valve',
            desc: 'Pneumatic discharge pinch valve with limit switches. Ensures intermediate tank isolating integrity when generating negative pressures.',
            pressure: '4.8 - 5.5 bar',
            voltage: '110V DC',
            fault: 'Discharge sleeve clog / pressure switch error (F-05).',
            video: 'oasis_solenoid_calibration.webm'
        },
        'node-digester': {
            title: 'Oasis Bio-Toilet Digester System',
            desc: 'Underframe-mounted anaerobic inoculum-charged chamber that processes sewage effluent before clean water disposal on the tracks.',
            pressure: 'Atmospheric',
            voltage: 'N/A',
            fault: 'Chlorinator unit overflow / blockage in chlorination tray.',
            video: 'soft_reverse_procedure_guide.webm'
        }
    }
};

// 2. PLC Fault Codes Definitions
const faultCodes = {
    amit: [
        { code: 'E01', name: 'E01: Vacuum Generation Failure', cause: 'Low MR air pressure (<4.5B), ejector nozzle clogging, or ejector solenoid coil failure.', steps: ['Check if coaching underframe air supply valve is open.', 'Verify MR air pressure dial displays > 5.0 bar.', 'Measure resistance on Solenoid coil (normal range 110-130 ohms).', 'Clean Venturi nozzle with a 1.2mm nozzle wire.'], video: 'air_ejector_maintenance.webm' },
        { code: 'E02', name: 'E02: Inlet Pinch Valve Fault', cause: 'Inlet valve failed to open/close properly or pneumatic control tube is pinched/leaking.', steps: ['Examine 8mm pneumatic hoses connected to Inlet valve.', 'Run Soft-Reverse procedure to check sleeve response.', 'Check for mechanical blockage inside toilet pan throat.', 'Inspect inlet limit/pressure sensors.'], video: 'amit_pinch_valve_replacement.webm' },
        { code: 'E03', name: 'E03: Outlet Pinch Valve Fault', cause: 'Outlet pinch valve failed to open, causing intermediate tank to remain locked or full.', steps: ['Check air pressure to outlet solenoid pilot valve.', 'Check for hard foreign objects jammed in the discharge sleeve.', 'Ensure outlet pneumatic actuator functions by using S2 manual override.'], video: 'amit_pinch_valve_replacement.webm' },
        { code: 'E04', name: 'E04: Water Pressurizer/Level Fault', cause: 'Pressurizer tank has no water feed, or the level sensor cables are disconnected.', steps: ['Check coach main water tank capacity levels.', 'Inspect water filter basket and clean out sediment.', 'Verify level sensor continuity with digital multimeter.'], video: 'air_ejector_maintenance.webm' },
        { code: 'E05', name: 'E05: PLC Controller Communication Fault', cause: 'System supply voltage fluctuated below 80V DC or wiring harness connector is loose.', steps: ['Measure main terminal block voltage (should be 110V DC +/- 10%).', 'Inspect DB9/DB15 serial communication connectors on PLC edge.', 'Perform master PLC soft-reset using the red reset key.'], video: 'soft_reverse_procedure_guide.webm' }
    ],
    oasis: [
        { code: 'F-01', name: 'F-01: Low Supply Voltage', cause: 'Coach battery terminal voltage dropped below critical operating threshold (90V DC).', steps: ['Verify coach battery charger status in electrical locker.', 'Inspect supply fuse on the Oasis control box backplate.', 'Tighten main 110V DC power coupling pins.'], video: 'oasis_solenoid_calibration.webm' },
        { code: 'F-02', name: 'F-02: Pneumatic Supply Pressure Low', cause: 'Pneumatic feed line dropped below 4.8 bar. Safety pressure switch locked out flush cycle.', steps: ['Check MR pressure gauges in the vestibule / coach end.', 'Confirm brake pipe/MR pipe angle cocks are fully open.', 'Replace feed air filter element if loaded with rust/oil.'], video: 'oasis_solenoid_calibration.webm' },
        { code: 'F-03', name: 'F-03: Auxiliary Water Tank Empty', cause: 'Water level indicator detects dry state in toilet pressurizer reservoir.', steps: ['Check if auxiliary water pump circuit breaker (MCB) is tripped.', 'Verify gravity water feed pipe valve is open.', 'Test level sensor probe for scale build-up coating.'], video: 'oasis_solenoid_calibration.webm' },
        { code: 'F-04', name: 'F-04: Inlet Limit Switch Error', cause: 'Inlet pinch valve magnetic proximity sensors did not register target state within 3.5s.', steps: ['Check alignment of proximity switch with valve piston arm.', 'Verify LED status on sensor barrel when manually toggled.', 'Inspect rubber sleeve for tears restricting piston travel.'], video: 'oasis_solenoid_calibration.webm' },
        { code: 'F-05', name: 'F-05: Outlet Limit Switch Error', cause: 'Outlet pinch valve piston did not retract, indicating a mechanical obstruction or return spring failure.', steps: ['Safely isolate air supply and inspect discharge sleeve chamber.', 'Check coil status of discharge solenoid valve.', 'Manually actuate valve using local manual bleed screw.'], video: 'oasis_solenoid_calibration.webm' }
    ]
};

// 3. Videos Playlist Data
const videosPlaylist = {
    amit: [
        { id: 'v1', name: 'amit_pinch_valve_replacement.webm', title: 'Replacing Amit Inlet/Outlet Pinch Valve', desc: 'Step-by-step disassembly of Amit pinch valves and changing the rubber sleeve.', duration: '3:45' },
        { id: 'v2', name: 'soft_reverse_procedure_guide.webm', title: 'Amit Soft-Reverse Clog Purging', desc: 'Demonstration of the S1+S2+S3 three-second key hold procedure to clear blocks.', duration: '2:15' },
        { id: 'v3', name: 'air_ejector_maintenance.webm', title: 'Amit Venturi Ejector Nozzle Cleaning', desc: 'How to dismantle the ejector block and clean the air jet nozzle assembly.', duration: '4:10' }
    ],
    oasis: [
        { id: 'v4', name: 'oasis_solenoid_calibration.webm', title: 'Oasis Solenoid Valve Coil Alignment', desc: 'Calibrating pneumatic valves and replacing burnt coils on Oasis systems.', duration: '3:20' },
        { id: 'v5', name: 'air_ejector_maintenance.webm', title: 'Oasis Ejector & Air Regulator Tuning', desc: 'Setting the air regulator pressure dial and testing vacuum generation efficiency.', duration: '2:55' },
        { id: 'v6', name: 'soft_reverse_procedure_guide.webm', title: 'Oasis Diagnostic Purge Sequence', desc: 'How to trigger the en-route diagnostic purge cycle on Oasis controllers.', duration: '1:50' }
    ]
};

// --- APP STATE ---
let currentMake = 'amit';
let activeTab = 'tab-schematic';
let activeComponentId = null;
let animationFrameId = null;
let canvasPlaying = false;
let canvasAnimTime = 0;

// Keys holding tracking for Soft-Reverse
let keysHolding = {
    S1: false,
    S2: false,
    S3: false
};
let holdInterval = null;
let holdPercent = 0;

// --- DOM ELEMENTS ---
const body = document.body;
const systemStatusIndicator = document.getElementById('system-status-indicator');
const dialMrPressure = document.getElementById('dial-mr-pressure');
const dialVoltage = document.getElementById('dial-voltage');
const dialVacuum = document.getElementById('dial-vacuum');

// Nav Tabs
const navItems = document.querySelectorAll('.nav-item');
const tabPanes = document.querySelectorAll('.tab-pane');

// Manufacturer Toggles
const toggleAmit = document.getElementById('make-amit');
const toggleOasis = document.getElementById('make-oasis');

// Schematic View
const svgNodes = document.querySelectorAll('.schematic-node');
const compDetailsCard = document.getElementById('component-details-card');
const compIcon = document.getElementById('comp-icon');
const compTitle = document.getElementById('comp-title');
const compStatus = document.getElementById('comp-status');
const compDesc = document.getElementById('comp-desc');
const compSpecList = document.getElementById('comp-spec-list');
const specPressure = document.getElementById('spec-pressure');
const specVoltage = document.getElementById('spec-voltage');
const specFault = document.getElementById('spec-fault');
const compActions = document.getElementById('comp-actions');
const btnCompVideo = document.getElementById('btn-comp-video');

const btnSimulateFlush = document.getElementById('btn-simulate-flush');
const wasteFlowLine = document.getElementById('waste-flow-line');
const airFlowLine = document.getElementById('air-flow-line');

// PLC Diagnostics
const plcMakerName = document.getElementById('plc-maker-name');
const plcDisplayLine1 = document.getElementById('plc-display-line1');
const plcDisplayLine2 = document.getElementById('plc-display-line2');
const plcDisplayLine3 = document.getElementById('plc-display-line3');

const ledPower = document.getElementById('led-power');
const ledAir = document.getElementById('led-air');
const ledVacuum = document.getElementById('led-vacuum');
const ledFault = document.getElementById('led-fault');

const plcBtnReset = document.getElementById('plc-btn-reset');
const faultSelect = document.getElementById('fault-select');
const faultSelectGroup = document.getElementById('fault-select-group');
const diagnosticOutputBox = document.getElementById('diagnostic-output-box');
const faultCause = document.getElementById('fault-cause');
const faultSteps = document.getElementById('fault-steps');
const faultVideoRecommendation = document.getElementById('fault-video-recommendation');
const btnFaultPlayVideo = document.getElementById('btn-fault-play-video');

// Soft-Reverse
const btnS1 = document.getElementById('btn-s1');
const btnS2 = document.getElementById('btn-s2');
const btnS3 = document.getElementById('btn-s3');
const holdProgressContainer = document.getElementById('hold-progress-container');
const holdProgressBar = document.getElementById('hold-progress-bar');
const progressPercent = document.getElementById('progress-percent');
const consoleAlertsBox = document.getElementById('console-alerts-box');
const consoleLogsList = document.getElementById('console-logs-list');

const simValveInlet = document.getElementById('sim-valve-inlet');
const simValveOutlet = document.getElementById('sim-valve-outlet');
const statusValInlet = document.getElementById('status-val-inlet');
const statusValOutlet = document.getElementById('status-val-outlet');
const simGaugeNeedle = document.getElementById('sim-gauge-needle');
const simGaugeValue = document.getElementById('sim-gauge-value');

// Videos & Downloads
const videoCardGrid = document.getElementById('video-card-grid');
const canvas = document.getElementById('troubleshoot-canvas');
const ctx = canvas.getContext('2d');
const playOverlay = document.getElementById('player-play-overlay');
const nowPlayingTitle = document.getElementById('now-playing-title');
const btnPlayerPlay = document.getElementById('btn-player-play');
const btnPlayerPause = document.getElementById('btn-player-pause');
const btnPlayerRestart = document.getElementById('btn-player-restart');
const btnPlayerDownload = document.getElementById('btn-player-download');

// Modal Video
const modalOverlay = document.getElementById('modal-video-overlay');
const modalVideoTitle = document.getElementById('modal-video-title');
const modalVideoDesc = document.getElementById('modal-video-desc');
const modalVideoElement = document.getElementById('modal-video-element');
const btnModalDownload = document.getElementById('btn-modal-download');
const btnModalClose = document.getElementById('btn-modal-close');

// Maintenance Logger
const maintenanceForm = document.getElementById('maintenance-log-form');
const logCoach = document.getElementById('log-coach');
const logTrain = document.getElementById('log-train');
const logDepot = document.getElementById('log-depot');
const logMake = document.getElementById('log-make');
const logIssue = document.getElementById('log-issue');
const logStatus = document.getElementById('log-status');
const logsTableBody = document.getElementById('logs-table-body');
const btnExportLogs = document.getElementById('btn-export-logs');
const btnClearLogs = document.getElementById('btn-clear-logs');

// --- APP INITIALIZATION ---
function init() {
    setupTabSwitching();
    setupManufacturerToggles();
    setupSchematicInteractions();
    setupPLCSimulator();
    setupSoftReverseSimulator();
    setupCanvasVideoPlayer();
    setupMaintenanceLogger();
    setupModals();

    // Set Initial States
    loadManufacturerState();
    loadLogsTable();
}

// --- TAB SWAPPING ---
function setupTabSwitching() {
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            item.classList.add('active');
            const targetPane = document.getElementById(item.dataset.tab);
            targetPane.classList.add('active');
            activeTab = item.dataset.tab;

            if (activeTab === 'tab-videos') {
                resetCanvasPlayer();
            }
        });
    });
}

// --- MANUFACTURER STATE MANAGEMENT ---
function setupManufacturerToggles() {
    toggleAmit.addEventListener('change', () => {
        if (toggleAmit.checked) {
            currentMake = 'amit';
            body.className = 'theme-amit';
            loadManufacturerState();
        }
    });

    toggleOasis.addEventListener('change', () => {
        if (toggleOasis.checked) {
            currentMake = 'oasis';
            body.className = 'theme-oasis';
            loadManufacturerState();
        }
    });
}

function loadManufacturerState() {
    // 1. Update PLC Maker Header
    plcMakerName.textContent = currentMake === 'amit' ? 'AMIT ENGINEERS' : 'OASIS FABRICATIONS';

    // 2. Populate PLC Fault Dropdown
    faultSelectGroup.innerHTML = '';
    const codes = faultCodes[currentMake];
    codes.forEach(fc => {
        const option = document.createElement('option');
        option.value = fc.code;
        option.textContent = fc.name;
        faultSelectGroup.appendChild(option);
    });
    faultSelect.value = 'NORMAL';
    triggerFaultSimulation('NORMAL');

    // 3. Load Video Cards Grid
    loadVideosGrid();

    // 4. Update Schematic Overlay Details if active
    if (activeComponentId) {
        highlightSchematicComponent(activeComponentId);
    } else {
        resetComponentDetails();
    }

    // 5. Reset Soft-Reverse console instructions
    resetSoftReverseSimulatorState();

    // 6. Reset visual schematic
    wasteFlowLine.classList.remove('active');
    airFlowLine.classList.remove('active');
}

// --- INTERACTIVE SVG SCHEMATIC ---
function setupSchematicInteractions() {
    svgNodes.forEach(node => {
        node.addEventListener('click', (e) => {
            // Remove active classes
            svgNodes.forEach(n => n.classList.remove('active'));
            
            // Set active class on clicked node
            node.classList.add('active');
            activeComponentId = node.id;
            
            highlightSchematicComponent(activeComponentId);
        });
    });

    btnSimulateFlush.addEventListener('click', runFlushCycleAnimation);
}

function highlightSchematicComponent(compId) {
    const data = componentsData[currentMake][compId];
    if (!data) return;

    // Fill Panel Info
    compIcon.textContent = getComponentEmoji(compId);
    compTitle.textContent = data.title;
    compStatus.textContent = 'STATUS: ONLINE/STANDBY';
    compDesc.textContent = data.desc;

    // Show Specs
    compSpecList.style.display = 'flex';
    specPressure.textContent = data.pressure;
    specVoltage.textContent = data.voltage;
    specFault.textContent = data.fault;

    // Show action button
    compActions.style.display = 'block';

    // Update video button action to play this component's video
    btnCompVideo.onclick = () => {
        // Switch tab to videos
        document.getElementById('btn-tab-videos').click();
        // Start playing the video
        loadVideoToPlayer(data.video, data.title + ' Troubleshooting Demo');
    };
}

function resetComponentDetails() {
    compIcon.textContent = '🚽';
    compTitle.textContent = 'Select a Component';
    compStatus.textContent = 'STATUS: STANDBY';
    compDesc.textContent = 'Click any component on the schematic diagram to show the diagnostic overview, electrical inputs, typical pressure, and maintenance steps.';
    compSpecList.style.display = 'none';
    compActions.style.display = 'none';
    activeComponentId = null;
    svgNodes.forEach(n => n.classList.remove('active'));
}

function getComponentEmoji(compId) {
    switch (compId) {
        case 'node-pan': return '🚽';
        case 'node-inlet-valve': return '🎛️';
        case 'node-vacuum-tank': return '🧪';
        case 'node-ejector': return '💨';
        case 'node-outlet-valve': return '⚙️';
        case 'node-digester': return '🦠';
        default: return '⚙️';
    }
}

function runFlushCycleAnimation() {
    btnSimulateFlush.disabled = true;
    btnSimulateFlush.textContent = '⚡ Flush Sequence Active...';
    
    const steps = [
        document.getElementById('seq-step-1'),
        document.getElementById('seq-step-2'),
        document.getElementById('seq-step-3'),
        document.getElementById('seq-step-4')
    ];

    // Reset sequence highlights
    steps.forEach(s => s.classList.remove('active'));

    // Step 1: Trigger Air ejector and start vacuum line flow
    steps[0].classList.add('active');
    airFlowLine.classList.add('active');
    dialVacuum.textContent = '-0.02 bar';
    dialMrPressure.textContent = '5.0 bar';

    setTimeout(() => {
        // Step 2: Vacuum active
        steps[0].classList.remove('active');
        steps[1].classList.add('active');
        dialVacuum.textContent = '-0.36 bar';
        systemStatusIndicator.textContent = 'VACUUM ON';
        systemStatusIndicator.style.borderColor = 'var(--accent)';
        systemStatusIndicator.style.color = 'var(--accent)';
    }, 1500);

    setTimeout(() => {
        // Step 3: Inlet opens - waste flow starts
        steps[1].classList.remove('active');
        steps[2].classList.add('active');
        wasteFlowLine.classList.add('active');
        dialVacuum.textContent = '-0.15 bar';
        systemStatusIndicator.textContent = 'FLUSHING';
    }, 3000);

    setTimeout(() => {
        // Step 4: Outlet opens - discharge to bio digester
        steps[2].classList.remove('active');
        steps[3].classList.add('active');
        dialVacuum.textContent = '0.00 bar';
        dialMrPressure.textContent = '4.6 bar';
        systemStatusIndicator.textContent = 'DISCHARGING';
    }, 4500);

    setTimeout(() => {
        // Reset everything back to standby
        steps[3].classList.remove('active');
        steps[0].classList.add('active');
        wasteFlowLine.classList.remove('active');
        airFlowLine.classList.remove('active');
        dialMrPressure.textContent = '5.2 bar';
        dialVacuum.textContent = '-0.35 bar';
        
        systemStatusIndicator.textContent = 'ONLINE';
        systemStatusIndicator.style.borderColor = 'var(--success)';
        systemStatusIndicator.style.color = 'var(--success)';

        btnSimulateFlush.disabled = false;
        btnSimulateFlush.textContent = '⚡ Trigger Flush Cycle Animation';
    }, 6000);
}

// --- PLC DIAGNOSTIC PANEL ---
function setupPLCSimulator() {
    faultSelect.addEventListener('change', (e) => {
        triggerFaultSimulation(e.target.value);
    });

    plcBtnReset.addEventListener('click', () => {
        faultSelect.value = 'NORMAL';
        triggerFaultSimulation('NORMAL');
    });

    btnFaultPlayVideo.addEventListener('click', () => {
        const codeValue = faultSelect.value;
        const matchingCode = faultCodes[currentMake].find(c => c.code === codeValue);
        if (matchingCode) {
            document.getElementById('btn-tab-videos').click();
            loadVideoToPlayer(matchingCode.video, matchingCode.name + ' Guide');
        }
    });
}

function triggerFaultSimulation(codeValue) {
    if (codeValue === 'NORMAL') {
        // Reset Controller LEDs
        ledPower.classList.add('active');
        ledAir.classList.add('active');
        ledVacuum.classList.remove('active');
        ledFault.classList.remove('active');

        // Reset Display
        plcDisplayLine1.textContent = 'SYSTEM NORMAL';
        plcDisplayLine2.textContent = 'READY FOR CYCLE';
        plcDisplayLine2.className = 'lcd-text code';
        plcDisplayLine3.textContent = 'MR PRESS: 5.2 BAR';
        plcDisplayLine3.className = 'lcd-text';

        // Hide Troubleshooting Card
        diagnosticOutputBox.style.display = 'none';

        // Reset Header stats
        dialMrPressure.textContent = '5.2 bar';
        dialMrPressure.nextElementSibling.firstElementChild.className = 'dial-bar-fill';
        systemStatusIndicator.textContent = 'ONLINE';
        systemStatusIndicator.className = 'status-indicator online';
    } else {
        const matchingCode = faultCodes[currentMake].find(c => c.code === codeValue);
        if (!matchingCode) return;

        // Toggle Fault LED
        ledFault.classList.add('active');
        
        // Populate display line 1 & 2
        plcDisplayLine1.textContent = `ALERT: FAULT DETECT`;
        plcDisplayLine2.textContent = matchingCode.code;
        plcDisplayLine2.className = 'lcd-text code alert';

        // Custom states based on error code
        if (matchingCode.code === 'E01' || matchingCode.code === 'F-02') {
            // Air / Vacuum issue
            ledAir.classList.remove('active');
            plcDisplayLine3.textContent = 'AIR PRES: 3.2 BAR';
            plcDisplayLine3.className = 'lcd-text alert';
            dialMrPressure.textContent = '3.2 bar';
            dialMrPressure.nextElementSibling.firstElementChild.className = 'dial-bar-fill warning';
        } else if (matchingCode.code === 'E04' || matchingCode.code === 'F-03') {
            // Water level sensor error
            plcDisplayLine3.textContent = 'WATER TANK DRY';
            plcDisplayLine3.className = 'lcd-text alert';
        } else if (matchingCode.code === 'E05' || matchingCode.code === 'F-01') {
            // Voltage/Controller error
            ledPower.classList.remove('active');
            plcDisplayLine3.textContent = 'SYS VOLT: 78V DC';
            plcDisplayLine3.className = 'lcd-text alert';
            dialVoltage.textContent = '78V DC';
            dialVoltage.nextElementSibling.firstElementChild.className = 'dial-bar-fill warning';
        } else {
            // Valve errors
            plcDisplayLine3.textContent = 'VALVE OBSTRUCTED';
            plcDisplayLine3.className = 'lcd-text alert';
        }

        // Fill in diagnostics advice box
        faultCause.textContent = matchingCode.cause;
        
        // Render Steps List
        faultSteps.innerHTML = '';
        matchingCode.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            faultSteps.appendChild(li);
        });

        // Set video recommended link
        faultVideoRecommendation.textContent = matchingCode.video;

        diagnosticOutputBox.style.display = 'block';

        systemStatusIndicator.textContent = 'SYS FAULT';
        systemStatusIndicator.className = 'status-indicator online unfit';
        systemStatusIndicator.style.animation = 'none';
        systemStatusIndicator.style.background = 'var(--error-glow)';
        systemStatusIndicator.style.color = 'var(--error)';
        systemStatusIndicator.style.borderColor = 'var(--error)';
    }
}

// --- CLOG SOFT-REVERSE SIMULATOR ---
function setupSoftReverseSimulator() {
    const handleHoldStart = (btnKey) => {
        keysHolding[btnKey] = true;
        document.getElementById(`btn-${btnKey.toLowerCase()}`).classList.add('holding');
        
        // Start checking for simultaneous holds
        if (keysHolding.S1 && keysHolding.S2 && keysHolding.S3) {
            startHoldProgress();
        }
    };

    const handleHoldEnd = (btnKey) => {
        keysHolding[btnKey] = false;
        document.getElementById(`btn-${btnKey.toLowerCase()}`).classList.remove('holding');
        cancelHoldProgress();
    };

    // Keyboard support: S, D, F representing S1, S2, S3
    window.addEventListener('keydown', (e) => {
        if (activeTab !== 'tab-softreverse') return;
        if (e.key.toLowerCase() === 's') handleHoldStart('S1');
        if (e.key.toLowerCase() === 'd') handleHoldStart('S2');
        if (e.key.toLowerCase() === 'f') handleHoldStart('S3');
    });

    window.addEventListener('keyup', (e) => {
        if (activeTab !== 'tab-softreverse') return;
        if (e.key.toLowerCase() === 's') handleHoldEnd('S1');
        if (e.key.toLowerCase() === 'd') handleHoldEnd('S2');
        if (e.key.toLowerCase() === 'f') handleHoldEnd('S3');
    });

    // Mouse/Touch triggers for each button
    ['S1', 'S2', 'S3'].forEach(k => {
        const btn = document.getElementById(`btn-${k.toLowerCase()}`);
        
        // Mouse Down / Touch Start
        btn.addEventListener('mousedown', () => handleHoldStart(k));
        btn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleHoldStart(k);
        });

        // Mouse Up / Touch End / Mouse Leave
        btn.addEventListener('mouseup', () => handleHoldEnd(k));
        btn.addEventListener('mouseleave', () => handleHoldEnd(k));
        btn.addEventListener('touchend', () => handleHoldEnd(k));
    });
}

function startHoldProgress() {
    if (holdInterval) return;

    holdPercent = 0;
    holdProgressContainer.style.display = 'block';
    
    // Print warning alert log
    addConsoleLog('Purge sequence trigger initiated. Hold keys steady...', 'active');
    consoleAlertsBox.firstElementChild.textContent = 'HOLD STEADY: Initiating Soft-Reverse sequence...';
    consoleAlertsBox.firstElementChild.className = 'alert-message active';

    holdInterval = setInterval(() => {
        holdPercent += 5;
        if (holdPercent > 100) holdPercent = 100;
        
        holdProgressBar.style.width = `${holdPercent}%`;
        progressPercent.textContent = `${holdPercent}%`;

        if (holdPercent >= 100) {
            clearInterval(holdInterval);
            holdInterval = null;
            executeSoftReversePurge();
        }
    }, 150);
}

function cancelHoldProgress() {
    if (holdInterval) {
        clearInterval(holdInterval);
        holdInterval = null;
        holdPercent = 0;
        holdProgressContainer.style.display = 'none';

        addConsoleLog('[ABORT] Key release detected. Purge sequence locked.', 'err');
        resetSoftReverseSimulatorState();
    }
}

function resetSoftReverseSimulatorState() {
    consoleAlertsBox.firstElementChild.textContent = 'STANDBY: Ready to run Soft-Reverse Procedure.';
    consoleAlertsBox.firstElementChild.className = 'alert-message standby';
    holdProgressContainer.style.display = 'none';
    holdProgressBar.style.width = '0%';
    progressPercent.textContent = '0%';

    simValveInlet.className = 'sim-valve';
    statusValInlet.textContent = 'CLOSED';
    statusValInlet.className = 'valve-status status-closed';

    simValveOutlet.className = 'sim-valve';
    statusValOutlet.textContent = 'CLOSED';
    statusValOutlet.className = 'valve-status status-closed';

    simGaugeNeedle.style.transform = 'rotate(0deg)';
    simGaugeValue.textContent = '0.0 bar';
}

function executeSoftReversePurge() {
    addConsoleLog('[PLC-COM] KEY LOCK MATCHED. TRIGGERING EN-ROUTE PURGE MODE.', 'success');
    consoleAlertsBox.firstElementChild.textContent = 'SUCCESS: Soft-Reverse Purge Cycle Complete!';
    consoleAlertsBox.firstElementChild.className = 'alert-message success';
    holdProgressContainer.style.display = 'none';

    // Step 1: Open inlet valve, vacuum suction increase
    setTimeout(() => {
        addConsoleLog('[PNEUMATIC] Activating Inlet Solenoid. Air feeding sleeve...', 'sys');
        simValveInlet.className = 'sim-valve open';
        statusValInlet.textContent = 'OPEN (VACUUM)';
        statusValInlet.className = 'valve-status status-open';
        
        simGaugeNeedle.style.transform = 'rotate(-60deg)'; // Negative vacuum needle tilt
        simGaugeValue.textContent = '-0.38 bar';
    }, 500);

    // Step 2: High pressure discharge
    setTimeout(() => {
        addConsoleLog('[PNEUMATIC] Closing Inlet. Injecting positive blast pressure.', 'active');
        simValveInlet.className = 'sim-valve';
        statusValInlet.textContent = 'CLOSED';
        statusValInlet.className = 'valve-status status-closed';
        
        simValveOutlet.className = 'sim-valve open';
        statusValOutlet.textContent = 'OPEN (EJECT)';
        statusValOutlet.className = 'valve-status status-open';

        simGaugeNeedle.style.transform = 'rotate(150deg)'; // High positive pressure gauge spike
        simGaugeValue.textContent = '3.0 bar';
    }, 2000);

    // Step 3: Complete purge cycle
    setTimeout(() => {
        addConsoleLog('[PNEUMATIC] Purge complete. Flushing spray nozzle.', 'sys');
        simValveOutlet.className = 'sim-valve';
        statusValOutlet.textContent = 'CLOSED';
        statusValOutlet.className = 'valve-status status-closed';
        simGaugeNeedle.style.transform = 'rotate(0deg)';
        simGaugeValue.textContent = '0.0 bar';
        addConsoleLog('[SYSTEM] All valves aligned. Standby mode active.', 'success');
    }, 4500);
}

function addConsoleLog(message, type = 'sys') {
    const li = document.createElement('li');
    li.className = `log-entry ${type}`;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`;
    li.textContent = `[${timeStr}] ${message}`;
    
    consoleLogsList.appendChild(li);
    consoleLogsList.scrollTop = consoleLogsList.scrollHeight;

    // Cap log lines to 20
    while (consoleLogsList.childElementCount > 20) {
        consoleLogsList.removeChild(consoleLogsList.firstChild);
    }
}

// --- VIDEO LIBRARY & CANVAS ENGINE ---
function loadVideosGrid() {
    videoCardGrid.innerHTML = '';
    const playlist = videosPlaylist[currentMake];

    playlist.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card';
        card.innerHTML = `
            <div class="video-thumbnail-placeholder">
                <span class="play-icon-glow">▶</span>
            </div>
            <div class="video-info">
                <h4>${video.title}</h4>
                <p>${video.desc}</p>
                <div class="video-actions">
                    <button class="action-btn-primary" onclick="loadVideoToPlayer('${video.name}', '${video.title}')">📺 Play</button>
                    <a href="downloads/${video.name}" download class="glow-btn small">📥 Download</a>
                </div>
            </div>
        `;
        videoCardGrid.appendChild(card);
    });
}

function loadVideoToPlayer(videoFileName, title) {
    nowPlayingTitle.textContent = title;
    
    // Set matching download link
    btnPlayerDownload.href = `downloads/${videoFileName}`;

    // Show player play overlay
    playOverlay.style.display = 'none';

    // Start canvas animation engine
    activeVideoName = videoFileName;
    startCanvasVideoAnimation(videoFileName);
}

let activeVideoName = '';
function startCanvasVideoAnimation(fileName) {
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    
    canvasPlaying = true;
    canvasAnimTime = 0;
    
    renderCanvasLoop();
}

function renderCanvasLoop() {
    if (!canvasPlaying) return;

    // Clear Canvas
    ctx.fillStyle = '#090d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid effect in player
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for(let i=0; i<canvas.width; i+=20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
    }
    for(let j=0; j<canvas.height; j+=20) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(canvas.width, j);
        ctx.stroke();
    }

    // Video-specific vector drawing logic
    canvasAnimTime += 0.02;

    if (activeVideoName.includes('pinch_valve')) {
        drawPinchValveAnimation();
    } else if (activeVideoName.includes('solenoid')) {
        drawSolenoidAnimation();
    } else if (activeVideoName.includes('soft_reverse')) {
        drawSoftReverseAnimation();
    } else {
        drawDefaultMaintenanceAnimation();
    }

    // Add Overlay Player UI
    ctx.fillStyle = 'rgba(244, 63, 94, 0.8)';
    ctx.beginPath();
    ctx.circle = (15, 15, 5);
    ctx.arc(20, 20, 4, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText('LIVE SCHEMATIC DEMO', 32, 23);

    animationFrameId = requestAnimationFrame(renderCanvasLoop);
}

// Canvas Drawings:
function drawPinchValveAnimation() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Drawing the pipe sleeves
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.moveTo(50, midY);
    ctx.lineTo(midX - 60, midY);
    ctx.moveTo(midX + 60, midY);
    ctx.lineTo(canvas.width - 50, midY);
    ctx.stroke();

    // Valve casing box
    ctx.strokeStyle = 'var(--accent)';
    ctx.lineWidth = 3;
    ctx.strokeRect(midX - 60, midY - 60, 120, 120);

    // Rubber sleeve internal deformation animation
    const compression = Math.abs(Math.sin(canvasAnimTime)); // 0 to 1
    
    ctx.fillStyle = '#a855f7'; // Purple waste flow
    ctx.fillRect(50, midY - 4, midX - 60, 8);
    
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(midX - 60, midY - 12);
    ctx.quadraticCurveTo(midX, midY - 12 + (12 * compression), midX + 60, midY - 12);
    ctx.lineTo(midX + 60, midY + 12);
    ctx.quadraticCurveTo(midX, midY + 12 - (12 * compression), midX - 60, midY + 12);
    ctx.closePath();
    ctx.fill();

    // Valve piston bar
    ctx.fillStyle = '#64748b';
    ctx.fillRect(midX - 10, midY - 80, 20, 50 - (20 * compression));

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(compression > 0.8 ? 'VALVE CLOSED (SEALED)' : 'VALVE OPEN (FLOWING)', midX, midY + 80);
}

function drawSolenoidAnimation() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Coil box
    ctx.strokeStyle = 'var(--accent)';
    ctx.lineWidth = 3;
    ctx.strokeRect(midX - 50, midY - 70, 100, 80);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(midX - 48, midY - 68, 96, 76);

    // Coil wire patterns
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    for (let i = -40; i < 40; i += 6) {
        ctx.beginPath();
        ctx.moveTo(midX + i, midY - 60);
        ctx.lineTo(midX + i, midY - 10);
        ctx.stroke();
    }

    // Piston core moving
    const active = Math.sin(canvasAnimTime * 2) > 0;
    ctx.fillStyle = active ? '#10b981' : '#64748b';
    ctx.fillRect(midX - 15, midY - 30 + (active ? -15 : 0), 30, 60);

    // Multimeter testing visual
    ctx.strokeStyle = '#ef4444'; // Red probe
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 200);
    ctx.lineTo(midX - 30, midY - 40);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(midX - 30, midY - 40, 4, 0, 2*Math.PI);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('TESTING COIL CONTINUITY: ' + (active ? '120 OHMS (PASS)' : '0.00 OHMS (FAIL)'), midX, midY + 80);
}

function drawSoftReverseAnimation() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    // Left Valve Box
    ctx.strokeStyle = '#38bdf8';
    ctx.strokeRect(80, midY - 40, 80, 80);
    ctx.fillStyle = Math.sin(canvasAnimTime * 3) > 0 ? '#10b981' : '#f43f5e';
    ctx.font = '10px sans-serif';
    ctx.fillText('INLET VALVE', 120, midY - 50);
    ctx.fillText(Math.sin(canvasAnimTime * 3) > 0 ? 'OPEN' : 'CLOSED', 120, midY + 10);

    // Right Valve Box
    ctx.strokeStyle = '#a855f7';
    ctx.strokeRect(320, midY - 40, 80, 80);
    ctx.fillStyle = Math.sin(canvasAnimTime * 3) < 0 ? '#10b981' : '#f43f5e';
    ctx.font = '10px sans-serif';
    ctx.fillText('OUTLET VALVE', 360, midY - 50);
    ctx.fillText(Math.sin(canvasAnimTime * 3) < 0 ? 'OPEN' : 'CLOSED', 360, midY + 10);

    // Connecting line arrows
    ctx.strokeStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(160, midY);
    ctx.lineTo(320, midY);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SOFT-REVERSE PRESSURE CYCLING IN PROGRESS', midX, midY + 80);
}

function drawDefaultMaintenanceAnimation() {
    const midX = canvas.width / 2;
    const midY = canvas.height / 2;

    ctx.strokeStyle = 'var(--accent)';
    ctx.strokeRect(100, 60, 280, 120);
    
    // Waveforms / Diagnostic charts
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 110; x < 370; x++) {
        let y = midY + Math.sin(x * 0.05 + canvasAnimTime) * 30;
        if (x === 110) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AIR REGULATOR / EJECTOR VACUUM TESTING CYCLE', midX, midY + 80);
}

function setupCanvasVideoPlayer() {
    // Reset canvas to black frame
    resetCanvasPlayer();

    btnPlayerPlay.addEventListener('click', () => {
        if (activeVideoName) {
            canvasPlaying = true;
            playOverlay.style.display = 'none';
            renderCanvasLoop();
        }
    });

    btnPlayerPause.addEventListener('click', () => {
        canvasPlaying = false;
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    });

    btnPlayerRestart.addEventListener('click', () => {
        if (activeVideoName) {
            canvasAnimTime = 0;
            canvasPlaying = true;
            playOverlay.style.display = 'none';
            renderCanvasLoop();
        }
    });

    playOverlay.addEventListener('click', () => {
        if (activeVideoName) {
            canvasPlaying = true;
            playOverlay.style.display = 'none';
            renderCanvasLoop();
        }
    });
}

function resetCanvasPlayer() {
    canvasPlaying = false;
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
    }
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    playOverlay.style.display = 'flex';
    nowPlayingTitle.textContent = 'No Video Loaded';
    btnPlayerDownload.removeAttribute('href');
}

// --- MAINTENANCE LOGGER ---
function setupMaintenanceLogger() {
    maintenanceForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const logEntry = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            coach: logCoach.value,
            train: logTrain.value,
            depot: logDepot.value,
            make: logMake.value,
            issue: logIssue.value,
            status: logStatus.value
        };

        // Fetch existing
        let logs = JSON.parse(localStorage.getItem('ir_bvht_logs') || '[]');
        logs.unshift(logEntry); // Append to top
        localStorage.setItem('ir_bvht_logs', JSON.stringify(logs));

        // Reset inputs
        logCoach.value = '';
        logTrain.value = '';
        logIssue.value = '';

        loadLogsTable();
    });

    btnClearLogs.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete all saved maintenance logs?')) {
            localStorage.removeItem('ir_bvht_logs');
            loadLogsTable();
        }
    });

    btnExportLogs.addEventListener('click', exportLogsToCSV);
}

function loadLogsTable() {
    logsTableBody.innerHTML = '';
    const logs = JSON.parse(localStorage.getItem('ir_bvht_logs') || '[]');

    if (logs.length === 0) {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-table-cell">No logs entered yet. Check inputs on the left.</td>
            </tr>
        `;
        return;
    }

    logs.forEach(log => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${log.date}</td>
            <td><strong>${escapeHtml(log.coach)}</strong></td>
            <td>${escapeHtml(log.train)}</td>
            <td>${log.make}</td>
            <td>${log.depot}</td>
            <td>${escapeHtml(log.issue)}</td>
            <td><span class="table-status-tag ${getStatusTagClass(log.status)}">${log.status}</span></td>
        `;
        logsTableBody.appendChild(tr);
    });
}

function getStatusTagClass(status) {
    if (status === 'Fit') return 'fit';
    if (status === 'Requires Monitoring') return 'monitoring';
    return 'unfit';
}

function exportLogsToCSV() {
    const logs = JSON.parse(localStorage.getItem('ir_bvht_logs') || '[]');
    if (logs.length === 0) {
        alert('No maintenance logs available to export.');
        return;
    }

    // Header row
    let csvContent = 'Date/Time,Coach Number,Train Name,Manufacturer,Depot,findings / Actions,Clearance Status\n';

    logs.forEach(log => {
        // Escape quotes
        const row = [
            `"${log.date}"`,
            `"${log.coach.replace(/"/g, '""')}"`,
            `"${log.train.replace(/"/g, '""')}"`,
            `"${log.make}"`,
            `"${log.depot}"`,
            `"${log.issue.replace(/"/g, '""')}"`,
            `"${log.status}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    // Create Download Link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ir_bvht_maintenance_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// --- MODAL UTILS (For backup inline player) ---
function setupModals() {
    btnModalClose.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });
}

function showVideoModal(videoFileName, title, descText) {
    modalVideoTitle.textContent = title;
    modalVideoDesc.textContent = descText;
    
    // Set video src paths
    modalVideoElement.src = `downloads/${videoFileName}`;
    btnModalDownload.href = `downloads/${videoFileName}`;

    modalOverlay.classList.add('active');
    modalVideoElement.play().catch(e => console.log("Auto-play disabled", e));
}

function closeModal() {
    modalVideoElement.pause();
    modalVideoElement.removeAttribute('src');
    modalOverlay.classList.remove('active');
}

// Run app
window.addEventListener('DOMContentLoaded', init);
