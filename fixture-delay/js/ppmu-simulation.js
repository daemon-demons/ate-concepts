function initPPMUSimulation() {
    const canvas = document.getElementById('ppmu_canvas');
    const ctx = canvas.getContext('2d');
    const fireBtn = document.getElementById('ppmu_btn');
    const statusTitle = document.getElementById('ppmu_title');
    const statusText = document.getElementById('ppmu_desc');
    const liveTimer = document.getElementById('ppmu_timer');

    let state = 'IDLE';
    let pulseX = 0;
    let animationFrameId;
    let animStartTime = 0;
    let reflectionFlash = 0;
    let resetTimeout = null;

    const startX = 250;
    const endX = 700;
    const wireY = 200;
    const SIM_NS = 3.0;
    const TIME_SCALE = 600;

    function updateStatus(title, text, colorClass) {
        statusTitle.innerText = title;
        statusText.innerText = text;
        statusTitle.className = `font-bold mb-1 ${colorClass}`;
    }

    function drawPulse(x, color, direction) {
        for (let layer = 2; layer >= 0; layer--) {
            const alpha = layer === 0 ? 1 : 0.25 + layer * 0.15;
            const width = 40 + layer * 12;
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = 4 - layer;
            ctx.lineJoin = 'round';
            ctx.beginPath();
            for (let i = -width; i <= width; i++) {
                const yOffset = -45 * Math.exp(-(i * i) / (width * width / 2));
                const px = x + i * direction;
                if (i === -width) ctx.moveTo(px, wireY + yOffset);
                else ctx.lineTo(px, wireY + yOffset);
            }
            ctx.shadowBlur = layer === 0 ? 18 : 8;
            ctx.shadowColor = color;
            ctx.stroke();
            ctx.shadowBlur = 0;
        }
        ctx.globalAlpha = 1;
    }

    function drawScene() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Path labels
        ctx.fillStyle = '#64748b';
        ctx.font = '11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ATE Channel', 145, 42);
        ctx.fillText('Transmission Wire', (startX + endX) / 2, wireY - 18);
        ctx.fillText('Open Boundary', endX, wireY - 18);

        // Round-trip bracket
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(startX, wireY + 28);
        ctx.lineTo(endX, wireY + 28);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.fillText('Round-trip path', (startX + endX) / 2, wireY + 42);

        // Reflection flash
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

        // Open boundary
        ctx.strokeStyle = reflectionFlash > 0 ? '#facc15' : '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(endX, wireY - 40);
        ctx.lineTo(endX, wireY + 40);
        ctx.stroke();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '13px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Open Terminal (e.g., Pogo Pin)', endX - 130, wireY + 58);

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

        // PPMU block
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.fillRect(40, 50, 210, 300);
        ctx.strokeRect(40, 50, 210, 300);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 17px Inter, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('ATE Channel (PPMU)', 55, 80);

        const senseActive = state === 'SENSED' || (state === 'REFLECTING' && pulseX < startX + 55);

        // Force block
        ctx.fillStyle = state === 'FORCING' ? '#ef4444' : '#334155';
        ctx.fillRect(60, 110, 120, 60);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px Inter, sans-serif';
        ctx.fillText('Force (Drive)', 70, 145);

        // Sense block
        ctx.fillStyle = senseActive ? '#22c55e' : '#334155';
        if (senseActive) {
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#22c55e';
        }
        ctx.fillRect(60, 230, 120, 60);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Sense (Measure)', 65, 265);

        // Internal wiring
        ctx.strokeStyle = state === 'FORCING' ? '#ef4444' : '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(180, 140);
        ctx.lineTo(startX, 140);
        ctx.lineTo(startX, wireY);
        ctx.stroke();

        ctx.strokeStyle = state === 'REFLECTING' || state === 'SENSED' ? '#22c55e' : '#64748b';
        ctx.beginPath();
        ctx.moveTo(180, 260);
        ctx.lineTo(startX, 260);
        ctx.lineTo(startX, wireY);
        ctx.stroke();

        // Junction
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(startX, wireY, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#94a3b8';
        ctx.font = '10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Merge', startX, wireY + 22);

        if (state === 'FORCING' || state === 'REFLECTING') {
            const color = state === 'FORCING' ? '#ef4444' : '#22c55e';
            const dir = state === 'FORCING' ? 1 : -1;
            drawPulse(pulseX, color, dir);
        }
    }

    function animate(timestamp) {
        if (!animStartTime) animStartTime = timestamp;
        const elapsed = timestamp - animStartTime;
        const oneWayMs = (SIM_NS / 2) * TIME_SCALE;
        const roundTripMs = SIM_NS * TIME_SCALE;

        let simTimeNs = Math.min(elapsed / TIME_SCALE, SIM_NS).toFixed(2);
        liveTimer.innerText = `${simTimeNs} ns`;

        if (state === 'FORCING') {
            const progress = Math.min(elapsed / oneWayMs, 1);
            const eased = easeInOut(progress);
            pulseX = startX + (endX - startX) * eased;
            if (progress >= 1) {
                state = 'REFLECTING';
                reflectionFlash = 15;
                animStartTime = timestamp;
                updateStatus('Reflection!', 'Signal hit the open boundary and reflects backward.', 'text-green-600');
            }
        } else if (state === 'REFLECTING') {
            const progress = Math.min(elapsed / oneWayMs, 1);
            const eased = easeInOut(progress);
            pulseX = endX - (endX - startX) * eased;
            if (progress >= 1) {
                state = 'SENSED';
                liveTimer.classList.add('hidden');
                updateStatus('Signal Sensed', 'Sense detected return pulse — round-trip time recorded for calibration.', 'text-blue-600');
                fireBtn.disabled = false;
                fireBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                clearTimeout(resetTimeout);
                resetTimeout = setTimeout(() => {
                    state = 'IDLE';
                    updateStatus('Idle', 'Press "Fire Pulse" to run another TDR measurement.', 'text-blue-900');
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
        if (state === 'FORCING' || state === 'REFLECTING') return;
        clearTimeout(resetTimeout);
        state = 'FORCING';
        pulseX = startX;
        animStartTime = 0;
        reflectionFlash = 0;
        fireBtn.disabled = true;
        fireBtn.classList.add('opacity-50', 'cursor-not-allowed');
        liveTimer.classList.remove('hidden');
        liveTimer.innerText = '0.00 ns';
        updateStatus('Driving Signal...', 'Force circuitry drives a voltage pulse down the shared transmission wire.', 'text-red-600');
        cancelAnimationFrame(animationFrameId);
        requestAnimationFrame(animate);
    });

    drawScene();
}
