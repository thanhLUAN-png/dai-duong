const immersiveOcean = document.getElementById('immersiveOcean');
if (immersiveOcean) {
  const track = document.getElementById('panoramaTrack'); const frameLabel = document.getElementById('oceanFrameLabel');
  let camera = 0, velocity = 0, dragging = false, startX = 0, startCamera = 0, previousX = 0, previousTime = 0;
  const worldWidth = () => immersiveOcean.clientWidth * 4;
  const wrap = (value, size) => ((value % size) + size) % size;
  const renderCamera = () => { const panelWidth = immersiveOcean.clientWidth; const width = worldWidth(); camera = wrap(camera, width); track.style.transform = `translateX(${-width - camera}px)`; const panel = Math.floor(camera / panelWidth) + 1; if (frameLabel) frameLabel.textContent = `0${panel} / 04`; };
  const beginDrag = event => { dragging = true; velocity = 0; startX = event.clientX; previousX = event.clientX; previousTime = performance.now(); startCamera = camera; immersiveOcean.classList.add('is-dragging'); immersiveOcean.setPointerCapture?.(event.pointerId); };
  const moveDrag = event => { if (!dragging) return; const now = performance.now(), dx = event.clientX - startX; camera = startCamera - dx; velocity = -(event.clientX - previousX) / Math.max(1, now - previousTime) * 16; previousX = event.clientX; previousTime = now; renderCamera(); };
  const endDrag = event => { if (!dragging) return; dragging = false; immersiveOcean.classList.remove('is-dragging'); immersiveOcean.releasePointerCapture?.(event.pointerId); };
  immersiveOcean.addEventListener('pointerdown', beginDrag); immersiveOcean.addEventListener('pointermove', moveDrag); immersiveOcean.addEventListener('pointerup', endDrag); immersiveOcean.addEventListener('pointercancel', endDrag);
  window.addEventListener('resize', renderCamera); renderCamera();

  // Mốc cố định: vị trí của mỗi cá là một hàm của giờ thực, không phụ thuộc
  // vào số frame từ lúc trang được mở. Reload ở cùng thời điểm = cùng vị trí.
  const fishEpoch = Date.UTC(2026, 0, 1, 0, 0, 0);
  const fishes = [...immersiveOcean.querySelectorAll('.fish-creature')];
  const states = fishes.map((fish, index) => ({ fish, seed: index * 2.398 + .73, x: 0, y: 0, face: -1, phase: index * 1.713 + .41 }));
  let lastDebug = 0;
  const animate = time => {
    if (!dragging && Math.abs(velocity) > .03) { camera += velocity; velocity *= .91; renderCamera(); }
    const width = worldWidth(), viewWidth = immersiveOcean.clientWidth, realSeconds = (Date.now() - fishEpoch) / 1000;
    states.forEach(state => {
      if (!state.fish.querySelector('.fish-body-layer')) { const base = state.fish.querySelector('img'); if (base) base.classList.add('fish-body-layer'); }
      const pathPhase = realSeconds * (.043 + (state.seed % .009)) + state.phase;
      const verticalPhase = realSeconds * (.17 + (state.seed % .03)) + state.seed;
      state.x = wrap(width * .5 + Math.sin(pathPhase) * width * .43 + state.seed * width * .11, width);
      state.y = immersiveOcean.clientHeight * (.42 + Math.sin(verticalPhase) * .18);
      state.face = Math.cos(pathPhase) >= 0 ? -1 : 1;
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
    if (time - lastDebug > 4000) { console.debug('[Immersive ocean]', { realSeconds: Math.round(realSeconds), frame: Math.floor(camera / viewWidth) + 1, fish: states.map(s => ({ x: Math.round(s.x), y: Math.round(s.y) })) }); lastDebug = time; }
    requestAnimationFrame(animate);
  }; requestAnimationFrame(animate);
}
