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
    if ((type === 'Fish' || type === 'Fish2' || type === 'Jellyfish') && fishOutline) { ctx.drawImage(fishOutline, 0, 0, canvas.width, canvas.height); return; }
    ctx.strokeStyle = '#154f68'; ctx.lineWidth = 7; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; silhouette(); ctx.stroke();
    if(type === 'Fish') { ctx.beginPath();ctx.arc(300,260,10,0,Math.PI*2);ctx.stroke(); }
    if(type === 'Starfish') { ctx.beginPath();ctx.arc(430,290,60,0,Math.PI*2);ctx.stroke(); }
  };
  const outline = () => { drawOutline(true); history=[ctx.getImageData(0,0,canvas.width,canvas.height)]; redoHistory=[]; }; outline();
  if ((type === 'Fish' || type === 'Fish2' || type === 'Jellyfish') && canvas.dataset.templateImage) { const rawOutline = new Image(); rawOutline.onload = () => { 
    canvas.style.backgroundColor = '#ffffff'; 
    const buffer = document.createElement('canvas'); buffer.width = canvas.width; buffer.height = canvas.height; const bufferContext = buffer.getContext('2d'); 
    const scale = Math.min((canvas.width - 100) / rawOutline.naturalWidth, (canvas.height - 100) / rawOutline.naturalHeight);
    const scaledW = rawOutline.naturalWidth * scale; const scaledH = rawOutline.naturalHeight * scale;
    const x = (canvas.width - scaledW) / 2; const y = (canvas.height - scaledH) / 2;
    bufferContext.drawImage(rawOutline, x, y, scaledW, scaledH); const pixels = bufferContext.getImageData(0, 0, buffer.width, buffer.height); for (let i = 0; i < pixels.data.length; i += 4) if (pixels.data[i] > 200 && pixels.data[i + 1] > 200 && pixels.data[i + 2] > 200) pixels.data[i + 3] = 0; bufferContext.putImageData(pixels, 0, 0); fishOutline = new Image(); fishOutline.onload = outline; fishOutline.src = buffer.toDataURL('image/png');
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
  const applyFishMask = () => { if (type === 'Fish' || type === 'Fish2' || type === 'Jellyfish') { if (fishMask) { ctx.save(); ctx.globalCompositeOperation = 'destination-in'; ctx.drawImage(fishMask, 0, 0); ctx.restore(); } drawOutline(); } };
  const point=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
  const start=e=>{drawing=true; ctx.save(); if (type !== 'Fish' && type !== 'Fish2' && type !== 'Jellyfish') { silhouette(); ctx.clip(); } const p=point(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};
  const move=e=>{if(!drawing)return;const p=point(e);ctx.globalCompositeOperation=erasing?'destination-out':'source-over';ctx.strokeStyle=color;ctx.lineWidth=size*(canvas.width/860);ctx.lineTo(p.x,p.y);ctx.stroke();applyFishMask();ctx.globalCompositeOperation=erasing?'destination-out':'source-over';ctx.beginPath();ctx.moveTo(p.x,p.y);};
  const end=()=>{if(drawing){ctx.restore();applyFishMask();drawOutline();history.push(ctx.getImageData(0,0,canvas.width,canvas.height));redoHistory=[];}drawing=false;ctx.globalCompositeOperation='source-over'};
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',end);
  document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;erasing=false}); document.getElementById('brushSize').oninput=e=>size=e.target.value;
  document.getElementById('eraserButton').onclick=()=>erasing=!erasing; document.getElementById('resetButton').onclick=outline;
  document.getElementById('undoButton').onclick=()=>{if(history.length>1){redoHistory.push(history.pop());ctx.putImageData(history[history.length-1],0,0)}};
  document.getElementById('redoButton').onclick=()=>{if(redoHistory.length){const restored=redoHistory.pop();history.push(restored);ctx.putImageData(restored,0,0)}};
  document.getElementById('submissionForm').onsubmit=()=>document.getElementById('imageData').value=canvas.toDataURL('image/png');
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
      fish.dataset.tailReady = 'true';
      const splitX = Math.round(cropped.width * .70), overlap = Math.max(3, Math.round(cropped.width * 0.025)), tailOnLeft = false;
      const bodyCanvas = document.createElement('canvas'), tailCanvas = document.createElement('canvas'); bodyCanvas.width = tailCanvas.width = cropped.width; bodyCanvas.height = tailCanvas.height = cropped.height;
      const bodyContext = bodyCanvas.getContext('2d'), tailContext = tailCanvas.getContext('2d');
      bodyContext.drawImage(cropped, 0, 0); tailContext.drawImage(cropped, 0, 0);
      if (tailOnLeft) { bodyContext.clearRect(0, 0, Math.max(0, splitX - overlap), cropped.height); tailContext.clearRect(splitX + overlap, 0, cropped.width - splitX, cropped.height); }
      else { bodyContext.clearRect(splitX + overlap, 0, cropped.width - splitX, cropped.height); tailContext.clearRect(0, 0, Math.max(0, splitX - overlap), cropped.height); }
      image.classList.add('fish-body-layer'); image.src = bodyCanvas.toDataURL('image/png');
      fish.style.setProperty('--tail-pivot', `${(splitX / cropped.width * 100).toFixed(2)}%`);
      const tail = image.cloneNode(); tail.className = 'fish-tail-layer'; tail.src = tailCanvas.toDataURL('image/png'); tail.alt = ''; tail.setAttribute('aria-hidden', 'true'); image.after(tail);
    }
  };
  if (image.complete) trimArtwork(); else image.addEventListener('load', trimArtwork, { once: true });
});
