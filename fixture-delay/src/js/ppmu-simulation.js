function initPPMUSimulation() {
    const canvas = document.getElementById('ppmu_canvas');
    const ctx = canvas.getContext('2d');
    const fireBtn = document.getElementById('ppmu_btn');
    const statusTitle = document.getElementById('ppmu_title');
    const statusText = document.getElementById('ppmu_desc');
    const liveTimer = document.getElementById('ppmu_timer');

    // All geometry lives here so alignment tweaks stay in one place.
    const LAYOUT = {
        canvas: { w: 800, h: 400 },
        ppmuBox: { x: 40, y: 50, w: 210, h: 300 },
        wire: { startX: 250, endX: 700, y: 200 },
        force: { x: 60, y: 110, w: 120, h: 60 },
        sense: { x: 60, y: 230, w: 120, h: 60 },
        labels: {
            wireAbove: 168,      // reserved band above wire
            wireBelow: 232,      // Merge / junction labels
            bracket: 248,        // round-trip dashed line
            bracketLabel: 262    // round-trip text
        }
    };

    let state = 'IDLE';
    let pulseX = 0;
    let animationFrameId;
    let animStartTime = 0;
    let runStartTime = 0;
    let reflectionFlash = 0;
    let resetTimeout = null;

    const SIM_NS = 3.0;
    const TIME_SCALE = 600;
    const FONT = 'IBM Plex Sans, sans-serif';

    function setupHiDPI() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = LAYOUT.canvas.w * dpr;
        canvas.height = LAYOUT.canvas.h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function updateStatus(title, text, colorClass) {
        statusTitle.innerText = title;
        statusText.innerText = text;
        statusTitle.className = `font-bold mb-1 ${colorClass}`;
    }

    // Localized sine packet traveling along the wire. The x coordinate
    // advances along the line while y oscillates perpendicular to it at
    // uniform amplitude. packetHalf is a whole multiple of half the
    // wavelength so the packet ends exactly at zero crossings.
    function drawTravelingSine(centerX, color, direction) {
        const { startX, endX, y: wireY } = LAYOUT.wire;
        const amplitude = 16;
        const wavelength = 60;
        const packetHalf = 90;   // 3 half-wavelengths per side
        const k = (2 * Math.PI) / wavelength;

        const layers = [
            { alpha: 1, lineWidth: 3, blur: 14 },
            { alpha: 0.25, lineWidth: 6, blur: 8 }
        ];

        const from = Math.max(startX, centerX - packetHalf);
        const to = Math.min(endX, centerX + packetHalf);
        if (to <= from) return;

        ctx.save();
        for (const layer of layers) {
            ctx.globalAlpha = layer.alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = layer.lineWidth;
            ctx.lineJoin = 'round';
            ctx.shadowBlur = layer.blur;
            ctx.shadowColor = color;

            ctx.beginPath();
            for (let x = from; x <= to; x += 2) {
                const dist = (x - centerX) * direction;
                const y = wireY - amplitude * Math.sin(k * dist);
                if (x === from) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawScene() {
        const { startX, endX, y: wireY } = LAYOUT.wire;
        const { ppmuBox, force, sense, labels } = LAYOUT;

        ctx.clearRect(0, 0, LAYOUT.canvas.w, LAYOUT.canvas.h);

        // Reflection flash at the open boundary
        if (reflectionFlash > 0) {
            const alpha = reflectionFlash / 15;
            const grad = ctx.createRadialGradient(endX, wireY, 0, endX, wireY, 50);
            grad.addColorStop(0, `rgba(250, 204, 21, ${alpha})`);
            grad.addColorStop(1, 'rgba(250, 204, 21, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(endX, wireY, 50, 0, Math.PI * 2);
            ctx.fill();
            reflectionFlash--;
        }

        // Round-trip bracket (dashed) below the wire
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, labels.bracket);
        ctx.lineTo(endX, labels.bracket);
        ctx.stroke();
        ctx.setLineDash([]);

        // Wire with gradient glow
        const wireGrad = ctx.createLinearGradient(startX, wireY, endX, wireY);
        wireGrad.addColorStop(0, '#334155');
        wireGrad.addColorStop(0.5, '#475569');
        wireGrad.addColorStop(1, '#334155');
        ctx.strokeStyle = wireGrad;
        ctx.lineWidth = 6;
        ctx.shadowBlur = 6;
        ctx.shadowColor = '#3b82f6';
        ctx.beginPath();
        ctx.moveTo(startX, wireY);
        ctx.lineTo(endX, wireY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Open boundary bar
        ctx.strokeStyle = reflectionFlash > 0 ? '#facc15' : '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(endX, wireY - 40);
        ctx.lineTo(endX, wireY + 40);
        ctx.stroke();

        // PPMU block
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.fillRect(ppmuBox.x, ppmuBox.y, ppmuBox.w, ppmuBox.h);
        ctx.strokeRect(ppmuBox.x, ppmuBox.y, ppmuBox.w, ppmuBox.h);

        const senseActive = state === 'SENSED' || (state === 'REFLECTING' && pulseX < startX + 55);

        // Force block
        ctx.fillStyle = state === 'FORCING' ? '#ef4444' : '#334155';
        ctx.fillRect(force.x, force.y, force.w, force.h);

        // Sense block
        ctx.fillStyle = senseActive ? '#22c55e' : '#334155';
        if (senseActive) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#22c55e';
        }
        ctx.fillRect(sense.x, sense.y, sense.w, sense.h);
        ctx.shadowBlur = 0;

        // Internal wiring (exits at the vertical centers of the blocks)
        const forceMidY = force.y + force.h / 2;
        const senseMidY = sense.y + sense.h / 2;

        ctx.strokeStyle = state === 'FORCING' ? '#ef4444' : '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(force.x + force.w, forceMidY);
        ctx.lineTo(startX, forceMidY);
        ctx.lineTo(startX, wireY);
        ctx.stroke();

        ctx.strokeStyle = state === 'REFLECTING' || state === 'SENSED' ? '#22c55e' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(sense.x + sense.w, senseMidY);
        ctx.lineTo(startX, senseMidY);
        ctx.lineTo(startX, wireY);
        ctx.stroke();

        // Junction dot
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(startX, wireY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Traveling sine packet
        if (state === 'FORCING' || state === 'REFLECTING') {
            const color = state === 'FORCING' ? '#ef4444' : '#22c55e';
            const dir = state === 'FORCING' ? 1 : -1;
            drawTravelingSine(pulseX, color, dir);
        }

        // --- Labels (drawn last so text always sits on top) ---

        // Band above the wire
        ctx.fillStyle = '#64748b';
        ctx.font = `11px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('Transmission Wire', (startX + endX) / 2, labels.wireAbove);
        ctx.textAlign = 'right';
        ctx.fillText('Open Boundary', endX - 8, labels.wireAbove);

        // Junction label
        ctx.fillStyle = '#94a3b8';
        ctx.font = `10px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('Merge', startX, labels.wireBelow);

        // Round-trip bracket label
        ctx.fillText('Round-trip path', (startX + endX) / 2, labels.bracketLabel);

        // Open terminal label — right-aligned beside the boundary bar so it stays on-canvas
        ctx.fillStyle = '#94a3b8';
        ctx.font = `11px ${FONT}`;
        ctx.textAlign = 'right';
        ctx.fillText('Open Terminal', endX - 8, wireY + 58);
        ctx.fillText('(e.g., Pogo Pin)', endX - 8, wireY + 72);

        // PPMU box title, centered in the box
        ctx.fillStyle = '#e2e8f0';
        ctx.font = `bold 17px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.fillText('ATE Channel (PPMU)', ppmuBox.x + ppmuBox.w / 2, 80);

        // Force / Sense labels, centered in their blocks
        ctx.fillStyle = '#ffffff';
        ctx.font = `bold 13px ${FONT}`;
        ctx.fillText('Force (Drive)', force.x + force.w / 2, forceMidY + 5);
        ctx.fillText('Sense (Measure)', sense.x + sense.w / 2, senseMidY + 5);

        ctx.textAlign = 'left';
    }

    function animate(timestamp) {
        const { startX, endX } = LAYOUT.wire;
        if (!animStartTime) animStartTime = timestamp;
        if (!runStartTime) runStartTime = timestamp;
        const elapsed = timestamp - animStartTime;
        const oneWayMs = (SIM_NS / 2) * TIME_SCALE;

        const simTimeNs = Math.min((timestamp - runStartTime) / TIME_SCALE, SIM_NS).toFixed(2);
        liveTimer.innerText = `${simTimeNs} ns`;

        // A propagating wave travels at constant velocity, so position
        // interpolation is linear (no easing).
        if (state === 'FORCING') {
            const progress = Math.min(elapsed / oneWayMs, 1);
            pulseX = startX + (endX - startX) * progress;
            if (progress >= 1) {
                state = 'REFLECTING';
                reflectionFlash = 15;
                animStartTime = timestamp;
                updateStatus('Reflection!', 'Signal hit the open boundary and reflects backward.', 'text-green-600');
            }
        } else if (state === 'REFLECTING') {
            const progress = Math.min(elapsed / oneWayMs, 1);
            pulseX = endX - (endX - startX) * progress;
            if (progress >= 1) {
                state = 'SENSED';
                liveTimer.classList.add('hidden');
                updateStatus('Signal Sensed', 'Sense detected return pulse — round-trip time recorded for calibration.', 'text-blue-600');
                clearTimeout(resetTimeout);
                resetTimeout = setTimeout(() => {
                    state = 'IDLE';
                    updateStatus('Idle', 'Press "Fire Pulse" to run another TDR measurement.', 'text-blue-900');
                    fireBtn.disabled = false;
                    fireBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                    drawScene();
                }, 2000);
            }
        }

        drawScene();
        if (state === 'FORCING' || state === 'REFLECTING') {
            animationFrameId = requestAnimationFrame(animate);
        }
    }

    fireBtn.addEventListener('click', () => {
        if (state !== 'IDLE') return;
        clearTimeout(resetTimeout);
        state = 'FORCING';
        pulseX = LAYOUT.wire.startX;
        animStartTime = 0;
        runStartTime = 0;
        reflectionFlash = 0;
        fireBtn.disabled = true;
        fireBtn.classList.add('opacity-50', 'cursor-not-allowed');
        liveTimer.classList.remove('hidden');
        liveTimer.innerText = '0.00 ns';
        updateStatus('Driving Signal...', 'Force circuitry drives a voltage pulse down the shared transmission wire.', 'text-red-600');
        cancelAnimationFrame(animationFrameId);
        requestAnimationFrame(animate);
    });

    setupHiDPI();
    drawScene();
}
