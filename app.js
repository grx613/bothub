(() => {
  const tokensEl = document.getElementById('tokensValue');
  const popEl = document.getElementById('popValue');
  const vramBar = document.getElementById('vramBar');
  const ctxBar = document.getElementById('ctxBar');
  const vramPct = document.getElementById('vramPct');
  const ctxPct = document.getElementById('ctxPct');
  const feedBtn = document.getElementById('feedBtn');
  const swarm = document.getElementById('swarm');
  const shareBtn = document.getElementById('shareBtn');
  const shareBtn2 = document.getElementById('shareBtn2');
  const resetBtn = document.getElementById('resetBtn');
  const overlay = document.getElementById('overlay');
  const closeOv = document.getElementById('closeOv');

  const state = {
    tokens: 0,
    pop: 3,
    vram: 100,
    ctx: 100,
    ended: false
  };

  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
  function fmt(n){ return new Intl.NumberFormat('ru-RU').format(n); }

  function updateBars(){
    vramBar.style.width = `${state.vram}%`;
    ctxBar.style.width = `${state.ctx}%`;
    vramPct.textContent = `${Math.round(state.vram)}%`;
    ctxPct.textContent = `${Math.round(state.ctx)}%`;
    const vr = state.vram, cx = state.ctx;
    vramBar.style.background = vr > 50 ? 'linear-gradient(90deg,#31d0aa,#ffba49)' :
                               vr > 20 ? 'linear-gradient(90deg,#ffba49,#ff8a49)' :
                                         'linear-gradient(90deg,#ff6b6b,#ff3b3b)';
    ctxBar.style.background = cx > 50 ? 'linear-gradient(90deg,#59c4ff,#ff7ab3)' :
                              cx > 20 ? 'linear-gradient(90deg,#ffb3d1,#ff7ab3)' :
                                        'linear-gradient(90deg,#ff6b6b,#ff3b3b)';
  }

  function render(){
    tokensEl.textContent = fmt(state.tokens);
    popEl.textContent = fmt(state.pop);
    updateBars();
  }

  function addIshergBurst(cx, cy, count = 4){
    const rect = swarm.getBoundingClientRect();
    for(let i=0;i<count;i++){
      const x = clamp((cx ?? (rect.width/2)) + rand(-60, 60), 10, rect.width-10);
      const y = clamp((cy ?? (rect.height/2)) + rand(-40, 40), 10, rect.height-10);
      const el = document.createElement('div');
      el.className = 'ish';
      el.style.left = `${x}px`;
      el.style.top = `${y}px`;
      el.style.animationDelay = `${(Math.random()*2).toFixed(2)}s`;
      el.innerHTML = svgIsherg(randColor());
      swarm.appendChild(el);
      if (swarm.childElementCount > 180) {
        for(let j=0;j<20;j++){ swarm.removeChild(swarm.firstElementChild); }
      }
    }
  }

  function svgIsherg(color){
    const gid = 'g' + Math.floor(Math.random()*1e6);
    return `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <defs>
          <radialGradient id="${gid}" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stop-color="${color}" stop-opacity="1"/>
            <stop offset="100%" stop-color="#1a1830" stop-opacity=".0"/>
          </radialGradient>
        </defs>
        <circle cx="12" cy="12" r="8" fill="${color}" />
        <circle cx="9.5" cy="10" r="1.4" fill="#fff"/>
        <circle cx="14.5" cy="10" r="1.4" fill="#fff"/>
        <circle cx="9.5" cy="10" r=".6" fill="#241f44"/>
        <circle cx="14.5" cy="10" r=".6" fill="#241f44"/>
        <ellipse cx="12" cy="14.5" rx="3" ry="1.6" fill="url(#${gid})"/>
        <rect x="4" y="11" width="2" height="2" rx="1" fill="${color}"/>
        <rect x="18" y="11" width="2" height="2" rx="1" fill="${color}"/>
      </svg>
    `;
  }

  function rand(min, max){ return Math.random()*(max-min)+min; }
  function randColor(){
    const palette = ['#6b5cff','#8a6bff','#ff6bd6','#59c4ff','#7af0d8','#ffa86b'];
    return palette[Math.floor(Math.random()*palette.length)];
  }

  function feed(x, y){
    if (state.ended) return;
    state.tokens += 1;
    state.pop += 1 + Math.floor(state.pop * 0.01);
    state.vram = clamp(state.vram - rand(0.6, 1.0), 0, 100);
    state.ctx  = clamp(state.ctx  - rand(1.0, 1.4), 0, 100);
    render();
    addIshergBurst(x, y, 5);
    if (state.vram <= 0 || state.ctx <= 0){
      endGame();
    }
    save();
  }

  function endGame(){
    state.ended = true;
    overlay.classList.remove('hidden');
    document.getElementById('ovText').textContent =
      `Ищерги съели ${fmt(state.tokens)} токенов. Популяция выросла до ${fmt(state.pop)}.`;
  }

  function reset(){
    state.tokens = 0;
    state.pop = 3;
    state.vram = 100;
    state.ctx = 100;
    state.ended = false;
    overlay.classList.add('hidden');
    swarm.innerHTML = '';
    render();
    save();
  }

  async function share(){
    const url = new URL(window.location.href);
    url.searchParams.set('tokens', String(state.tokens));
    url.searchParams.set('pop', String(state.pop));
    const shareText = `⚡️ Ищерги съели ${fmt(state.tokens)} токенов. Популяция: ${fmt(state.pop)}. Сможешь переплюнуть?`;
    const shareData = { title: 'Покорми ищергов', text: shareText, url: url.toString() };
    try{
      if (navigator.share){
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        toast('Ссылка скопирована');
      }
    }catch(e){}
  }

  function toast(text){
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = 'position:fixed;left:50%;bottom:24px;transform:translateX(-50%);padding:10px 14px;border-radius:12px;background:#241f44;color:#fff;border:1px solid rgba(255,255,255,.15);z-index:9999';
    document.body.appendChild(el);
    setTimeout(()=> el.remove(), 1600);
  }

  feedBtn.addEventListener('click', (e)=>{
    const r = swarm.getBoundingClientRect();
    const x = (e.clientX || (r.left + r.width/2)) - r.left;
    const y = (e.clientY || (r.top + r.height/2)) - r.top;
    feed(x,y);
  });

  document.addEventListener('keydown', (e)=>{
    if (e.code === 'Space'){ e.preventDefault(); feed(); }
    if ((e.key === 'Alt' && e.shiftKey) || (e.key === 'Shift' && e.altKey)){
      for(let i=0;i<20;i++){
        if (swarm.firstElementChild) swarm.removeChild(swarm.firstElementChild);
      }
    }
  });

  shareBtn.addEventListener('click', share);
  if (shareBtn2) shareBtn2.addEventListener('click', share);
  resetBtn.addEventListener('click', reset);
  closeOv.addEventListener('click', reset);

  function save(){
    try{
      localStorage.setItem('ishergi_v1', JSON.stringify(state));
    }catch{}
  }
  function load(){
    try{
      const raw = localStorage.getItem('ishergi_v1');
      if (raw){
        const s = JSON.parse(raw);
        Object.assign(state, {
          tokens: Number(s.tokens)||0,
          pop: Number(s.pop)||3,
          vram: Number(s.vram)||100,
          ctx: Number(s.ctx)||100,
          ended: !!s.ended
        });
      }
    }catch{}
  }

  function checkSharedParams(){
    const url = new URL(window.location.href);
    const tokens = Number(url.searchParams.get('tokens')||'');
    const pop = Number(url.searchParams.get('pop')||'');
    if (tokens && pop){
      toast(`Результат друга: токены ${fmt(tokens)}, популяция ${fmt(pop)}`);
    }
  }

  load();
  render();
  checkSharedParams();
  setTimeout(()=> addIshergBurst(null, null, 12), 300);
})();
