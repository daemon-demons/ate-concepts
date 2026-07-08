function initMathSimulation() {
    const canvas = document.getElementById('math_canvas');
    const ctx = canvas.getContext('2d');
    const slider = document.getElementById('math_slider');
    const sliderVal = document.getElementById('math_slider_val');
    const btnTp = document.getElementById('math_btn_tp');
    const btnTs = document.getElementById('math_btn_ts');
    const dispTp = document.getElementById('math_val_tp');
    const dispTs = document.getElementById('math_val_ts');
    const steps = document.getElementById('math_steps');
    const final = document.getElementById('math_final');
    const status = document.getElementById('math_status');
    const resultBox = document.getElementById('math_result_box');
    const liveTimer = document.getElementById('math_timer');

    const ATE_Y_BOTTOM = 450;
    const ATE_INTERNAL_DELAY_NS = 1.5;
    const PIXELS_PER_NS = 80;
    const POGO_Y = ATE_Y_BOTTOM - (ATE_INTERNAL_DELAY_NS * PIXELS_PER_NS);
    const WIRE_X = 200;
    const CANVAS_W = 400;
    const CANVAS_H = 500;

    let targetDibDelayNs = parseFloat(slider.value);
    let displayDibDelayNs = targetDibDelayNs;
    let measuredTp = null;
    let measuredTs = null;
    let frozenTp = false;
    let frozenTs = false;

    let animState = 'IDLE';
    let pulseY = 0;
    let pulseDir = -1;
    let animStartTime = 0;
    let animationFrameId;
    let pulseTrail = [];
    let dibHighlight = 0;
    let resizeAnimId = null;

    const COLORS = {
        socket: '#2c5282',
        dib: '#4a5568',
        ate: '#4299e1',
        dps: '#2b6cb0',
        pulseTp: '#eab308',
        pulseTs: '#10b981',
        wireTp: '#eab308',
        wireTs: '#10b981',
        wireIdle: '#cbd5e1'
    };

    function setupHiDPI() {
        const dpr = window.devicePixelRatio || 1;
        canvas.width = CANVAS_W * dpr;
        canvas.height = CANVAS_H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function getSocketY() {
        return POGO_Y - (displayDibDelayNs * PIXELS_PER_NS);
    }

    function lerpDibDelay() {
        const diff = targetDibDelayNs - displayDibDelayNs;
        if (Math.abs(diff) < 0.01) {
            displayDibDelayNs = targetDibDelayNs;
            return;
        }
        displayDibDelayNs += diff * 0.15;
        resizeAnimId = requestAnimationFrame(() => {
            if (animState === 'IDLE') drawScene();
            lerpDibDelay();
        });
    }

    function drawDelayArrow(x, y1, y2, label, color) {
        const midY = (y1 + y2) / 2;
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 4, y1 + 6);
        ctx.lineTo(x, y1);
        ctx.lineTo(x + 4, y1 + 6);
        ctx.fill();
        ctx.font = '10px IBM Plex Sans, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(label, x + 8, midY + 4);
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const socketY = getSocketY();

        // DPS block
        ctx.fillStyle = COLORS.dps;
        ctx.fillRect(40, ATE_Y_BOTTOM, 320, 50);
        ctx.strokeStyle = '#1e3a8a';
        ctx.lineWidth = 2;
        ctx.strokeRect(40, ATE_Y_BOTTOM, 320, 50);
        ctx.fillStyle = 'white';
        ctx.font = '14px IBM Plex Sans, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('DPS/DIGITAL CARDS', 200, ATE_Y_BOTTOM + 30);

        // ATE block
        ctx.fillStyle = COLORS.ate;
        ctx.fillRect(40, POGO_Y, 320, ATE_Y_BOTTOM - POGO_Y);
        ctx.strokeRect(40, POGO_Y, 320, ATE_Y_BOTTOM - POGO_Y);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 15px IBM Plex Sans, sans-serif';
        ctx.fillText('ATE (PPMU)', 200, POGO_Y + (ATE_Y_BOTTOM - POGO_Y) / 2 + 5);
        drawDelayArrow(370, POGO_Y, ATE_Y_BOTTOM, `${ATE_INTERNAL_DELAY_NS.toFixed(1)} ns (ATE)`, '#3b82f6');

        // DIB block with optional highlight
        if (dibHighlight > 0) {
            ctx.fillStyle = `rgba(59, 130, 246, ${0.15 * dibHighlight / 30})`;
            ctx.fillRect(40, socketY, 320, POGO_Y - socketY);
            dibHighlight--;
        }
        ctx.fillStyle = COLORS.dib;
        ctx.fillRect(40, socketY, 320, POGO_Y - socketY);
        ctx.strokeRect(40, socketY, 320, POGO_Y - socketY);
        ctx.fillStyle = 'white';
        ctx.font = '14px IBM Plex Sans, sans-serif';
        ctx.fillText('DIB (Load Board)', 200, socketY + (POGO_Y - socketY) / 2 + 5);
        if (POGO_Y - socketY > 20) {
            drawDelayArrow(370, socketY, POGO_Y, `${displayDibDelayNs.toFixed(1)} ns (DIB)`, '#6366f1');
        }

        // Socket
        ctx.fillStyle = COLORS.socket;
        ctx.fillRect(120, socketY - 30, 160, 30);
        ctx.strokeRect(120, socketY - 30, 160, 30);
        ctx.fillStyle = 'white';
        ctx.fillText('Socket', 200, socketY - 10);

        // Wire segments with color coding
        const wireEndY = animState === 'RUNNING_TP' ? POGO_Y : socketY;
        const wireColor = animState === 'RUNNING_TP' ? COLORS.wireTp
            : animState === 'RUNNING_TS' ? COLORS.wireTs
            : frozenTs ? COLORS.wireTs
            : frozenTp ? COLORS.wireTp
            : COLORS.wireIdle;

        ctx.strokeStyle = wireColor;
        ctx.lineWidth = 5;
        ctx.shadowBlur = animState !== 'IDLE' ? 8 : 0;
        ctx.shadowColor = wireColor;
        ctx.beginPath();
        ctx.moveTo(WIRE_X, ATE_Y_BOTTOM);
        ctx.lineTo(WIRE_X, wireEndY);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pogo boundary
        const pogoActive = animState === 'RUNNING_TP' || frozenTp;
        ctx.setLineDash(pogoActive && animState === 'RUNNING_TP' ? [6, 4] : [5, 5]);
        ctx.strokeStyle = pogoActive ? COLORS.pulseTp : '#94a3b8';
        ctx.lineWidth = pogoActive ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(20, POGO_Y);
        ctx.lineTo(380, POGO_Y);
        ctx.stroke();
        ctx.fillStyle = pogoActive ? '#b45309' : '#64748b';
        ctx.textAlign = 'left';
        ctx.font = `${pogoActive ? 'bold ' : ''}12px IBM Plex Sans, sans-serif`;
        ctx.fillText(`Pogo Pins  (t_p boundary · ${ATE_INTERNAL_DELAY_NS.toFixed(1)} ns one-way)`, 25, POGO_Y - 6);

        // Socket boundary
        const socketActive = animState === 'RUNNING_TS' || frozenTs;
        ctx.setLineDash(socketActive && animState === 'RUNNING_TS' ? [6, 4] : [5, 5]);
        ctx.strokeStyle = socketActive ? COLORS.pulseTs : '#94a3b8';
        ctx.lineWidth = socketActive ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(20, socketY);
        ctx.lineTo(380, socketY);
        ctx.stroke();
        const oneWayTs = ATE_INTERNAL_DELAY_NS + displayDibDelayNs;
        ctx.fillStyle = socketActive ? '#047857' : '#64748b';
        ctx.fillText(`DUT Socket  (t_s boundary · ${oneWayTs.toFixed(1)} ns one-way)`, 25, socketY - 6);
        ctx.setLineDash([]);

        // Pulse trail
        pulseTrail.forEach((pt, i) => {
            const alpha = (i + 1) / pulseTrail.length * 0.4;
            ctx.globalAlpha = alpha;
            ctx.fillStyle = animState === 'RUNNING_TP' ? COLORS.pulseTp : COLORS.pulseTs;
            ctx.beginPath();
            ctx.ellipse(WIRE_X, pt, 16, 5, 0, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Pulse
        if (animState !== 'IDLE') {
            const pColor = animState === 'RUNNING_TP' ? COLORS.pulseTp : COLORS.pulseTs;
            ctx.fillStyle = pColor;
            ctx.shadowBlur = 14;
            ctx.shadowColor = pColor;
            ctx.beginPath();
            ctx.ellipse(WIRE_X, pulseY, 20, 6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'white';
            ctx.font = '10px IBM Plex Sans, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(pulseDir === -1 ? '▲' : '▼', WIRE_X, pulseY + 3);
        }

        // Frozen callout after measurement
        if (frozenTp && animState === 'IDLE') {
            ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
            ctx.fillRect(35, POGO_Y - 5, 330, ATE_Y_BOTTOM - POGO_Y + 10);
        }
        if (frozenTs && animState === 'IDLE') {
            ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';
            ctx.fillRect(35, socketY - 5, 330, ATE_Y_BOTTOM - socketY + 10);
        }
    }

    function animate(timestamp) {
        if (!animStartTime) animStartTime = timestamp;
        const elapsed = timestamp - animStartTime;
        const timeScale = 800;

        const targetNs = animState === 'RUNNING_TP'
            ? ATE_INTERNAL_DELAY_NS
            : ATE_INTERNAL_DELAY_NS + displayDibDelayNs;
        const boundaryY = animState === 'RUNNING_TP' ? POGO_Y : getSocketY();

        const totalOneWayMs = targetNs * timeScale;
        const roundTripMs = totalOneWayMs * 2;

        const simTimeNs = Math.min(elapsed / timeScale, targetNs * 2).toFixed(2);
        liveTimer.innerText = `${simTimeNs} ns`;

        if (elapsed < totalOneWayMs) {
            const progress = easeInOut(elapsed / totalOneWayMs);
            pulseDir = -1;
            pulseY = ATE_Y_BOTTOM - (ATE_Y_BOTTOM - boundaryY) * progress;
        } else if (elapsed < roundTripMs) {
            const progress = easeInOut((elapsed - totalOneWayMs) / totalOneWayMs);
            pulseDir = 1;
            pulseY = boundaryY + (ATE_Y_BOTTOM - boundaryY) * progress;
        } else {
            pulseY = ATE_Y_BOTTOM;
            finishMeasurement(animState, (targetNs * 2).toFixed(2));
            return;
        }

        pulseTrail.push(pulseY);
        if (pulseTrail.length > 8) pulseTrail.shift();

        drawScene();
        animationFrameId = requestAnimationFrame(animate);
    }

    function startMeasurement(type) {
        cancelAnimationFrame(animationFrameId);
        pulseTrail = [];
        animState = type;
        animStartTime = 0;
        pulseY = ATE_Y_BOTTOM;
        pulseDir = -1;

        btnTp.disabled = true;
        btnTs.disabled = true;
        btnTp.classList.add('opacity-50');
        btnTs.classList.add('opacity-50');
        liveTimer.classList.remove('hidden');
        liveTimer.innerText = '0.00 ns';
        status.innerText = type === 'RUNNING_TP'
            ? 'Measuring round-trip to pogo (t_p)...'
            : 'Measuring round-trip to socket (t_s)...';
        requestAnimationFrame(animate);
    }

    function finishMeasurement(type, resultNs) {
        animState = 'IDLE';
        pulseTrail = [];
        liveTimer.classList.add('hidden');
        btnTp.disabled = false;
        btnTs.disabled = false;
        btnTp.classList.remove('opacity-50');
        btnTs.classList.remove('opacity-50');

        if (type === 'RUNNING_TP') {
            measuredTp = parseFloat(resultNs);
            frozenTp = true;
            frozenTs = false;
            dispTp.innerText = `${measuredTp.toFixed(2)} ns`;
            status.innerText = 't_p measured. Now measure t_s.';
        } else {
            measuredTs = parseFloat(resultNs);
            frozenTs = true;
            dispTs.innerText = `${measuredTs.toFixed(2)} ns`;
            status.innerHTML = 't<sub>s</sub> measured. Calculating t<sub>fixture</sub>...';
        }
        drawScene();
        updateMath();
    }

    function updateMath() {
        if (measuredTp !== null && measuredTs !== null) {
            resultBox.classList.remove('opacity-50', 'border-dashed', 'border-slate-300');
            resultBox.classList.add('border-solid', 'border-blue-300', 'highlight');

            const tFixture = (measuredTs / 2) - (measuredTp / 2);
            const halfTs = (measuredTs / 2).toFixed(2);
            const halfTp = (measuredTp / 2).toFixed(2);
            steps.innerHTML = `t<sub>s</sub>/2 = ${halfTs} ns &nbsp;·&nbsp; t<sub>p</sub>/2 = ${halfTp} ns<br>t<sub>fixture</sub> = ${halfTs} − ${halfTp} = <strong>${tFixture.toFixed(2)} ns</strong>`;
            final.innerText = `${tFixture.toFixed(2)} ns`;

            dibHighlight = 30;
            drawScene();

            setTimeout(() => resultBox.classList.remove('highlight'), 3000);
        } else {
            resultBox.className = 'math-box bg-slate-50 border-2 border-dashed border-slate-300 p-5 rounded-xl mt-auto opacity-50';
            steps.innerHTML = '';
            final.innerText = '--';
        }
    }

    slider.addEventListener('input', (e) => {
        targetDibDelayNs = parseFloat(e.target.value);
        sliderVal.innerText = `${targetDibDelayNs.toFixed(1)} ns`;
        measuredTp = null;
        measuredTs = null;
        frozenTp = false;
        frozenTs = false;
        dispTp.innerText = '-- ns';
        dispTs.innerText = '-- ns';
        updateMath();
        status.innerText = 'DIB geometry changed. Please remeasure t_p and t_s.';
        cancelAnimationFrame(resizeAnimId);
        lerpDibDelay();
    });

    btnTp.addEventListener('click', () => startMeasurement('RUNNING_TP'));
    btnTs.addEventListener('click', () => startMeasurement('RUNNING_TS'));

    setupHiDPI();
    drawScene();
}
