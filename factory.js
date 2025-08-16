(() => {
  const tokensEl = document.getElementById("tokens");
  const popEl = document.getElementById("pop");
  const vramBar = document.getElementById("vramBar");
  const ctxBar = document.getElementById("ctxBar");
  const vramPct = document.getElementById("vramPct");
  const ctxPct = document.getElementById("ctxPct");
  const arena = document.getElementById("arena");
  const gameOver = document.getElementById("gameOver");
  const gameOverText = document.getElementById("gameOverText");
  const feedBtn = document.getElementById("feedBtn");
  const resetBtn = document.getElementById("resetBtn");
  const restartBtn = document.getElementById("restart");

  const state = {tokens:0, pop:3, vram:100, ctx:100, ended:false};

  const clamp = (n,min,max)=>Math.max(min,Math.min(max,n));

  function render(){
    tokensEl.textContent = state.tokens;
    popEl.textContent = state.pop;
    vramBar.style.width = state.vram+"%";
    ctxBar.style.width = state.ctx+"%";
    vramPct.textContent = Math.round(state.vram)+"%";
    ctxPct.textContent = Math.round(state.ctx)+"%";
  }

  function spawnClone(){
    const el = document.createElement("div");
    el.className = "clone";
    el.textContent = "👾";
    el.style.left = `${Math.random()*90}%`;
    el.style.top = "100%";
    el.style.opacity = "0";
    arena.appendChild(el);

    setTimeout(()=>{
      el.style.top = `${Math.random()*80}%`;
      el.style.opacity = "1";
    },50);

    setTimeout(()=> arena.removeChild(el),2000);
  }

  function feed(){
    if (state.ended) return;
    state.tokens += 1;
    state.pop += Math.floor(state.pop*0.05)+1;
    state.vram = clamp(state.vram - 2,0,100);
    state.ctx = clamp(state.ctx - 3,0,100);
    spawnClone();
    render();
    if (state.vram<=0 || state.ctx<=0){ endGame(); }
  }

  function endGame(){
    state.ended = true;
    gameOver.classList.remove("hidden");
    gameOverText.textContent = 
      `Игра окончена! Ищерги съели ${state.tokens} токенов. Популяция выросла до ${state.pop}.`;
  }

  function reset(){
    Object.assign(state,{tokens:0,pop:3,vram:100,ctx:100,ended:false});
    gameOver.classList.add("hidden");
    arena.innerHTML="";
    render();
  }

  feedBtn.addEventListener("click",feed);
  resetBtn.addEventListener("click",reset);
  restartBtn.addEventListener("click",reset);

  render();
})();
