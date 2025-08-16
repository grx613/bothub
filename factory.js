// factory.js
(() => {
  const conveyor = document.querySelector('.machine:nth-child(2)');
  if (!conveyor) return;

  function spawnClone(){
    const el = document.createElement('div');
    el.textContent = "👾";
    el.style.position = "absolute";
    el.style.left = `${Math.random()*80+10}%`;
    el.style.top = `${Math.random()*60+20}%`;
    el.style.fontSize = "24px";
    el.style.opacity = "0";
    el.style.transition = "top 1.2s ease-out, opacity 1.2s";
    conveyor.style.position = "relative";
    conveyor.appendChild(el);

    requestAnimationFrame(()=>{
      el.style.top = "0%";
      el.style.opacity = "1";
      setTimeout(()=> el.remove(), 2000);
    });
  }

  setInterval(spawnClone, 1200);
})();
