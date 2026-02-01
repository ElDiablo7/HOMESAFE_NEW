(function () {
    // =====================================
    // GRACE-X BUILDER™ v2.0
    // Comprehensive Construction/Trades Brain
    // =====================================
    
    let bpCanvas;
    let bpCtx;
    let bpUploadBtn;
    let bpFileInput;
    let bpClearBtn;
    let sumCalcBtn;
    let sumOutEl;

    const bpState = {
        loaded: false,
        image: null,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        lastX: 0,
        lastY: 0,
        isPanning: false
    };

    // Measurement state with confidence levels
    const measureState = {
        segments: [],
        lastLengthPx: 0,
        lastLengthM: 0,
        blueprintImage: null,
        blueprintLoaded: false
    };

    // =====================================
    // SCOPE PACK STATE
    // =====================================
    const scopePack = {
        items: [],
        assumptions: [],
        rooms: []
    };

    // =====================================
    // PROBLEM → SOLVED LIBRARY
    // =====================================
    const STORAGE_KEY_PS = 'gracex_builder_problem_solved';
    
    function getProblemSolvedLibrary() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY_PS) || '[]');
        } catch (e) {
            return [];
        }
    }
    
    function saveProblemSolvedLibrary(library) {
        localStorage.setItem(STORAGE_KEY_PS, JSON.stringify(library));
    }

    // =====================================
    // TRADE/TASK CONSTANTS (UK-focused)
    // =====================================
    const TRADE_DATA = {
        plastering: {
            name: 'Plastering / Skim',
            materialsPerM2: { basic: 1.2, standard: 1.5, premium: 2.0 },
            labourHoursPerM2: { basic: 0.3, standard: 0.4, premium: 0.5 },
            costPerM2: { basic: 18, standard: 25, premium: 40 },
            materials: ['Plaster (bags)', 'PVA', 'Beading', 'Scrim tape'],
            compliance: null
        },
        rendering: {
            name: 'Rendering',
            materialsPerM2: { basic: 1.5, standard: 2.0, premium: 3.0 },
            labourHoursPerM2: { basic: 0.5, standard: 0.6, premium: 0.8 },
            costPerM2: { basic: 35, standard: 50, premium: 80 },
            materials: ['Render mix', 'Beading', 'Mesh'],
            compliance: null
        },
        tiling: {
            name: 'Tiling',
            materialsPerM2: { basic: 1.1, standard: 1.15, premium: 1.2 },
            labourHoursPerM2: { basic: 0.8, standard: 1.0, premium: 1.5 },
            costPerM2: { basic: 40, standard: 65, premium: 120 },
            materials: ['Tiles', 'Adhesive', 'Grout', 'Spacers', 'Trim'],
            compliance: null
        },
        drylining: {
            name: 'Drylining / Plasterboard',
            materialsPerM2: { basic: 1.1, standard: 1.15, premium: 1.2 },
            labourHoursPerM2: { basic: 0.25, standard: 0.35, premium: 0.5 },
            costPerM2: { basic: 20, standard: 30, premium: 50 },
            materials: ['Plasterboard', 'Drywall screws', 'Joint tape', 'Filler'],
            compliance: null
        },
        painting: {
            name: 'Painting',
            materialsPerM2: { basic: 0.15, standard: 0.2, premium: 0.25 },
            labourHoursPerM2: { basic: 0.15, standard: 0.2, premium: 0.3 },
            costPerM2: { basic: 8, standard: 12, premium: 20 },
            materials: ['Paint (litres)', 'Primer', 'Filler', 'Sandpaper'],
            compliance: null
        },
        flooring: {
            name: 'Flooring (laminate/vinyl)',
            materialsPerM2: { basic: 1.1, standard: 1.1, premium: 1.15 },
            labourHoursPerM2: { basic: 0.2, standard: 0.25, premium: 0.4 },
            costPerM2: { basic: 25, standard: 45, premium: 80 },
            materials: ['Flooring', 'Underlay', 'Trim/beading', 'Adhesive'],
            compliance: null
        },
        electrical: {
            name: 'Electrical',
            materialsPerM2: { basic: 0.5, standard: 0.8, premium: 1.2 },
            labourHoursPerM2: { basic: 1.0, standard: 1.5, premium: 2.0 },
            costPerM2: { basic: 60, standard: 100, premium: 180 },
            materials: ['Cable', 'Sockets', 'Switches', 'Consumer unit', 'Clips'],
            compliance: '⚠️ PART P: Notifiable work. Must be carried out or certified by a competent person. Building Control notification required for new circuits.'
        },
        plumbing: {
            name: 'Plumbing',
            materialsPerM2: { basic: 0.5, standard: 0.8, premium: 1.2 },
            labourHoursPerM2: { basic: 1.0, standard: 1.5, premium: 2.0 },
            costPerM2: { basic: 50, standard: 80, premium: 140 },
            materials: ['Pipework', 'Fittings', 'Valves', 'Clips'],
            compliance: '⚠️ Water Regulations: Notify water company for certain works. Unvented cylinders require G3 qualification.'
        },
        carpentry: {
            name: 'Carpentry / Joinery',
            labourHoursPerM2: { basic: 0.5, standard: 0.8, premium: 1.2 },
            costPerM2: { basic: 35, standard: 55, premium: 100 },
            materials: ['Timber', 'Screws', 'Nails', 'Wood glue', 'Finish'],
            compliance: null
        },
        insulation: {
            name: 'Insulation',
            materialsPerM2: { basic: 1.05, standard: 1.1, premium: 1.15 },
            labourHoursPerM2: { basic: 0.15, standard: 0.2, premium: 0.3 },
            costPerM2: { basic: 15, standard: 25, premium: 45 },
            materials: ['Insulation boards/rolls', 'Vapour barrier', 'Tape'],
            compliance: '⚠️ Building Regs Part L: Check U-value requirements for your project.'
        }
    };

    // =====================================
    // RAMS/METHOD STATEMENT DATA
    // =====================================
    const HAZARDS_DATA = {
        demolition: {
            hazards: ['Flying debris', 'Dust inhalation', 'Structural collapse', 'Hidden services'],
            controls: ['Wear safety glasses & hard hat', 'Use dust masks (FFP3 for RCS)', 'Prop/shore as needed', 'Scan for cables/pipes'],
            ppe: ['Hard hat', 'Safety glasses', 'FFP3 mask', 'Steel toe boots', 'Gloves']
        },
        'working-height': {
            hazards: ['Falls from height', 'Dropped objects', 'Unstable access equipment'],
            controls: ['Use appropriate access equipment', 'Secure tools', 'Check equipment before use', '3-point contact on ladders'],
            ppe: ['Hard hat', 'Non-slip footwear', 'Harness if >2m']
        },
        electrical: {
            hazards: ['Electric shock', 'Burns', 'Fire', 'Arc flash'],
            controls: ['Isolate supply', 'Lock-off procedure', 'Test dead before work', 'Use insulated tools'],
            ppe: ['Insulated gloves', 'Safety glasses', 'Non-conductive footwear'],
            compliance: '⚠️ Part P compliance required. Only competent persons may carry out work.'
        },
        plumbing: {
            hazards: ['Scalding', 'Flooding', 'Legionella', 'Manual handling'],
            controls: ['Isolate water supply', 'Drain down systems', 'Follow L8 guidance', 'Use correct lifting techniques'],
            ppe: ['Safety glasses', 'Gloves', 'Steel toe boots']
        },
        'hot-works': {
            hazards: ['Fire', 'Burns', 'Fumes', 'Explosion'],
            controls: ['Hot works permit', 'Fire extinguisher present', 'Clear combustibles', 'Fire watch 1hr after'],
            ppe: ['Welding mask/goggles', 'Heat-resistant gloves', 'Fire-resistant clothing']
        },
        dust: {
            hazards: ['Respiratory disease', 'Eye irritation', 'Skin irritation'],
            controls: ['Use extraction', 'Wet cutting where possible', 'Clean as you go', 'Appropriate RPE'],
            ppe: ['FFP3 mask', 'Safety glasses', 'Coveralls']
        },
        silica: {
            hazards: ['Silicosis', 'Lung cancer', 'COPD', 'Kidney disease'],
            controls: ['Water suppression', 'On-tool extraction', 'RPE (FFP3 minimum)', 'Health surveillance'],
            ppe: ['FFP3 mask', 'Safety glasses', 'Coveralls'],
            compliance: '⚠️ COSHH regulations apply. Exposure must be controlled to below WEL.'
        },
        'asbestos-check': {
            hazards: ['Asbestos exposure', 'Mesothelioma', 'Lung cancer'],
            controls: ['STOP if suspected', 'Do not disturb', 'Commission survey', 'Licensed removal only'],
            ppe: ['Do not proceed without survey'],
            compliance: '⚠️ Pre-2000 buildings may contain ACMs. Survey required before work.'
        },
        'manual-handling': {
            hazards: ['Back injury', 'Musculoskeletal disorders', 'Crush injuries'],
            controls: ['Use mechanical aids', 'Team lifts for heavy items', 'Correct lifting technique'],
            ppe: ['Safety boots', 'Gloves']
        },
        'power-tools': {
            hazards: ['Cuts', 'Entanglement', 'Eye injury', 'HAVS'],
            controls: ['Guard in place', 'Correct tool for job', 'Regular breaks', 'Tool inspection'],
            ppe: ['Safety glasses', 'Hearing protection', 'Anti-vibration gloves']
        }
    };

    // =====================================
    // CAPTURE MODE STATE
    // =====================================
    const captureState = {
        active: false,
        frames: [],
        checklistItems: {
            corners: false,
            walls: false,
            openings: false,
            features: false
        }
    };

    const CAPTURE_PROMPTS = [
        "🐢 Slow down for 5 seconds so I can lock the edges.",
        "📐 Hold steady on that corner.",
        "↔️ Please show the full wall corner-to-corner.",
        "🚪 Pan slowly across the door frame.",
        "🪟 Capture the window clearly.",
        "📏 Move closer to read any measurements.",
        "🔄 Turn slowly — I'm still processing.",
        "✅ Good capture. Move to the next wall."
    ];

    // Cache all the DOM elements Builder needs
    function cacheDom() {
        bpCanvas     = document.getElementById("bp-canvas");
        bpUploadBtn  = document.getElementById("bp-upload");
        bpFileInput  = document.getElementById("bp-file");
        bpClearBtn   = document.getElementById("bp-clear");
        sumCalcBtn   = document.getElementById("sum-calc");
        sumOutEl     = document.getElementById("sum-out");
        bpCtx        = bpCanvas ? bpCanvas.getContext("2d") : null;
    }

    // Load a blueprint image into the canvas
    function handleBlueprintFile(file) {
        if (!file || !bpCtx) return;

        const img = new Image();
        img.onload = function () {
            bpState.image   = img;
            bpState.loaded  = true;
            bpState.scale   = 1;
            bpState.offsetX = 0;
            bpState.offsetY = 0;
            drawBlueprint();
        };
        img.src = URL.createObjectURL(file);
    }

    // Draw the current blueprint with pan + zoom
    function drawBlueprint() {
        if (!bpCtx || !bpCanvas) return;

        bpCtx.clearRect(0, 0, bpCanvas.width, bpCanvas.height);

        if (!bpState.loaded || !bpState.image) return;

        bpCtx.save();
        bpCtx.translate(bpState.offsetX, bpState.offsetY);
        bpCtx.scale(bpState.scale, bpState.scale);
        bpCtx.drawImage(bpState.image, 0, 0);
        bpCtx.restore();
    }

    // Wire up all the blueprint / summary controls
    function initBlueprint() {
        if (!bpCanvas || !bpCtx) return;

        // Upload button -> file input
        if (bpUploadBtn && bpFileInput) {
            bpUploadBtn.addEventListener("click", function () {
                bpFileInput.click();
            });

            bpFileInput.addEventListener("change", function () {
                const file = bpFileInput.files && bpFileInput.files[0];
                if (file) {
                    if (window.GRACEX_Utils) {
                        const loader = GRACEX_Utils.showLoading(bpCanvas || document.body, "Loading blueprint...");
                        try {
                handleBlueprintFile(file);
                            setTimeout(() => {
                                GRACEX_Utils.hideLoading(loader);
                                GRACEX_Utils.showToast("Blueprint loaded successfully", "success");
                            }, 500);
                        } catch (err) {
                            GRACEX_Utils.hideLoading(loader);
                            GRACEX_Utils.showToast("Failed to load blueprint", "error");
                            console.error("[GRACEX BUILDER] Blueprint load error:", err);
                        }
                    } else {
                        handleBlueprintFile(file);
                    }
                }
            });
        } else if (bpFileInput) {
            // Fallback: file input used directly
            bpFileInput.addEventListener("change", function () {
                const file = bpFileInput.files && bpFileInput.files[0];
                if (file) {
                    if (window.GRACEX_Utils) {
                        const loader = GRACEX_Utils.showLoading(bpCanvas || document.body, "Loading blueprint...");
                        try {
                handleBlueprintFile(file);
                            setTimeout(() => {
                                GRACEX_Utils.hideLoading(loader);
                                GRACEX_Utils.showToast("Blueprint loaded successfully", "success");
                            }, 500);
                        } catch (err) {
                            GRACEX_Utils.hideLoading(loader);
                            GRACEX_Utils.showToast("Failed to load blueprint", "error");
                            console.error("[GRACEX BUILDER] Blueprint load error:", err);
                        }
                    } else {
                        handleBlueprintFile(file);
                    }
                }
            });
        }

        // Clear blueprint
        if (bpClearBtn) {
            bpClearBtn.addEventListener("click", function () {
                bpState.loaded  = false;
                bpState.image   = null;
                bpState.scale   = 1;
                bpState.offsetX = 0;
                bpState.offsetY = 0;
                drawBlueprint();
            });
        }

        // Pan with mouse drag
        bpCanvas.addEventListener("mousedown", function (ev) {
            if (!bpState.loaded) return;
            bpState.isPanning = true;
            bpState.lastX = ev.clientX;
            bpState.lastY = ev.clientY;
        });

        window.addEventListener("mousemove", function (ev) {
            if (!bpState.isPanning) return;
            const dx = ev.clientX - bpState.lastX;
            const dy = ev.clientY - bpState.lastY;
            bpState.lastX = ev.clientX;
            bpState.lastY = ev.clientY;
            bpState.offsetX += dx;
            bpState.offsetY += dy;
            drawBlueprint();
        });

        window.addEventListener("mouseup", function () {
            bpState.isPanning = false;
        });

        bpCanvas.addEventListener("mouseleave", function () {
            bpState.isPanning = false;
        });

        // Zoom with scroll wheel
        bpCanvas.addEventListener(
            "wheel",
            function (ev) {
                ev.preventDefault();
                if (!bpState.loaded) return;

                const rect = bpCanvas.getBoundingClientRect();
                const cx = ev.clientX - rect.left;
                const cy = ev.clientY - rect.top;

                const delta = -ev.deltaY * 0.001;
                const newScale = Math.min(
                    5,
                    Math.max(0.1, bpState.scale + delta)
                );

                const scaleFactor = newScale / bpState.scale;
                bpState.offsetX = cx - (cx - bpState.offsetX) * scaleFactor;
                bpState.offsetY = cy - (cy - bpState.offsetY) * scaleFactor;
                bpState.scale = newScale;

                drawBlueprint();
            },
            { passive: false }
        );

        // Simple site summary – just reports basic state for now
        
        if (sumCalcBtn && sumOutEl) {
            sumCalcBtn.addEventListener("click", function () {
                const lines = [];
                lines.push("=== GRACE-X Builder Summary ===");
                lines.push("");

                // Blueprint / scale
                lines.push(
                    "Blueprint: " + (bpState.loaded ? "loaded" : "not loaded")
                );
                lines.push("Scale: x" + bpState.scale.toFixed(2));

                // AR snapshot (metadata from the card above)
                const roomNameEl   = document.getElementById("ar-room-name");
                const roomNotesEl  = document.getElementById("ar-room-notes");
                const heightEl     = document.getElementById("ar-height");
                const priorityEl   = document.getElementById("ar-priority");

                const roomName = roomNameEl ? roomNameEl.value.trim() : "";
                const notes    = roomNotesEl ? roomNotesEl.value.trim() : "";
                const height   = heightEl && heightEl.value ? parseFloat(heightEl.value) : NaN;
                const priority = priorityEl ? priorityEl.value.trim() : "";

                if (roomName || notes || priority || !isNaN(height)) {
                    lines.push("");
                    lines.push("Room snapshot:");
                    if (roomName) lines.push("  Name: " + roomName);
                    if (notes)    lines.push("  Use / notes: " + notes);
                    if (!isNaN(height)) lines.push("  Ceiling height: " + height.toFixed(2) + " m");
                    if (priority) lines.push("  Priority: " + priority);
                }

                // Measurements – simple summary from the Quick Measurements card
                if (measureState && Array.isArray(measureState.segments)) {
                    lines.push("");
                    if (measureState.segments.length === 0) {
                        lines.push("Measurements: none captured yet.");
                    } else {
                        lines.push("Measurements: " + measureState.segments.length + " line(s).");
                        lines.push(
                            "Last length: " +
                            measureState.lastLengthPx.toFixed(1) +
                            " px (" +
                            measureState.lastLengthM.toFixed(3) +
                            " m)"
                        );
                    }
                }

                sumOutEl.textContent = lines.join("\n");
            });
        }

// Initial clear
        drawBlueprint();
    }

    // =====================================
    // TINY-BRAIN WIRING (BUILDER ASSISTANT)
    // =====================================
    function wireBuilderBrain() {
        // Use the centralized brainV5Helper if available
        if (window.setupModuleBrain) {
            window.setupModuleBrain("builder", {
                panelId: "builder-brain-panel",
                inputId: "builder-brain-input",
                sendId: "builder-brain-send",
                outputId: "builder-brain-output",
                clearId: "builder-brain-clear",
                initialMessage: "I'm the Builder brain. Tell me the job and the room in one short sentence.",
            });
        }
    }

    // =====================================
    // INIT
    // =====================================
    function initBuilder() {
        try {
        cacheDom();
        if (bpCanvas && bpCtx) {
            initBlueprint();
        }
        initQuickMeasurements();
            initMeasurementCalculator();
        initARCard();
            
            // Add keyboard shortcuts
            if (window.GRACEX_Utils) {
                // Enter key support for inputs (if needed)
                const inputs = document.querySelectorAll('#builder input[type="text"], #builder input[type="number"]');
                inputs.forEach(input => {
                    if (input.id && !input.id.includes('brain')) {
                        GRACEX_Utils.addKeyboardShortcut('Enter', () => {
                            // Trigger calculation if it's a calculator input
                            const calcBtn = input.closest('.card')?.querySelector('[id*="calc"], [id*="calculate"]');
                            if (calcBtn) calcBtn.click();
                        }, input);
                    }
                });
            }
        } catch (err) {
            console.error("[GRACEX BUILDER] Init error:", err);
            if (window.GRACEX_Utils) {
                GRACEX_Utils.showToast("Failed to initialize Builder module", "error");
            }
        }
    }

    // =====================================
    // QUICK MEASUREMENTS (simple line tool)
    // =====================================
    function initQuickMeasurements() {
        const canvas = document.getElementById("measure-canvas");
        const readout = document.getElementById("measure-readout");
        const uploadBtn = document.getElementById("measure-upload");
        const fileInput = document.getElementById("measure-file");
        const startBtn = document.getElementById("measure-start");
        const undoBtn = document.getElementById("measure-undo");
        const clearBtn = document.getElementById("measure-clear");
        const exportBtn = document.getElementById("measure-export");
        const scaleInput = document.getElementById("scale-input");

        if (!canvas || !readout || !startBtn || !scaleInput) {
            return;
        }

        const ctx = canvas.getContext("2d");
        let measuring = false;
        let activeSegment = null;

        function getScale() {
            const raw = parseFloat(scaleInput.value);
            if (!isFinite(raw) || raw <= 0) return 0.01;
            return raw;
        }

        function lengthFor(seg) {
            if (!seg) return { px: 0, m: 0 };
            const dx = seg.x2 - seg.x1;
            const dy = seg.y2 - seg.y1;
            const px = Math.sqrt(dx * dx + dy * dy);
            const scale = getScale();
            return { px, m: px * scale };
        }

        function updateReadout(seg) {
            const { px, m } = lengthFor(seg);
            measureState.lastLengthPx = px;
            measureState.lastLengthM = m;
            readout.textContent =
                "Length: " + px.toFixed(1) + " px (" + m.toFixed(3) + " m)";
        }

        function redraw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw blueprint image if loaded
            if (measureState.blueprintLoaded && measureState.blueprintImage) {
                ctx.drawImage(measureState.blueprintImage, 0, 0, canvas.width, canvas.height);
            }

            // Draw stored segments
            ctx.save();
            ctx.lineWidth = 2;
            ctx.strokeStyle = "#4ade80";
            ctx.fillStyle = "#4ade80";

            measureState.segments.forEach(function (seg) {
                ctx.beginPath();
                ctx.moveTo(seg.x1, seg.y1);
                ctx.lineTo(seg.x2, seg.y2);
                ctx.stroke();

                const midX = (seg.x1 + seg.x2) / 2;
                const midY = (seg.y1 + seg.y2) / 2;
                const { m } = lengthFor(seg);
                ctx.font = "12px ui-monospace, monospace";
                ctx.fillText(m.toFixed(2) + " m", midX + 4, midY - 4);
            });

            // Active segment preview
            if (activeSegment) {
                ctx.strokeStyle = "#facc15";
                ctx.beginPath();
                ctx.moveTo(activeSegment.x1, activeSegment.y1);
                ctx.lineTo(activeSegment.x2, activeSegment.y2);
                ctx.stroke();
            }

            ctx.restore();
        }

        canvas.addEventListener("click", function (ev) {
            if (!measuring) return;
            const rect = canvas.getBoundingClientRect();
            const x = ev.clientX - rect.left;
            const y = ev.clientY - rect.top;

            if (!activeSegment) {
                activeSegment = { x1: x, y1: y, x2: x, y2: y };
            } else {
                activeSegment.x2 = x;
                activeSegment.y2 = y;
                measureState.segments.push(activeSegment);
                updateReadout(activeSegment);
                activeSegment = null;
                // Update calculator when new measurement is added
                if (window.updateMeasurementCalculator) {
                    window.updateMeasurementCalculator();
                }
            }
            redraw();
        });

        canvas.addEventListener("mousemove", function (ev) {
            if (!measuring || !activeSegment) return;
            const rect = canvas.getBoundingClientRect();
            activeSegment.x2 = ev.clientX - rect.left;
            activeSegment.y2 = ev.clientY - rect.top;
            redraw();
        });

        // Upload blueprint button
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener("click", function () {
                fileInput.click();
            });

            fileInput.addEventListener("change", function () {
                const file = fileInput.files && fileInput.files[0];
                if (!file) return;

                const img = new Image();
                img.onload = function () {
                    measureState.blueprintImage = img;
                    measureState.blueprintLoaded = true;
                    redraw();
                };
                img.onerror = function () {
                    if (window.GRACEX_Utils) {
                        GRACEX_Utils.showToast("Failed to load blueprint image. Please try a different file.", "error");
                    } else {
                        alert("Failed to load blueprint image. Please try a different file.");
                    }
                };
                img.src = URL.createObjectURL(file);
            });
        }

        startBtn.addEventListener("click", function () {
            measuring = !measuring;
            activeSegment = null;
            startBtn.textContent = measuring ? "Stop" : "Start";
        });

        undoBtn && undoBtn.addEventListener("click", function () {
            if (measureState.segments.length > 0) {
                measureState.segments.pop();
                const last = measureState.segments[measureState.segments.length - 1] || null;
                if (last) {
                    updateReadout(last);
                } else {
                    readout.textContent = "Length: 0 px (0.000 m)";
                    measureState.lastLengthPx = 0;
                    measureState.lastLengthM = 0;
                }
                redraw();
                // Update calculator when measurement is removed
                if (window.updateMeasurementCalculator) {
                    window.updateMeasurementCalculator();
                }
            }
        });

        clearBtn && clearBtn.addEventListener("click", function () {
            measureState.segments = [];
            activeSegment = null;
            measureState.lastLengthPx = 0;
            measureState.lastLengthM = 0;
            // Note: Clear button clears measurements but keeps blueprint
            // To clear blueprint, use the upload button again or refresh
            readout.textContent = "Length: 0 px (0.000 m)";
            redraw();
            // Update calculator when measurements are cleared
            if (window.updateMeasurementCalculator) {
                window.updateMeasurementCalculator();
            }
        });

        exportBtn && exportBtn.addEventListener("click", function () {
            if (!measureState.segments.length) {
                if (window.GRACEX_Utils) {
                    GRACEX_Utils.showToast("No measurements to export yet.", "error");
                } else {
                alert("No measurements to export yet.");
                }
                return;
            }
            try {
            const scale = getScale();
                const data = measureState.segments.map(function (seg, idx) {
                    const { px, m } = lengthFor(seg);
                    return {
                        "Measurement #": idx + 1,
                        "Pixels": px.toFixed(1),
                        "Meters": m.toFixed(3)
                    };
                });
                
                if (window.GRACEX_Utils) {
                    GRACEX_Utils.exportToCSV(data, "builder-measurements.csv");
                    GRACEX_Utils.showToast("Measurements exported successfully!", "success");
                } else {
                    // Fallback to text export
            const lines = ["GRACE-X Builder – Quick Measurements:"];
            measureState.segments.forEach(function (seg, idx) {
                const { px, m } = lengthFor(seg);
                lines.push(
                    "  #" + (idx + 1) + ": " + px.toFixed(1) + " px (" + m.toFixed(3) + " m)"
                );
            });
            lines.push("");
            lines.push("Scale used: " + scale + " m/px");
            alert(lines.join("\n"));
                }
            } catch (err) {
                console.error("[GRACEX BUILDER] Export error:", err);
                if (window.GRACEX_Utils) {
                    GRACEX_Utils.showToast("Failed to export measurements", "error");
                } else {
                    alert("Failed to export measurements");
                }
            }
        });

        // Expose redraw globally for measurement calculator
        window.redrawMeasurementCanvas = redraw;

        // Initialize measurement calculator
        initMeasurementCalculator();
    }

    // =====================================
    // MEASUREMENT CALCULATOR
    // =====================================
    function initMeasurementCalculator() {
        const calcUpdateBtn = document.getElementById("measure-calc-update");
        const calcClearBtn = document.getElementById("measure-calc-clear");
        const calcAreaEnabled = document.getElementById("calc-area-enabled");
        const calcAreaLength = document.getElementById("calc-area-length");
        const calcAreaWidth = document.getElementById("calc-area-width");
        const calcMaterialType = document.getElementById("calc-material-type");
        const calcMaterialCost = document.getElementById("calc-material-cost");
        const calcMaterialWaste = document.getElementById("calc-material-waste");
        const calcConvertUnit = document.getElementById("calc-convert-unit");

        if (!calcUpdateBtn) return;

        function getAllMeasurements() {
            const scale = parseFloat(document.getElementById("scale-input")?.value || 0.01);
            return measureState.segments.map(function (seg) {
                const dx = seg.x2 - seg.x1;
                const dy = seg.y2 - seg.y1;
                const px = Math.sqrt(dx * dx + dy * dy);
                return { px, m: px * scale };
            });
        }

        function calculateStats() {
            const measurements = getAllMeasurements();
            const count = measurements.length;
            const totalM = measurements.reduce((sum, m) => sum + m.m, 0);
            const avgM = count > 0 ? totalM / count : 0;
            const lengths = measurements.map(m => m.m);
            const maxM = lengths.length > 0 ? Math.max(...lengths) : 0;
            const minM = lengths.length > 0 ? Math.min(...lengths) : 0;

            document.getElementById("calc-count").textContent = count;
            document.getElementById("calc-total-length").textContent = totalM.toFixed(3) + " m";
            document.getElementById("calc-avg-length").textContent = avgM.toFixed(3) + " m";
            document.getElementById("calc-max-length").textContent = maxM.toFixed(3) + " m";
            document.getElementById("calc-min-length").textContent = minM.toFixed(3) + " m";
        }

        function calculateArea() {
            const areaCard = document.getElementById("measure-calc-area");
            if (!calcAreaEnabled || !calcAreaEnabled.checked) {
                areaCard.style.display = "none";
                return;
            }

            const length = parseFloat(calcAreaLength?.value || 0);
            const width = parseFloat(calcAreaWidth?.value || 0);

            if (length > 0 && width > 0) {
                const area = length * width;
                const perimeter = 2 * (length + width);
                document.getElementById("calc-area-result").textContent = area.toFixed(2) + " m²";
                document.getElementById("calc-perimeter-result").textContent = perimeter.toFixed(2) + " m";
                areaCard.style.display = "block";
            } else {
                areaCard.style.display = "none";
            }
        }

        function calculateMaterial() {
            const materialCard = document.getElementById("measure-calc-material");
            const materialType = calcMaterialType?.value;
            const costPerM = parseFloat(calcMaterialCost?.value || 0);
            const wastePercent = parseFloat(calcMaterialWaste?.value || 10);

            if (!materialType || !costPerM) {
                materialCard.style.display = "none";
                return;
            }

            const measurements = getAllMeasurements();
            const totalM = measurements.reduce((sum, m) => sum + m.m, 0);
            const withWaste = totalM * (1 + wastePercent / 100);
            const totalCost = withWaste * costPerM;

            document.getElementById("calc-material-length").textContent = totalM.toFixed(3) + " m";
            document.getElementById("calc-material-total").textContent = withWaste.toFixed(3) + " m";
            document.getElementById("calc-material-cost-total").textContent = "£" + totalCost.toFixed(2);
            materialCard.style.display = "block";
        }

        function convertUnits() {
            const measurements = getAllMeasurements();
            const totalM = measurements.reduce((sum, m) => sum + m.m, 0);
            const unit = calcConvertUnit?.value || "m";

            let converted = 0;
            let unitLabel = "";

            switch (unit) {
                case "cm":
                    converted = totalM * 100;
                    unitLabel = " cm";
                    break;
                case "mm":
                    converted = totalM * 1000;
                    unitLabel = " mm";
                    break;
                case "ft":
                    converted = totalM * 3.28084;
                    unitLabel = " ft";
                    break;
                case "in":
                    converted = totalM * 39.3701;
                    unitLabel = " in";
                    break;
                case "yd":
                    converted = totalM * 1.09361;
                    unitLabel = " yd";
                    break;
                default:
                    converted = totalM;
                    unitLabel = " m";
            }

            document.getElementById("calc-convert-result").textContent = converted.toFixed(3) + unitLabel;
        }

        function updateCalculator() {
            calculateStats();
            calculateArea();
            calculateMaterial();
            convertUnits();
        }

        // Enable/disable area inputs
        if (calcAreaEnabled && calcAreaLength && calcAreaWidth) {
            calcAreaEnabled.addEventListener("change", function () {
                calcAreaLength.disabled = !calcAreaEnabled.checked;
                calcAreaWidth.disabled = !calcAreaEnabled.checked;
                calculateArea();
            });
        }

        // Auto-calculate on input changes
        [calcAreaLength, calcAreaWidth, calcMaterialType, calcMaterialCost, calcMaterialWaste, calcConvertUnit].forEach(function (el) {
            if (el) {
                el.addEventListener("change", updateCalculator);
                el.addEventListener("input", updateCalculator);
            }
        });

        // Update button
        calcUpdateBtn.addEventListener("click", updateCalculator);

        // Clear button
        if (calcClearBtn) {
            calcClearBtn.addEventListener("click", function () {
                measureState.segments = [];
                if (calcAreaLength) calcAreaLength.value = "";
                if (calcAreaWidth) calcAreaWidth.value = "";
                if (calcMaterialCost) calcMaterialCost.value = "";
                if (calcMaterialType) calcMaterialType.value = "";
                if (calcAreaEnabled) calcAreaEnabled.checked = false;
                if (calcAreaLength) calcAreaLength.disabled = true;
                if (calcAreaWidth) calcAreaWidth.disabled = true;
                updateCalculator();
                // Also trigger redraw of measurement canvas
                const canvas = document.getElementById("measure-canvas");
                if (canvas) {
                    const ctx = canvas.getContext("2d");
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    if (measureState.blueprintLoaded && measureState.blueprintImage) {
                        ctx.drawImage(measureState.blueprintImage, 0, 0, canvas.width, canvas.height);
                    }
                }
            });
        }

        // Store update function globally so measurement tool can call it
        window.updateMeasurementCalculator = updateCalculator;

        // Initial calculation
        updateCalculator();

        // Initial blank state for quick measurements (if that module is active)
        const qmCanvas = document.getElementById("builder-measure-canvas");
        const qmReadout = document.getElementById("builder-measure-readout");
        if (qmCanvas && qmReadout && typeof window.redrawMeasurementCanvas === 'function') {
            window.redrawMeasurementCanvas();
            qmReadout.textContent = "Length: 0 px (0.000 m)";
        }
    }

    // =====================================
    // AR CARD (metadata-only for now)
    // =====================================
    function initARCard() {
        const calibrateBtn = document.getElementById("ar-calibrate");
        const placeBtn = document.getElementById("ar-place-marker");
        const clearBtn = document.getElementById("ar-clear");
        const roomName = document.getElementById("ar-room-name");
        const roomNotes = document.getElementById("ar-room-notes");
        const heightInput = document.getElementById("ar-height");
        const priorityInput = document.getElementById("ar-priority");
        const hint = document.getElementById("ar-hint");

        if (!calibrateBtn || !placeBtn || !clearBtn) {
            return;
        }

        function setHint(msg) {
            if (hint) {
                hint.textContent = msg;
            }
        }

        calibrateBtn.addEventListener("click", function () {
            setHint("Calibration noted. Glasses / AR hooks will plug in here later.");
        });

        placeBtn.addEventListener("click", function () {
            setHint("Marker placed in this room snapshot – measurements stay in the cards below.");
        });

        clearBtn.addEventListener("click", function () {
            if (roomName) roomName.value = "";
            if (roomNotes) roomNotes.value = "";
            if (heightInput) heightInput.value = "";
            if (priorityInput) priorityInput.value = "";
            setHint("Room snapshot cleared – ready for a new space.");
        });
    }

    // =====================================
    // AREA & VOLUME CALCULATOR
    // =====================================
    function initAreaCalculator() {
        const lengthInput = document.getElementById("area-length");
        const widthInput = document.getElementById("area-width");
        const heightInput = document.getElementById("area-height");
        const wallsInput = document.getElementById("area-walls");
        const calcBtn = document.getElementById("area-calculate");
        const clearBtn = document.getElementById("area-clear");
        const floorOut = document.getElementById("area-floor");
        const wallsOut = document.getElementById("area-walls-total");
        const volumeOut = document.getElementById("area-volume");

        if (!calcBtn) return;

        calcBtn.addEventListener("click", function() {
            const length = parseFloat(lengthInput?.value || 0);
            const width = parseFloat(widthInput?.value || 0);
            const height = parseFloat(heightInput?.value || 0);
            const walls = parseInt(wallsInput?.value || 4);

            if (length <= 0 || width <= 0) {
                if (floorOut) floorOut.textContent = "Enter length & width";
                if (window.GRACEX_Utils) {
                    GRACEX_Utils.showToast("Please enter valid length and width", "error");
                }
                return;
            }

            const floorArea = length * width;
            const wallArea = height > 0 ? (length + width) * 2 * height : 0;
            const volume = height > 0 ? length * width * height : 0;

            if (floorOut) floorOut.textContent = floorArea.toFixed(2) + " m²";
            if (wallsOut) wallsOut.textContent = wallArea.toFixed(2) + " m²";
            if (volumeOut) volumeOut.textContent = volume > 0 ? volume.toFixed(2) + " m³" : "—";
        });

        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                if (lengthInput) lengthInput.value = "";
                if (widthInput) widthInput.value = "";
                if (heightInput) heightInput.value = "";
                if (wallsInput) wallsInput.value = "4";
                if (floorOut) floorOut.textContent = "—";
                if (wallsOut) wallsOut.textContent = "—";
                if (volumeOut) volumeOut.textContent = "—";
            });
        }
    }

    // =====================================
    // MATERIAL CALCULATOR
    // =====================================
    function initMaterialCalculator() {
        const typeSelect = document.getElementById("material-type");
        const areaInput = document.getElementById("material-area");
        const coverageInput = document.getElementById("material-coverage");
        const wasteInput = document.getElementById("material-waste");
        const calcBtn = document.getElementById("material-calculate");
        const clearBtn = document.getElementById("material-clear");
        const totalAreaOut = document.getElementById("material-total-area");
        const unitsOut = document.getElementById("material-units");
        const purchaseOut = document.getElementById("material-purchase");

        // Default coverage rates (m² per unit)
        const coverageRates = {
            paint: 10,        // 10m² per litre
            plaster: 1,       // 1m² per bag (rough)
            tiles: 0.1,       // 0.1m² per tile (100mm x 100mm example)
            flooring: 2.5,    // 2.5m² per pack
            insulation: 1,    // 1m² per board
            plasterboard: 3   // 3m² per board
        };

        if (typeSelect && coverageInput) {
            typeSelect.addEventListener("change", function() {
                const type = typeSelect.value;
                if (coverageRates[type]) {
                    coverageInput.value = coverageRates[type];
                }
            });
        }

        if (calcBtn) {
            calcBtn.addEventListener("click", function() {
                const area = parseFloat(areaInput?.value || 0);
                const coverage = parseFloat(coverageInput?.value || 1);
                const waste = parseFloat(wasteInput?.value || 10) / 100;

                if (area <= 0 || coverage <= 0) {
                    if (totalAreaOut) totalAreaOut.textContent = "Enter area & coverage";
                    return;
                }

                const totalArea = area * (1 + waste);
                const units = Math.ceil(totalArea / coverage);
                const recommended = Math.ceil(units * 1.1); // Add 10% buffer

                if (totalAreaOut) totalAreaOut.textContent = totalArea.toFixed(2) + " m²";
                if (unitsOut) unitsOut.textContent = units + " units";
                if (purchaseOut) purchaseOut.textContent = recommended + " units (recommended)";
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                if (areaInput) areaInput.value = "";
                if (coverageInput) coverageInput.value = "";
                if (wasteInput) wasteInput.value = "10";
                if (totalAreaOut) totalAreaOut.textContent = "—";
                if (unitsOut) unitsOut.textContent = "—";
                if (purchaseOut) purchaseOut.textContent = "—";
            });
        }
    }

    // =====================================
    // COST ESTIMATOR
    // =====================================
    function initCostEstimator() {
        const materialUnitInput = document.getElementById("cost-material-unit");
        const unitsInput = document.getElementById("cost-units");
        const laborRateInput = document.getElementById("cost-labor-rate");
        const hoursInput = document.getElementById("cost-hours");
        const calcBtn = document.getElementById("cost-calculate");
        const clearBtn = document.getElementById("cost-clear");
        const materialsOut = document.getElementById("cost-materials");
        const laborOut = document.getElementById("cost-labor");
        const totalOut = document.getElementById("cost-total");

        if (calcBtn) {
            calcBtn.addEventListener("click", function() {
                const materialUnit = parseFloat(materialUnitInput?.value || 0);
                const units = parseFloat(unitsInput?.value || 0);
                const laborRate = parseFloat(laborRateInput?.value || 0);
                const hours = parseFloat(hoursInput?.value || 0);

                const materialCost = materialUnit * units;
                const laborCost = laborRate * hours;
                const total = materialCost + laborCost;

                if (materialsOut) materialsOut.textContent = "£" + materialCost.toFixed(2);
                if (laborOut) laborOut.textContent = "£" + laborCost.toFixed(2);
                if (totalOut) totalOut.textContent = "£" + total.toFixed(2);
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                if (materialUnitInput) materialUnitInput.value = "";
                if (unitsInput) unitsInput.value = "";
                if (laborRateInput) laborRateInput.value = "";
                if (hoursInput) hoursInput.value = "";
                if (materialsOut) materialsOut.textContent = "£0.00";
                if (laborOut) laborOut.textContent = "£0.00";
                if (totalOut) totalOut.textContent = "£0.00";
            });
        }
    }

    // =====================================
    // JOB PLANNER
    // =====================================
    function initJobPlanner() {
        const jobNameInput = document.getElementById("job-name");
        const startDateInput = document.getElementById("job-start-date");
        const taskInput = document.getElementById("job-task-input");
        const taskDaysInput = document.getElementById("job-task-days");
        const addBtn = document.getElementById("job-task-add");
        const taskList = document.getElementById("job-task-list");
        const generateBtn = document.getElementById("job-generate-plan");
        const clearBtn = document.getElementById("job-clear");
        const output = document.getElementById("job-plan-output");

        const tasks = [];

        if (addBtn && taskList) {
            addBtn.addEventListener("click", function() {
                const task = taskInput?.value.trim();
                const days = parseFloat(taskDaysInput?.value || 0);

                if (!task || days <= 0) return;

                tasks.push({ task, days });
                const li = document.createElement("li");
                li.className = "builder-list-item";
                li.innerHTML = `<span>${task}</span> <strong>${days} day(s)</strong>`;
                taskList.appendChild(li);

                taskInput.value = "";
                taskDaysInput.value = "";
            });
        }

        if (generateBtn && output) {
            generateBtn.addEventListener("click", function() {
                if (tasks.length === 0) {
                    output.textContent = "Add tasks first, then generate timeline.";
                    return;
                }

                const jobName = jobNameInput?.value.trim() || "Unnamed Job";
                const startDate = startDateInput?.value || new Date().toISOString().split('T')[0];
                const start = new Date(startDate);

                const lines = [];
                lines.push(`=== ${jobName} Timeline ===`);
                lines.push(`Start date: ${startDate}`);
                lines.push("");

                let currentDate = new Date(start);
                tasks.forEach((t, idx) => {
                    const endDate = new Date(currentDate);
                    endDate.setDate(endDate.getDate() + Math.ceil(t.days) - 1);
                    
                    lines.push(`${idx + 1}. ${t.task}`);
                    lines.push(`   ${currentDate.toLocaleDateString()} → ${endDate.toLocaleDateString()} (${t.days} day(s))`);
                    lines.push("");

                    currentDate = new Date(endDate);
                    currentDate.setDate(currentDate.getDate() + 1);
                });

                const totalDays = tasks.reduce((sum, t) => sum + t.days, 0);
                const endDate = new Date(start);
                endDate.setDate(endDate.getDate() + Math.ceil(totalDays) - 1);
                lines.push(`Total duration: ${totalDays.toFixed(1)} days`);
                lines.push(`Completion date: ${endDate.toLocaleDateString()}`);

                output.textContent = lines.join("\n");
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                tasks.length = 0;
                if (taskList) taskList.innerHTML = "";
                if (jobNameInput) jobNameInput.value = "";
                if (startDateInput) startDateInput.value = "";
                if (output) output.textContent = "Add tasks above, then generate timeline…";
            });
        }
    }

    // =====================================
    // UNIT CONVERTER
    // =====================================
    function initUnitConverter() {
        const valueInput = document.getElementById("convert-value");
        const fromSelect = document.getElementById("convert-from");
        const toSelect = document.getElementById("convert-to");
        const calcBtn = document.getElementById("convert-calculate");
        const clearBtn = document.getElementById("convert-clear");
        const output = document.getElementById("convert-output");

        const conversions = {
            // Length
            "m-ft": 3.28084,
            "m-in": 39.3701,
            "m-cm": 100,
            "m-mm": 1000,
            "ft-m": 0.3048,
            "ft-in": 12,
            "in-ft": 0.0833333,
            "in-cm": 2.54,
            "cm-m": 0.01,
            "cm-mm": 10,
            "mm-cm": 0.1,
            "mm-m": 0.001,
            // Area
            "m2-ft2": 10.7639,
            "ft2-m2": 0.092903,
            // Volume
            "m3-ft3": 35.3147,
            "ft3-m3": 0.0283168
        };

        if (calcBtn) {
            calcBtn.addEventListener("click", function() {
                const value = parseFloat(valueInput?.value || 0);
                const from = fromSelect?.value || "m";
                const to = toSelect?.value || "m";

                if (value <= 0) {
                    if (output) output.textContent = "Enter a value";
                    return;
                }

                if (from === to) {
                    if (output) output.textContent = value.toFixed(2) + " " + to;
                    return;
                }

                const key = from + "-" + to;
                if (conversions[key]) {
                    const result = value * conversions[key];
                    if (output) output.textContent = result.toFixed(4) + " " + to;
                } else {
                    // Try reverse conversion
                    const reverseKey = to + "-" + from;
                    if (conversions[reverseKey]) {
                        const result = value / conversions[reverseKey];
                        if (output) output.textContent = result.toFixed(4) + " " + to;
                    } else {
                        if (output) output.textContent = "Conversion not available";
                    }
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener("click", function() {
                if (valueInput) valueInput.value = "";
                if (output) output.textContent = "—";
            });
        }
    }

    // =====================================
    // UNDO/REDO SYSTEM
    // =====================================
    const undoStack = [];
    const redoStack = [];
    
    function saveState() {
        undoStack.push(JSON.stringify(measureState.segments));
        if (undoStack.length > 20) undoStack.shift();
        redoStack.length = 0; // Clear redo on new action
    }
    
    function undo() {
        if (undoStack.length === 0) {
            if (window.GRACEX_Utils) GRACEX_Utils.showToast("Nothing to undo", "info");
            return;
        }
        redoStack.push(JSON.stringify(measureState.segments));
        const prev = JSON.parse(undoStack.pop());
        measureState.segments = prev;
        if (window.redrawMeasurementCanvas) window.redrawMeasurementCanvas();
        if (window.updateMeasurementCalculator) window.updateMeasurementCalculator();
        if (window.GRACEX_Utils) GRACEX_Utils.showToast("Undone", "info");
    }
    
    function redo() {
        if (redoStack.length === 0) {
            if (window.GRACEX_Utils) GRACEX_Utils.showToast("Nothing to redo", "info");
            return;
        }
        undoStack.push(JSON.stringify(measureState.segments));
        const next = JSON.parse(redoStack.pop());
        measureState.segments = next;
        if (window.redrawMeasurementCanvas) window.redrawMeasurementCanvas();
        if (window.updateMeasurementCalculator) window.updateMeasurementCalculator();
        if (window.GRACEX_Utils) GRACEX_Utils.showToast("Redone", "info");
    }
    
    // Expose undo/redo globally
    window.builderUndo = undo;
    window.builderRedo = redo;
    window.builderSaveState = saveState;
    
    // =====================================
    // SAVE/LOAD PROJECT
    // =====================================
    function initProjectSaveLoad() {
        if (!window.GRACEX_Utils) return;
        
        // Create save/load buttons
        const container = document.querySelector(".builder-card, .module-section");
        if (!container || document.getElementById("builder-project-btns")) return;
        
        const btnDiv = document.createElement("div");
        btnDiv.id = "builder-project-btns";
        btnDiv.style.cssText = "display:flex;gap:8px;margin:12px 0;flex-wrap:wrap;";
        btnDiv.innerHTML = `
            <button id="builder-save-project" class="builder-btn" style="padding:8px 12px;font-size:12px;">💾 Save Project</button>
            <button id="builder-load-project" class="builder-btn" style="padding:8px 12px;font-size:12px;">📂 Load Project</button>
            <button id="builder-undo" class="builder-btn" style="padding:8px 12px;font-size:12px;">↩️ Undo</button>
            <button id="builder-redo" class="builder-btn" style="padding:8px 12px;font-size:12px;">↪️ Redo</button>
        `;
        container.insertBefore(btnDiv, container.firstChild);
        
        // Save project
        document.getElementById("builder-save-project")?.addEventListener("click", () => {
            const project = {
                segments: measureState.segments,
                scale: document.getElementById("scale-input")?.value || 0.01,
                timestamp: new Date().toISOString(),
                name: prompt("Project name:", "My Project") || "Unnamed"
            };
            
            const projects = GRACEX_Utils.getStorage("builder_projects", []);
            projects.push(project);
            GRACEX_Utils.setStorage("builder_projects", projects);
            GRACEX_Utils.showToast(`Project "${project.name}" saved`, "success");
        });
        
        // Load project
        document.getElementById("builder-load-project")?.addEventListener("click", () => {
            const projects = GRACEX_Utils.getStorage("builder_projects", []);
            if (projects.length === 0) {
                GRACEX_Utils.showToast("No saved projects", "info");
                return;
            }
            
            const names = projects.map((p, i) => `${i + 1}. ${p.name} (${new Date(p.timestamp).toLocaleDateString()})`).join("\n");
            const choice = prompt(`Select project number:\n${names}`, "1");
            const idx = parseInt(choice) - 1;
            
            if (idx >= 0 && idx < projects.length) {
                measureState.segments = projects[idx].segments || [];
                const scaleInput = document.getElementById("scale-input");
                if (scaleInput) scaleInput.value = projects[idx].scale || 0.01;
                if (window.redrawMeasurementCanvas) window.redrawMeasurementCanvas();
                if (window.updateMeasurementCalculator) window.updateMeasurementCalculator();
                GRACEX_Utils.showToast(`Loaded "${projects[idx].name}"`, "success");
            }
        });
        
        // Undo/Redo buttons
        document.getElementById("builder-undo")?.addEventListener("click", undo);
        document.getElementById("builder-redo")?.addEventListener("click", redo);
        
        // Keyboard shortcuts for undo/redo
        GRACEX_Utils.addKeyboardShortcut({ key: "z", ctrl: true }, undo);
        GRACEX_Utils.addKeyboardShortcut({ key: "y", ctrl: true }, redo);
    }
    
    // =====================================
    // ROOM TEMPLATES
    // =====================================
    function initRoomTemplates() {
        if (!window.GRACEX_Utils) return;
        
        const container = document.getElementById("builder-project-btns");
        if (!container || document.getElementById("builder-templates")) return;
        
        const templatesBtn = document.createElement("button");
        templatesBtn.id = "builder-templates";
        templatesBtn.className = "builder-btn";
        templatesBtn.style.cssText = "padding:8px 12px;font-size:12px;";
        templatesBtn.textContent = "📐 Templates";
        templatesBtn.addEventListener("click", () => {
            const templates = {
                "Small Bedroom (3x3m)": { length: 3, width: 3 },
                "Medium Bedroom (4x4m)": { length: 4, width: 4 },
                "Living Room (5x4m)": { length: 5, width: 4 },
                "Kitchen (4x3m)": { length: 4, width: 3 },
                "Bathroom (2.5x2m)": { length: 2.5, width: 2 }
            };
            
            const choice = prompt(Object.keys(templates).map((t, i) => `${i + 1}. ${t}`).join("\n") + "\n\nSelect template:");
            const keys = Object.keys(templates);
            const idx = parseInt(choice) - 1;
            
            if (idx >= 0 && idx < keys.length) {
                const t = templates[keys[idx]];
                const areaLength = document.getElementById("area-length") || document.getElementById("calc-area-length");
                const areaWidth = document.getElementById("area-width") || document.getElementById("calc-area-width");
                if (areaLength) areaLength.value = t.length;
                if (areaWidth) areaWidth.value = t.width;
                GRACEX_Utils.showToast(`Template "${keys[idx]}" applied`, "success");
            }
        });
        container.appendChild(templatesBtn);
    }

    // =====================================
    // TASK PICKER
    // =====================================
    function initTaskPicker() {
        const tradeSelect = document.getElementById('task-trade-type');
        const finishSelect = document.getElementById('task-finish-level');
        const roomInput = document.getElementById('task-room');
        const areaInput = document.getElementById('task-area');
        const calcBtn = document.getElementById('task-calculate');
        const addBtn = document.getElementById('task-add-to-scope');
        const clearBtn = document.getElementById('task-clear');
        const outputDiv = document.getElementById('task-output');
        const materialsOut = document.getElementById('task-materials');
        const labourOut = document.getElementById('task-labour');
        const costOut = document.getElementById('task-cost');
        const complianceOut = document.getElementById('task-compliance');

        if (!calcBtn) return;

        function calculate() {
            const trade = tradeSelect?.value;
            const finish = finishSelect?.value || 'standard';
            const area = parseFloat(areaInput?.value || 0);

            if (!trade || !TRADE_DATA[trade] || area <= 0) {
                if (outputDiv) outputDiv.style.display = 'none';
                return null;
            }

            const data = TRADE_DATA[trade];
            const matFactor = data.materialsPerM2?.[finish] || 1.1;
            const labourHours = (data.labourHoursPerM2?.[finish] || 0.5) * area;
            const costPerM2 = data.costPerM2?.[finish] || 30;
            const lowCost = area * costPerM2 * 0.8;
            const highCost = area * costPerM2 * 1.3;

            if (materialsOut) materialsOut.textContent = data.materials?.join(', ') || '—';
            if (labourOut) labourOut.textContent = labourHours.toFixed(1) + ' hrs';
            if (costOut) costOut.textContent = `£${lowCost.toFixed(0)} - £${highCost.toFixed(0)}`;
            
            if (complianceOut && data.compliance) {
                complianceOut.textContent = data.compliance;
                complianceOut.style.display = 'block';
            } else if (complianceOut) {
                complianceOut.style.display = 'none';
            }

            if (outputDiv) outputDiv.style.display = 'block';

            return {
                trade: data.name,
                tradeKey: trade,
                room: roomInput?.value || 'Unspecified',
                area: area,
                finish: finish,
                labourHours: labourHours,
                materials: data.materials || [],
                costLow: lowCost,
                costHigh: highCost,
                compliance: data.compliance
            };
        }

        calcBtn.addEventListener('click', calculate);

        if (addBtn) {
            addBtn.addEventListener('click', function() {
                const item = calculate();
                if (item) {
                    scopePack.items.push(item);
                    updateScopePack();
                    if (window.GRACEX_Utils) {
                        GRACEX_Utils.showToast(`Added: ${item.trade} (${item.room})`, 'success');
                    }
                    // Clear inputs
                    if (roomInput) roomInput.value = '';
                    if (areaInput) areaInput.value = '';
                }
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (tradeSelect) tradeSelect.value = '';
                if (finishSelect) finishSelect.value = 'standard';
                if (roomInput) roomInput.value = '';
                if (areaInput) areaInput.value = '';
                if (outputDiv) outputDiv.style.display = 'none';
            });
        }
    }

    // =====================================
    // SCOPE PACK
    // =====================================
    function updateScopePack() {
        const itemsList = document.getElementById('scope-items');
        const emptyMsg = document.getElementById('scope-empty');
        const summary = document.getElementById('scope-summary');

        if (!itemsList) return;

        if (scopePack.items.length === 0) {
            itemsList.innerHTML = '<p class="hint" id="scope-empty">No scope items yet. Use Task Picker to add items.</p>';
            if (summary) summary.style.display = 'none';
            return;
        }

        // Build items HTML
        let html = '';
        scopePack.items.forEach((item, idx) => {
            html += `
                <div class="scope-item" data-idx="${idx}">
                    <div class="scope-item-header">
                        <strong>${item.trade}</strong>
                        <span class="scope-item-room">${item.room}</span>
                        <button class="scope-item-remove" data-idx="${idx}">×</button>
                    </div>
                    <div class="scope-item-details">
                        <span>${item.area.toFixed(1)} m²</span>
                        <span>${item.labourHours.toFixed(1)} hrs</span>
                        <span>£${item.costLow.toFixed(0)}-${item.costHigh.toFixed(0)}</span>
                    </div>
                </div>
            `;
        });
        itemsList.innerHTML = html;

        // Wire remove buttons
        itemsList.querySelectorAll('.scope-item-remove').forEach(btn => {
            btn.addEventListener('click', function() {
                const idx = parseInt(this.dataset.idx);
                scopePack.items.splice(idx, 1);
                updateScopePack();
            });
        });

        // Update summary
        if (summary) {
            const totalArea = scopePack.items.reduce((sum, i) => sum + i.area, 0);
            const totalLabour = scopePack.items.reduce((sum, i) => sum + i.labourHours, 0);
            const totalMatLow = scopePack.items.reduce((sum, i) => sum + i.costLow * 0.6, 0);
            const totalLabourCost = totalLabour * 35; // £35/hr default
            const totalLow = scopePack.items.reduce((sum, i) => sum + i.costLow, 0);
            const totalHigh = scopePack.items.reduce((sum, i) => sum + i.costHigh, 0);

            document.getElementById('scope-total-tasks').textContent = scopePack.items.length;
            document.getElementById('scope-total-area').textContent = totalArea.toFixed(1) + ' m²';
            document.getElementById('scope-total-labour').textContent = totalLabour.toFixed(1) + ' hrs';
            document.getElementById('scope-material-cost').textContent = '£' + totalMatLow.toFixed(0);
            document.getElementById('scope-labour-cost').textContent = '£' + totalLabourCost.toFixed(0);
            document.getElementById('scope-total-cost').textContent = `£${totalLow.toFixed(0)} - £${totalHigh.toFixed(0)}`;
            summary.style.display = 'block';
        }
    }

    function initScopePack() {
        const exportBtn = document.getElementById('scope-export');
        const clearBtn = document.getElementById('scope-clear');

        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                if (scopePack.items.length === 0) {
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast('No scope items to export', 'error');
                    return;
                }
                exportScopePack();
            });
        }

        if (clearBtn) {
            clearBtn.addEventListener('click', function() {
                if (confirm('Clear all scope items?')) {
                    scopePack.items = [];
                    updateScopePack();
                }
            });
        }
    }

    function exportScopePack() {
        const lines = [];
        lines.push('═══════════════════════════════════════════════════');
        lines.push('GRACE-X BUILDER™ SCOPE PACK');
        lines.push('Generated: ' + new Date().toLocaleString());
        lines.push('═══════════════════════════════════════════════════');
        lines.push('');
        lines.push('WORK SCOPE');
        lines.push('──────────');
        
        scopePack.items.forEach((item, idx) => {
            lines.push(`${idx + 1}. ${item.trade} - ${item.room}`);
            lines.push(`   Area: ${item.area.toFixed(1)} m²`);
            lines.push(`   Finish: ${item.finish}`);
            lines.push(`   Est. Labour: ${item.labourHours.toFixed(1)} hrs`);
            lines.push(`   Cost Range: £${item.costLow.toFixed(0)} - £${item.costHigh.toFixed(0)}`);
            if (item.compliance) {
                lines.push(`   ${item.compliance}`);
            }
            lines.push('');
        });

        const totalArea = scopePack.items.reduce((sum, i) => sum + i.area, 0);
        const totalLabour = scopePack.items.reduce((sum, i) => sum + i.labourHours, 0);
        const totalLow = scopePack.items.reduce((sum, i) => sum + i.costLow, 0);
        const totalHigh = scopePack.items.reduce((sum, i) => sum + i.costHigh, 0);

        lines.push('SUMMARY');
        lines.push('───────');
        lines.push(`Total Tasks: ${scopePack.items.length}`);
        lines.push(`Total Area: ${totalArea.toFixed(1)} m²`);
        lines.push(`Total Labour: ${totalLabour.toFixed(1)} hrs`);
        lines.push(`Total Cost: £${totalLow.toFixed(0)} - £${totalHigh.toFixed(0)}`);
        lines.push('');
        lines.push('ASSUMPTIONS');
        lines.push('───────────');
        lines.push('• Costs are estimates based on standard UK rates');
        lines.push('• Actual costs may vary based on access, condition, and specification');
        lines.push('• Labour rates calculated at £35/hr');
        lines.push('• All compliance requirements noted must be followed');

        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'GRACEX_Scope_Pack_' + new Date().toISOString().split('T')[0] + '.txt';
        a.click();
        URL.revokeObjectURL(url);

        if (window.GRACEX_Utils) GRACEX_Utils.showToast('Scope pack exported', 'success');
    }

    // =====================================
    // CAMERA CAPTURE MODE
    // =====================================
    function initCaptureMode() {
        const startBtn = document.getElementById('capture-start');
        const photoBtn = document.getElementById('capture-photo');
        const stopBtn = document.getElementById('capture-stop');
        const indicator = document.getElementById('capture-indicator');
        const guidance = document.getElementById('capture-guidance');
        const framesDiv = document.getElementById('capture-frames');
        const checklist = document.getElementById('capture-checklist');

        if (!startBtn) return;

        let promptInterval = null;

        function showPrompt() {
            const prompt = CAPTURE_PROMPTS[Math.floor(Math.random() * CAPTURE_PROMPTS.length)];
            if (guidance) guidance.textContent = prompt;
            // Also speak it
            if (window.GRACEX_TTS && !window.GRACEX_TTS.isSpeaking()) {
                GRACEX_TTS.speak(prompt.replace(/[^\w\s]/g, ''));
            }
        }

        startBtn.addEventListener('click', function() {
            captureState.active = true;
            if (indicator) indicator.textContent = '🔴 Recording';
            if (indicator) indicator.style.color = '#ef4444';
            if (guidance) guidance.textContent = '📷 Walk slowly through the space. I\'ll guide you.';
            if (framesDiv) framesDiv.style.display = 'grid';
            if (checklist) checklist.style.display = 'block';
            if (startBtn) startBtn.disabled = true;
            if (stopBtn) stopBtn.disabled = false;

            // Start prompts every 8 seconds
            promptInterval = setInterval(showPrompt, 8000);
            showPrompt();
        });

        if (photoBtn) {
            photoBtn.addEventListener('click', function() {
                if (!captureState.active) {
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Start capture first', 'info');
                    return;
                }
                // Simulate photo capture
                const frameNum = captureState.frames.length + 1;
                captureState.frames.push({
                    id: frameNum,
                    timestamp: new Date().toISOString(),
                    label: `Frame ${frameNum}`
                });

                // Add to UI
                if (framesDiv) {
                    const frameEl = document.createElement('div');
                    frameEl.className = 'capture-frame';
                    frameEl.innerHTML = `<span>📸 ${frameNum}</span><small>${new Date().toLocaleTimeString()}</small>`;
                    framesDiv.appendChild(frameEl);
                }

                if (guidance) guidance.textContent = '✅ Photo captured. Continue or take another.';
                if (window.GRACEX_Utils) GRACEX_Utils.showToast(`Frame ${frameNum} captured`, 'success');
            });
        }

        if (stopBtn) {
            stopBtn.addEventListener('click', function() {
                captureState.active = false;
                if (indicator) indicator.textContent = '⚪ Ready';
                if (indicator) indicator.style.color = '';
                if (guidance) guidance.textContent = `Capture complete. ${captureState.frames.length} frames captured.`;
                if (startBtn) startBtn.disabled = false;
                if (stopBtn) stopBtn.disabled = true;

                if (promptInterval) {
                    clearInterval(promptInterval);
                    promptInterval = null;
                }
            });
        }
    }

    // =====================================
    // METHOD STATEMENT & RAMS GENERATOR
    // =====================================
    function initRAMSGenerator() {
        const generateRAMSBtn = document.getElementById('rams-generate');
        const generateMethodBtn = document.getElementById('method-generate');
        const exportBtn = document.getElementById('rams-export');
        const output = document.getElementById('rams-output');
        const activitiesSelect = document.getElementById('rams-activities');
        const conditionsSelect = document.getElementById('rams-conditions');

        if (!generateRAMSBtn) return;

        function getSelectedOptions(select) {
            if (!select) return [];
            return Array.from(select.selectedOptions).map(o => o.value);
        }

        function generateRAMS() {
            const jobTitle = document.getElementById('rams-job-title')?.value || 'Untitled Job';
            const client = document.getElementById('rams-client')?.value || '—';
            const address = document.getElementById('rams-address')?.value || '—';
            const startDate = document.getElementById('rams-start-date')?.value || '—';
            const activities = getSelectedOptions(activitiesSelect);
            const conditions = getSelectedOptions(conditionsSelect);

            if (activities.length === 0) {
                if (window.GRACEX_Utils) GRACEX_Utils.showToast('Select at least one work activity', 'error');
                return null;
            }

            const lines = [];
            lines.push('═══════════════════════════════════════════════════════════════');
            lines.push('RISK ASSESSMENT & METHOD STATEMENT (RAMS)');
            lines.push('Generated by GRACE-X Builder™');
            lines.push('═══════════════════════════════════════════════════════════════');
            lines.push('');
            lines.push('PROJECT DETAILS');
            lines.push('───────────────');
            lines.push(`Job Title: ${jobTitle}`);
            lines.push(`Client: ${client}`);
            lines.push(`Site Address: ${address}`);
            lines.push(`Start Date: ${startDate}`);
            lines.push(`Assessment Date: ${new Date().toLocaleDateString()}`);
            lines.push('');

            if (conditions.length > 0) {
                lines.push('SITE CONDITIONS');
                lines.push('───────────────');
                conditions.forEach(c => {
                    const labels = {
                        occupied: '• Property is OCCUPIED during works',
                        children: '• CHILDREN may be present on site',
                        pets: '• PETS on site - secure before works',
                        elderly: '• ELDERLY/VULNERABLE occupants present',
                        'night-work': '• NIGHT WORK - additional considerations apply'
                    };
                    lines.push(labels[c] || `• ${c}`);
                });
                lines.push('');
            }

            lines.push('HAZARD IDENTIFICATION & CONTROL MEASURES');
            lines.push('─────────────────────────────────────────');
            lines.push('');

            const allPPE = new Set();

            activities.forEach(activity => {
                const data = HAZARDS_DATA[activity];
                if (!data) return;

                const labels = {
                    demolition: 'Demolition / Strip-out',
                    'working-height': 'Working at Height',
                    electrical: 'Electrical Work',
                    plumbing: 'Plumbing Work',
                    'hot-works': 'Hot Works',
                    dust: 'Dust Generating Work',
                    silica: 'Silica Dust Risk',
                    'asbestos-check': 'Pre-2000 Building (Asbestos)',
                    'manual-handling': 'Manual Handling',
                    'power-tools': 'Power Tool Use'
                };

                lines.push(`▶ ${labels[activity] || activity.toUpperCase()}`);
                lines.push('');
                lines.push('  Hazards:');
                data.hazards.forEach(h => lines.push(`    • ${h}`));
                lines.push('');
                lines.push('  Control Measures:');
                data.controls.forEach(c => lines.push(`    ✓ ${c}`));
                lines.push('');
                
                if (data.compliance) {
                    lines.push(`  ${data.compliance}`);
                    lines.push('');
                }

                data.ppe?.forEach(p => allPPE.add(p));
            });

            lines.push('PPE REQUIREMENTS');
            lines.push('────────────────');
            Array.from(allPPE).forEach(p => lines.push(`  🦺 ${p}`));
            lines.push('');

            lines.push('EMERGENCY PROCEDURES');
            lines.push('────────────────────');
            lines.push('  • First Aid Kit location: [TO BE CONFIRMED ON SITE]');
            lines.push('  • Fire Extinguisher location: [TO BE CONFIRMED ON SITE]');
            lines.push('  • Emergency Contact: 999');
            lines.push('  • Nearest A&E: [TO BE CONFIRMED]');
            lines.push('');
            lines.push('DECLARATION');
            lines.push('───────────');
            lines.push('I confirm I have read and understood this RAMS and will follow');
            lines.push('all control measures and use the required PPE.');
            lines.push('');
            lines.push('Signature: _______________________  Date: _______________');
            lines.push('');
            lines.push('═══════════════════════════════════════════════════════════════');

            if (output) output.textContent = lines.join('\n');
            return lines.join('\n');
        }

        function generateMethodStatement() {
            const jobTitle = document.getElementById('rams-job-title')?.value || 'Untitled Job';
            const activities = getSelectedOptions(activitiesSelect);

            if (activities.length === 0) {
                if (window.GRACEX_Utils) GRACEX_Utils.showToast('Select at least one work activity', 'error');
                return null;
            }

            const lines = [];
            lines.push('═══════════════════════════════════════════════════════════════');
            lines.push('METHOD STATEMENT');
            lines.push('Generated by GRACE-X Builder™');
            lines.push('═══════════════════════════════════════════════════════════════');
            lines.push('');
            lines.push(`Job: ${jobTitle}`);
            lines.push(`Date: ${new Date().toLocaleDateString()}`);
            lines.push('');
            lines.push('SEQUENCE OF WORKS');
            lines.push('─────────────────');
            lines.push('');

            let step = 1;
            
            // Pre-start
            lines.push(`${step}. PRE-START`);
            lines.push('   • Review RAMS with all operatives');
            lines.push('   • Confirm PPE is available and in good condition');
            lines.push('   • Check access and egress routes');
            lines.push('   • Identify isolation points');
            lines.push('');
            step++;

            // Activity-specific steps
            activities.forEach(activity => {
                const labels = {
                    demolition: 'STRIP-OUT / DEMOLITION',
                    'working-height': 'ACCESS EQUIPMENT SETUP',
                    electrical: 'ELECTRICAL WORKS',
                    plumbing: 'PLUMBING WORKS',
                    'hot-works': 'HOT WORKS',
                    dust: 'DUST CONTROL SETUP',
                    silica: 'SILICA CONTROL MEASURES',
                    'asbestos-check': 'ASBESTOS CHECK',
                    'manual-handling': 'MATERIAL HANDLING',
                    'power-tools': 'POWER TOOL OPERATIONS'
                };

                lines.push(`${step}. ${labels[activity] || activity.toUpperCase()}`);
                
                const data = HAZARDS_DATA[activity];
                if (data) {
                    data.controls.slice(0, 3).forEach(c => {
                        lines.push(`   • ${c}`);
                    });
                }
                lines.push('');
                step++;
            });

            // Completion
            lines.push(`${step}. COMPLETION & HANDOVER`);
            lines.push('   • Remove all waste and debris');
            lines.push('   • Clean work area');
            lines.push('   • Test and commission (where applicable)');
            lines.push('   • Obtain client sign-off');
            lines.push('');

            lines.push('═══════════════════════════════════════════════════════════════');

            if (output) output.textContent = lines.join('\n');
            return lines.join('\n');
        }

        generateRAMSBtn.addEventListener('click', generateRAMS);
        if (generateMethodBtn) generateMethodBtn.addEventListener('click', generateMethodStatement);

        if (exportBtn) {
            exportBtn.addEventListener('click', function() {
                const content = output?.textContent;
                if (!content || content.includes('Select work activities')) {
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Generate RAMS first', 'error');
                    return;
                }
                const blob = new Blob([content], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'GRACEX_RAMS_' + new Date().toISOString().split('T')[0] + '.txt';
                a.click();
                URL.revokeObjectURL(url);
                if (window.GRACEX_Utils) GRACEX_Utils.showToast('RAMS exported', 'success');
            });
        }
    }

    // =====================================
    // PROBLEM → SOLVED LIBRARY
    // =====================================
    function initProblemSolved() {
        const searchInput = document.getElementById('ps-search');
        const searchBtn = document.getElementById('ps-search-btn');
        const addBtn = document.getElementById('ps-add-btn');
        const results = document.getElementById('ps-results');
        const addForm = document.getElementById('ps-add-form');
        const saveBtn = document.getElementById('ps-save');
        const cancelBtn = document.getElementById('ps-cancel');

        if (!searchBtn) return;

        function searchLibrary(query) {
            const library = getProblemSolvedLibrary();
            if (!query || query.trim() === '') {
                return library.slice(0, 10); // Show recent 10
            }
            const q = query.toLowerCase();
            return library.filter(entry => 
                entry.symptoms?.toLowerCase().includes(q) ||
                entry.cause?.toLowerCase().includes(q) ||
                entry.tags?.toLowerCase().includes(q) ||
                entry.context?.toLowerCase().includes(q)
            );
        }

        function renderResults(entries) {
            if (!results) return;
            
            if (entries.length === 0) {
                results.innerHTML = '<p class="hint">No matching entries found. Try a different search or add a new entry.</p>';
                return;
            }

            let html = '';
            entries.forEach((entry, idx) => {
                html += `
                    <div class="ps-entry" data-id="${entry.id}">
                        <div class="ps-entry-header">
                            <strong>PS-${entry.id}</strong>
                            <span class="ps-tags">${entry.tags || ''}</span>
                        </div>
                        <div class="ps-symptoms"><em>Problem:</em> ${entry.symptoms}</div>
                        <div class="ps-cause"><em>Cause:</em> ${entry.cause || '—'}</div>
                        <div class="ps-fix"><em>Fix:</em> ${entry.fix}</div>
                        <div class="ps-meta">
                            <span>Context: ${entry.context || '—'}</span>
                            <span>Added: ${new Date(entry.date).toLocaleDateString()}</span>
                        </div>
                    </div>
                `;
            });
            results.innerHTML = html;
        }

        searchBtn.addEventListener('click', function() {
            const query = searchInput?.value || '';
            const entries = searchLibrary(query);
            renderResults(entries);
        });

        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') searchBtn.click();
            });
        }

        if (addBtn && addForm) {
            addBtn.addEventListener('click', function() {
                addForm.style.display = 'block';
            });
        }

        if (cancelBtn && addForm) {
            cancelBtn.addEventListener('click', function() {
                addForm.style.display = 'none';
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                const symptoms = document.getElementById('ps-symptoms')?.value?.trim();
                const cause = document.getElementById('ps-cause')?.value?.trim();
                const fix = document.getElementById('ps-fix')?.value?.trim();
                const tools = document.getElementById('ps-tools')?.value?.trim();
                const materials = document.getElementById('ps-materials')?.value?.trim();
                const tags = document.getElementById('ps-tags')?.value?.trim();
                const safety = document.getElementById('ps-safety')?.value?.trim();
                const context = document.getElementById('ps-context')?.value?.trim();

                if (!symptoms || !fix) {
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Problem and Fix are required', 'error');
                    return;
                }

                const library = getProblemSolvedLibrary();
                const id = library.length > 0 ? Math.max(...library.map(e => e.id)) + 1 : 1001;

                library.unshift({
                    id: id,
                    symptoms: symptoms,
                    cause: cause,
                    fix: fix,
                    tools: tools,
                    materials: materials,
                    tags: tags,
                    safety: safety,
                    context: context,
                    date: new Date().toISOString()
                });

                saveProblemSolvedLibrary(library);

                // Clear form
                ['ps-symptoms', 'ps-cause', 'ps-fix', 'ps-tools', 'ps-materials', 'ps-tags', 'ps-safety', 'ps-context'].forEach(id => {
                    const el = document.getElementById(id);
                    if (el) el.value = '';
                });

                if (addForm) addForm.style.display = 'none';
                renderResults(library.slice(0, 10));

                if (window.GRACEX_Utils) GRACEX_Utils.showToast(`Entry PS-${id} saved`, 'success');
            });
        }

        // Initial load
        renderResults(getProblemSolvedLibrary().slice(0, 5));
    }

    // =====================================
    // PROJECT MEMORY BANK
    // =====================================
    function initProjectMemory() {
        const saveBtn = document.getElementById('project-save');
        const loadBtn = document.getElementById('project-load');
        const exportBtn = document.getElementById('project-export');
        const listBtn = document.getElementById('project-list');
        const listPanel = document.getElementById('project-list-panel');
        const savedList = document.getElementById('project-saved-list');

        const STORAGE_KEY = 'gracex_builder_projects';

        function getProjects() {
            try {
                return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            } catch (e) {
                return [];
            }
        }

        function saveProjects(projects) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', function() {
                const name = document.getElementById('project-name')?.value?.trim();
                const address = document.getElementById('project-address')?.value?.trim();

                if (!name) {
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast('Enter a project name', 'error');
                    return;
                }

                const projectData = {
                    id: Date.now(),
                    name: name,
                    address: address,
                    scopePack: JSON.parse(JSON.stringify(scopePack)),
                    measurements: JSON.parse(JSON.stringify(measureState.segments)),
                    timestamp: new Date().toISOString()
                };
                const projects = getProjects();
                projects.unshift(projectData);
                saveProjects(projects);
                if (window.GRACEX_Utils) GRACEX_Utils.showToast(`Project "${name}" saved`, 'success');
                var builderApiBase = window.GRACEX_API_BASE || 'http://localhost:3000';
                if (typeof fetch === 'function' && builderApiBase) {
                    var headers = (window.GRACEX_Auth && window.GRACEX_Auth.authHeaders) ? window.GRACEX_Auth.authHeaders() : { 'Content-Type': 'application/json' };
                    fetch(builderApiBase + '/api/builder/projects', {
                        method: 'POST',
                        headers: headers,
                        body: JSON.stringify({ name: name, address: address || '' })
                    }).then(function(r) { return r.json(); }).then(function(data) {
                        if (data.success && data.id) {
                            fetch(builderApiBase + '/api/builder/scope-pack', {
                                method: 'POST',
                                headers: headers,
                                body: JSON.stringify({ projectId: data.id, items: scopePack.items || [], assumptions: [], rooms: [] })
                            }).catch(function() {});
                        }
                    }).catch(function() {});
                }
            });
        }

        if (loadBtn) {
            loadBtn.addEventListener('click', function() {
                const projects = getProjects();
                if (projects.length === 0) {
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast('No saved projects', 'info');
                    return;
                }

                const names = projects.map((p, i) => `${i + 1}. ${p.name}`).join('\n');
                const choice = prompt(`Select project:\n${names}`, '1');
                const idx = parseInt(choice) - 1;

                if (idx >= 0 && idx < projects.length) {
                    const project = projects[idx];
                    scopePack.items = project.scopePack?.items || [];
                    measureState.segments = project.measurements || [];
                    updateScopePack();
                    if (window.redrawMeasurementCanvas) window.redrawMeasurementCanvas();
                    if (window.updateMeasurementCalculator) window.updateMeasurementCalculator();
                    if (window.GRACEX_Utils) GRACEX_Utils.showToast(`Loaded "${project.name}"`, 'success');
                }
            });
        }

        if (listBtn && listPanel && savedList) {
            listBtn.addEventListener('click', function() {
                const projects = getProjects();
                listPanel.style.display = listPanel.style.display === 'none' ? 'block' : 'none';
                
                if (projects.length === 0) {
                    savedList.innerHTML = '<li class="hint">No saved projects</li>';
                    return;
                }

                savedList.innerHTML = projects.map(p => `
                    <li class="builder-list-item">
                        <strong>${p.name}</strong>
                        <span>${p.address || ''}</span>
                        <small>${new Date(p.timestamp).toLocaleDateString()}</small>
                    </li>
                `).join('');
            });
        }
    }

    // =====================================
    // INIT
    // =====================================
    function initBuilder() {
        cacheDom();
        if (bpCanvas && bpCtx) {
            initBlueprint();
        }
        initQuickMeasurements();
        initARCard();
        initAreaCalculator();
        initMaterialCalculator();
        initCostEstimator();
        initJobPlanner();
        initUnitConverter();
        initProjectSaveLoad();
        initRoomTemplates();
        
        // NEW FEATURES
        initTaskPicker();
        initScopePack();
        initCaptureMode();
        initRAMSGenerator();
        initProblemSolved();
        initProjectMemory();
        
        console.log('[GRACEX BUILDER] v2.0 initialized with full feature set');
    }

    // HOOKS: CORE ROUTER + DIRECT OPEN
    // =====================================

    // When Core loads /modules/builder.html into #content
    document.addEventListener("gracex:module:loaded", function (ev) {
        try {
            const detail = ev.detail || {};
            const mod = detail.module || "";
            const url = detail.url || "";

            if (
                mod === "builder" ||
                (url && url.indexOf("builder.html") !== -1)
            ) {
                initBuilder();
                wireBuilderBrain();
            }
        } catch (err) {
            console.warn("Builder init via event failed:", err);
        }
    });

    // When you open /modules/builder.html directly in the browser
    if (
        document.currentScript &&
        document.currentScript.src.indexOf("builder.js") !== -1
    ) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", function () {
                initBuilder();
                wireBuilderBrain();
            });
        } else {
            initBuilder();
            wireBuilderBrain();
        }
    }
})();