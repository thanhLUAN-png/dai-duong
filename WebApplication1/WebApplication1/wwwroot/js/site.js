document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.querySelector(link.getAttribute('href'));
  if (target) { event.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
}));

const canvas = document.getElementById('colorCanvas');
if (canvas) {
  const ctx = canvas.getContext('2d'); let drawing = false, erasing = false, color = '#ef7658', size = 14, history = [], redoHistory = [];
  const type = canvas.dataset.type; let fishOutline = null, fishMask = null;
  const silhouette = () => {
    ctx.beginPath(); ctx.save(); ctx.translate(430, 290);
    if(type === 'Fish') { ctx.ellipse(-15,0,155,92,0,0,Math.PI*2); ctx.moveTo(125,-25);ctx.lineTo(245,-115);ctx.quadraticCurveTo(210,0,245,115);ctx.lineTo(125,25);ctx.closePath();ctx.moveTo(-40,-75);ctx.ellipse(-10,-105,55,24,0,0,Math.PI*2);ctx.moveTo(-30,75);ctx.ellipse(10,98,40,18,0,0,Math.PI*2); }
    else if(type === 'Turtle') { ctx.ellipse(0,0,145,115,0,0,Math.PI*2);ctx.moveTo(181,0);ctx.arc(145,0,36,0,Math.PI*2);[-1,1].forEach(s=>{ctx.moveTo(s*138,-105);ctx.ellipse(s*90,-105,48,24,s*.5,0,Math.PI*2);ctx.moveTo(s*138,105);ctx.ellipse(s*90,105,48,24,-s*.5,0,Math.PI*2)}); }
    else if(type === 'Starfish') { for(let i=0;i<10;i++){let a=-Math.PI/2+i*Math.PI/5,r=i%2?60:190;let x=Math.cos(a)*r,y=Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.closePath(); }
    ctx.restore();
  };
  const drawOutline = (clear = false) => {
    if (clear) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if ((type === 'Fish' || type === 'Jellyfish') && fishOutline) { ctx.drawImage(fishOutline, 0, 0, canvas.width, canvas.height); return; }
    ctx.strokeStyle = '#154f68'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; silhouette(); ctx.stroke();
    if(type === 'Fish') { ctx.beginPath();ctx.arc(300,260,10,0,Math.PI*2);ctx.stroke(); }
    if(type === 'Starfish') { ctx.beginPath();ctx.arc(430,290,60,0,Math.PI*2);ctx.stroke(); }
  };
  const outline = () => { drawOutline(true); history=[ctx.getImageData(0,0,canvas.width,canvas.height)]; redoHistory=[]; }; outline();
  if ((type === 'Fish' || type === 'Jellyfish') && canvas.dataset.templateImage) { const rawOutline = new Image(); rawOutline.onload = () => { 
    canvas.width = rawOutline.naturalWidth; canvas.height = rawOutline.naturalHeight;
    canvas.style.backgroundColor = '#ffffff'; 
    const buffer = document.createElement('canvas'); buffer.width = canvas.width; buffer.height = canvas.height; const bufferContext = buffer.getContext('2d'); bufferContext.drawImage(rawOutline, 0, 0); const pixels = bufferContext.getImageData(0, 0, buffer.width, buffer.height); for (let i = 0; i < pixels.data.length; i += 4) if (pixels.data[i] > 200 && pixels.data[i + 1] > 200 && pixels.data[i + 2] > 200) pixels.data[i + 3] = 0; bufferContext.putImageData(pixels, 0, 0); fishOutline = new Image(); fishOutline.onload = outline; fishOutline.src = buffer.toDataURL('image/png');
    const sourcePixels = pixels; 
    const w = canvas.width, h = canvas.height, total = w * h;
    const wall = new Uint8Array(total), dilatedWall = new Uint8Array(total);
    for (let i = 0; i < total; i++) { if (sourcePixels.data[i * 4 + 3] > 0) wall[i] = 1; }
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (wall[y * w + x]) {
          for (let dy = -5; dy <= 5; dy++) {
            for (let dx = -5; dx <= 5; dx++) {
              if (dx*dx + dy*dy <= 25) {
                const nx = x + dx, ny = y + dy;
                if (nx >= 0 && nx < w && ny >= 0 && ny < h) dilatedWall[ny * w + nx] = 1;
              }
            }
          }
        }
      }
    }
    const outside = new Uint8Array(total), queue = new Int32Array(total); let head = 0, tail = 0;
    const isOpen = index => !dilatedWall[index];
    const addOutside = index => { if (!outside[index] && isOpen(index)) { outside[index] = 1; queue[tail++] = index; } };
    for (let x = 0; x < w; x++) { addOutside(x); addOutside((h - 1) * w + x); }
    for (let y = 0; y < h; y++) { addOutside(y * w); addOutside(y * w + w - 1); }
    while (head < tail) { const current = queue[head++], x = current % w, y = Math.floor(current / w); if (x) addOutside(current - 1); if (x < w - 1) addOutside(current + 1); if (y) addOutside(current - w); if (y < h - 1) addOutside(current + w); }
    let insideCount = 0;
    const maskPixels = new ImageData(w, h); 
    for (let index = 0; index < total; index++) if (!outside[index]) { const pixel = index * 4; maskPixels.data[pixel] = 255; maskPixels.data[pixel + 1] = 255; maskPixels.data[pixel + 2] = 255; maskPixels.data[pixel + 3] = 255; insideCount++; }
    if (insideCount > 1000) { fishMask = document.createElement('canvas'); fishMask.width = w; fishMask.height = h; fishMask.getContext('2d').putImageData(maskPixels, 0, 0); }
  }; rawOutline.src = canvas.dataset.templateImage; }
  const applyFishMask = () => { if (type === 'Fish' || type === 'Jellyfish') { if (fishMask) { ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(fishMask, 0, 0); ctx.restore(); } drawOutline(); } };
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
  const start=e=>{drawing=true; ctx.save(); if (type !== 'Fish' && type !== 'Jellyfish') { silhouette(); ctx.clip(); } const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};
  const move=e=>{if(!drawing)return;const p=point(e);ctx.globalCompositeOperation=erasing?'destination-out':'source-over';ctx.strokeStyle=color;ctx.lineWidth=size*(canvas.width/860);ctx.lineTo(p.x,p.y);ctx.stroke();applyFishMask();ctx.globalCompositeOperation=erasing?'destination-out':'source-over';ctx.beginPath();ctx.moveTo(p.x,p.y);};
  const end=()=>{if(drawing){ctx.restore();applyFishMask();drawOutline();history.push(ctx.getImageData(0,0,canvas.width,canvas.height));redoHistory=[];}drawing=false;ctx.globalCompositeOperation='source-over'};
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',end);
  document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;erasing=false}); document.getElementById('brushSize').oninput=e=>size=e.target.value;
  document.getElementById('eraserButton').onclick=()=>erasing=!erasing; document.getElementById('resetButton').onclick=outline;
  document.getElementById('undoButton').onclick=()=>{if(history.length>1){redoHistory.push(history.pop());ctx.putImageData(history[history.length-1],0,0)}};
  document.getElementById('redoButton').onclick=()=>{if(redoHistory.length){const restored=redoHistory.pop();history.push(restored);ctx.putImageData(restored,0,0)}};
  document.getElementById('submissionForm').onsubmit=()=>document.getElementById('imageData').value=canvas.toDataURL('image/png');
}

const creatureGrid = document.getElementById('oceanCreatureGrid');
if (creatureGrid && document.getElementById('oceanPager')) {
  const creatures = [...creatureGrid.querySelectorAll('.depth-creature')];
  const pager = document.getElementById('oceanPager'); const label = document.getElementById('oceanPageLabel');
  const perPage = 6; const pages = Math.ceil(creatures.length / perPage); let page = 0;
  const renderPage = () => {
    creatures.forEach((creature, index) => creature.hidden = Math.floor(index / perPage) !== page);
    const slotCount = Math.min(pages, 7); const center = Math.floor(slotCount / 2); label.replaceChildren();
    for (let slot = 0; slot < slotCount; slot++) {
      const shownPage = (page + slot - center + pages) % pages; const button = document.createElement('button');
      button.type = 'button'; button.textContent = String(shownPage + 1).padStart(2, '0'); button.className = shownPage === page ? 'active' : '';
      button.onclick = () => { page = shownPage; renderPage(); }; label.append(button);
    }
  };
  if (pages) { pager.hidden = false; renderPage(); document.getElementById('oceanNext').onclick = () => { page = (page + 1) % pages; renderPage(); }; document.getElementById('oceanPrevious').onclick = () => { page = (page - 1 + pages) % pages; renderPage(); }; }
}

document.querySelectorAll('.ocean-open-grid .released-creature img').forEach(image => {
  const trimArtwork = () => {
    if (image.dataset.trimmed) return; image.dataset.trimmed = 'true';
    const sourceCanvas = document.createElement('canvas'); sourceCanvas.width = image.naturalWidth; sourceCanvas.height = image.naturalHeight;
    const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true }); sourceContext.drawImage(image, 0, 0);
    const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height); let minX = sourceCanvas.width, minY = sourceCanvas.height, maxX = -1, maxY = -1;
    // Ảnh từ Canvas đã có nền alpha. Không xóa màu trắng ở đây vì đó có thể là
    // màu người dùng tô; chỉ giữ thành phần pixel không trong suốt lớn nhất.
    const width0 = sourceCanvas.width, height0 = sourceCanvas.height, count = width0 * height0;
    const seen = new Uint8Array(count), component = new Int32Array(count), queue = new Int32Array(count); let best = [], bestSize = 0;
    for (let start = 0; start < count; start++) {
      if (seen[start] || pixels.data[start * 4 + 3] < 18) continue;
      let head = 0, tail = 0; queue[tail++] = start; seen[start] = 1;
      while (head < tail) { const current = queue[head++], x = current % width0, y = Math.floor(current / width0); component[head - 1] = current;
        const add = next => { if (!seen[next] && pixels.data[next * 4 + 3] >= 18) { seen[next] = 1; queue[tail++] = next; } };
        if (x) add(current - 1); if (x < width0 - 1) add(current + 1); if (y) add(current - width0); if (y < height0 - 1) add(current + width0);
      }
      if (tail > bestSize) { bestSize = tail; best = Array.from(component.subarray(0, tail)); }
    }
    const keep = new Uint8Array(count); best.forEach(index => keep[index] = 1);
    for (let index = 0; index < count; index++) { const pixel = index * 4; if (!keep[index]) pixels.data[pixel + 3] = 0; else { const x = index % width0, y = Math.floor(index / width0); minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y); } }
    if (maxX < 0) return; sourceContext.putImageData(pixels, 0, 0);
    const padding = 12, width = maxX - minX + 1 + padding * 2, height = maxY - minY + 1 + padding * 2; const cropped = document.createElement('canvas'); cropped.width = width; cropped.height = height;
    cropped.getContext('2d').drawImage(sourceCanvas, minX - padding, minY - padding, width, height, 0, 0, width, height); const cleanUrl = cropped.toDataURL('image/png'); image.src = cleanUrl;
    const fish = image.closest('.fish-creature');
    if (fish && !fish.dataset.tailReady) {
      // Mẫu cá hiện tại có đầu/mắt bên trái và vây đuôi hình quạt bên phải.
      // Điểm nối nằm ở eo, khoảng 70% bề ngang ảnh đã crop (đã kiểm tra theo mẫu).
      fish.dataset.tailReady = 'true'; const tailInfo = { side: 'right' };
      const splitX = Math.round(cropped.width * .70), overlap = Math.max(3, Math.round(cropped.width * 0.025)), tailOnLeft = false;
      const bodyCanvas = document.createElement('canvas'), tailCanvas = document.createElement('canvas'); bodyCanvas.width = tailCanvas.width = cropped.width; bodyCanvas.height = tailCanvas.height = cropped.height;
      const bodyContext = bodyCanvas.getContext('2d'), tailContext = tailCanvas.getContext('2d');
      bodyContext.drawImage(cropped, 0, 0); tailContext.drawImage(cropped, 0, 0);
      if (tailOnLeft) { bodyContext.clearRect(0, 0, Math.max(0, splitX - overlap), cropped.height); tailContext.clearRect(splitX + overlap, 0, cropped.width - splitX, cropped.height); }
      else { bodyContext.clearRect(splitX + overlap, 0, cropped.width - splitX, cropped.height); tailContext.clearRect(0, 0, Math.max(0, splitX - overlap), cropped.height); }
      image.classList.add('fish-body-layer'); image.src = bodyCanvas.toDataURL('image/png');
      fish.style.setProperty('--tail-pivot', `${(splitX / cropped.width * 100).toFixed(2)}%`);
      fish.dataset.tailSide = tailInfo.side; console.debug('[Ocean fish split]', { tailSide: tailInfo.side, splitX });
      const tail = image.cloneNode(); tail.className = 'fish-tail-layer'; tail.src = tailCanvas.toDataURL('image/png'); tail.alt = ''; tail.setAttribute('aria-hidden', 'true'); image.after(tail);
    }
  };
  if (image.complete) trimArtwork(); else image.addEventListener('load', trimArtwork, { once: true });
});

const naturalOcean = document.querySelector('.ocean-open-grid:not(.immersive-fish-layer)');
if (naturalOcean) {
  const fishes = [...naturalOcean.querySelectorAll('.fish-creature')];
  const swimStates = fishes.map((fish, index) => ({
    fish, image: fish.querySelector('.fish-body-layer') || fish.querySelector('img'), tail: fish.querySelector('.fish-tail-layer'),
    x: 35 + index * 145, y: 55 + index * 70, targetX: 0, targetY: 0, nextTargetAt: 0,
    travelSpeed: 58 + Math.random() * 35, phaseSpeed: 0.9 + Math.random() * 0.35, phase: Math.random() * Math.PI * 2
  }));
  let previousFrame = 0, lastDebug = 0;
  const pickTarget = (state, time, width, height) => {
    const fishWidth = state.fish.offsetWidth, fishHeight = state.fish.offsetHeight;
    state.targetX = 15 + Math.random() * Math.max(1, width - fishWidth - 30);
    state.targetY = 15 + Math.random() * Math.max(1, height - fishHeight - 30);
    state.nextTargetAt = time + (2000 + Math.random() * 3000);
  };
  const swimFrame = time => {
    const elapsed = Math.min((time - previousFrame) / 1000 || 0, 0.04); previousFrame = time;
    const width = naturalOcean.clientWidth, height = naturalOcean.clientHeight;
    swimStates.forEach(state => {
      const fishWidth = state.fish.offsetWidth, fishHeight = state.fish.offsetHeight;
      const dx = state.targetX - state.x, dy = state.targetY - state.y, distance = Math.hypot(dx, dy);
      if (time >= state.nextTargetAt || distance < 12) pickTarget(state, time, width, height);
      const targetDx = state.targetX - state.x, targetDy = state.targetY - state.y, targetDistance = Math.max(1, Math.hypot(targetDx, targetDy));
      const step = Math.min(targetDistance, state.travelSpeed * elapsed); state.x += targetDx / targetDistance * step; state.y += targetDy / targetDistance * step;
      state.x = Math.max(12, Math.min(state.x, width - fishWidth - 12)); state.y = Math.max(12, Math.min(state.y, height - fishHeight - 12));
      const swimPhase = time / 1000 * state.phaseSpeed + state.phase;
      const bob = Math.sin(swimPhase * 2.2) * 10;
      // Ảnh mẫu có đầu ở phía trái. Khi bơi sang phải cần lật ngang để đầu dẫn đường.
      const direction = targetDx >= 0 ? -1 : 1;
      state.fish.style.setProperty('left', `${state.x}px`, 'important');
      state.fish.style.setProperty('top', `${state.y + bob}px`, 'important');
      state.fish.style.transform = `scaleX(${direction}) rotate(${Math.sin(swimPhase) * 2}deg)`;
      if (!state.tail) state.tail = state.fish.querySelector('.fish-tail-layer');
      if (state.image) {
        const shimmer = (Math.sin(swimPhase * 3.4) + 1) / 2;
        state.image.style.filter = `brightness(${1 + shimmer * 0.14}) saturate(${1 + shimmer * 0.25}) hue-rotate(${shimmer * 9}deg) drop-shadow(0 10px 8px rgba(0, 38, 60, ${0.28 + shimmer * 0.16}))`;
        state.image.style.opacity = `${0.91 + shimmer * 0.09}`;
      }
      if (state.tail) { state.tail.style.filter = state.image?.style.filter || ''; state.tail.style.opacity = state.image?.style.opacity || '1'; }
    });
    if (time - lastDebug > 3000) { console.debug('[Ocean fish animation]', swimStates.map(({ x, y, targetX, targetY }) => ({ x: Math.round(x), y: Math.round(y), targetX: Math.round(targetX), targetY: Math.round(targetY) }))); lastDebug = time; }
    requestAnimationFrame(swimFrame);
  };
  requestAnimationFrame(swimFrame);
}
