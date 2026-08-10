const immersiveOcean = document.getElementById('immersiveOcean');
if (immersiveOcean) {
  const track = document.getElementById('panoramaTrack'); const frameLabel = document.getElementById('oceanFrameLabel');
  let camera = 0, velocity = 0, dragging = false, startX = 0, startCamera = 0, previousX = 0, previousTime = 0;
  const worldWidth = () => immersiveOcean.clientWidth * 4;
  const wrap = (value, size) => ((value % size) + size) % size;
  const circularDelta = (from, to, size) => { let delta = to - from; if (delta > size / 2) delta -= size; if (delta < -size / 2) delta += size; return delta; };
  const renderCamera = () => { const panelWidth = immersiveOcean.clientWidth; const width = worldWidth(); camera = wrap(camera, width); track.style.transform = `translateX(${-width - camera}px)`; const panel = Math.floor(camera / panelWidth) + 1; if (frameLabel) frameLabel.textContent = `0${panel} / 04`; };
  const beginDrag = event => { dragging = true; velocity = 0; startX = event.clientX; previousX = event.clientX; previousTime = performance.now(); startCamera = camera; immersiveOcean.classList.add('is-dragging'); immersiveOcean.setPointerCapture?.(event.pointerId); };
  const moveDrag = event => { if (!dragging) return; const now = performance.now(), dx = event.clientX - startX; camera = startCamera - dx; velocity = -(event.clientX - previousX) / Math.max(1, now - previousTime) * 16; previousX = event.clientX; previousTime = now; renderCamera(); };
  const endDrag = event => { if (!dragging) return; dragging = false; immersiveOcean.classList.remove('is-dragging'); immersiveOcean.releasePointerCapture?.(event.pointerId); };
  immersiveOcean.addEventListener('pointerdown', beginDrag); immersiveOcean.addEventListener('pointermove', moveDrag); immersiveOcean.addEventListener('pointerup', endDrag); immersiveOcean.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', renderCamera); renderCamera();

  const fishes = [...immersiveOcean.querySelectorAll('.fish-creature')];
  const states = fishes.map((fish, index) => ({ fish, x: 0, y: 65 + (index * 103) % Math.max(110, immersiveOcean.clientHeight - 210), targetX: 0, targetY: 0, speed: 44 + Math.random() * 28, phase: Math.random() * Math.PI * 2, face: -1, turningUntil: 0, pendingFace: -1, acceleration: 1 }));
  const chooseTarget = (state, time) => {
    const width = worldWidth(), panel = immersiveOcean.clientWidth; let delta = 0;
    while (Math.abs(delta) < panel * .38) delta = (Math.random() < .5 ? -1 : 1) * (panel * (.42 + Math.random() * .8));
    state.targetX = wrap(state.x + delta, width); state.targetY = 55 + Math.random() * Math.max(80, immersiveOcean.clientHeight - 215); state.pendingFace = delta > 0 ? -1 : 1; state.turningUntil = time + 650 + Math.random() * 250; state.acceleration = 0;
  };
  states.forEach((state, index) => { state.x = wrap((index + .35) * immersiveOcean.clientWidth * .82, worldWidth()); state.targetX = wrap(state.x + immersiveOcean.clientWidth * .55, worldWidth()); state.targetY = state.y; });
  let lastFrame = 0, lastDebug = 0;
  const animate = time => {
    const dt = Math.min(.045, ((time - lastFrame) || 16) / 1000); lastFrame = time;
    if (!dragging && Math.abs(velocity) > .03) { camera += velocity; velocity *= .91; renderCamera(); }
    const width = worldWidth(), viewWidth = immersiveOcean.clientWidth;
    states.forEach(state => {
      if (!state.fish.querySelector('.fish-body-layer')) { const base = state.fish.querySelector('img'); if (base) base.classList.add('fish-body-layer'); }
      if (time < state.turningUntil) { if (time > state.turningUntil - 330) state.face = state.pendingFace; }
      else {
        const dx = circularDelta(state.x, state.targetX, width), dy = state.targetY - state.y, distance = Math.hypot(dx, dy);
        if (distance < 16) chooseTarget(state, time);
        else { state.acceleration = Math.min(1, state.acceleration + dt / .85); const step = Math.min(distance, state.speed * state.acceleration * dt); state.x = wrap(state.x + dx / distance * step, width); state.y += dy / distance * step; }
      }
      const screenX = wrap(state.x - camera, width); const visible = screenX < viewWidth + 210;
      state.fish.style.visibility = visible ? 'visible' : 'hidden'; if (!visible) return;
      const wave = Math.sin(time / 1000 * 1.75 + state.phase); const left = `${screenX}px`, top = `${state.y + wave * 8}px`, transform = `scaleX(${state.face}) rotate(${wave * 1.7}deg)`;
      // CSS cũ có left/top !important; dùng setProperty để tọa độ của animation
      // luôn thắng CSS và được áp dụng ngay trong đúng frame đang tính.
      state.fish.style.setProperty('left', left, 'important'); state.fish.style.setProperty('top', top, 'important'); state.fish.style.setProperty('transform', transform, 'important');
      const body = state.fish.querySelector('.fish-body-layer') || state.fish.querySelector('img'); const tail = state.fish.querySelector('.fish-tail-layer'); const glow = .88 + (wave + 1) * .06;
      if (body) body.style.filter = `brightness(${glow}) saturate(1.18) drop-shadow(0 10px 9px rgba(0,25,48,.48))`; if (tail) tail.style.filter = body?.style.filter || '';
    });
    if (states[0]) { const sample = states[0]; console.debug('[Immersive fish frame]', { x: Math.round(sample.x), y: Math.round(sample.y), left: sample.fish.style.left, top: sample.fish.style.top, transform: sample.fish.style.transform }); }
    if (time - lastDebug > 4000) { console.debug('[Immersive ocean]', { frame: Math.floor(camera / viewWidth) + 1, fish: states.map(s => ({ x: Math.round(s.x), target: Math.round(s.targetX), turning: time < s.turningUntil })) }); lastDebug = time; }
    requestAnimationFrame(animate);
  }; requestAnimationFrame(animate);
}
