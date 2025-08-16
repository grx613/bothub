(() => {
  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const dropBtn = document.getElementById('dropBtn');
  const resetBtn = document.getElementById('resetBtn');
  const overlay = document.getElementById('overlay');
  const closeOv = document.getElementById('closeOv');
  const scoreEl = document.getElementById('scoreValue');
  const finalEl = document.getElementById('finalScore');

  const W = canvas.width;
  const H = canvas.height;

  let tower = [];
  let currentBlock = null;
  let score = 0;
  let gameOver = false;

  class Block {
    constructor(x, y, size) {
      this.x = x;
      this.y = y;
      this.size = size;
      this.speed = 3;
      this.falling = false;
      this.color = "#6b5cff";
      this.dx = 2 * (Math.random() > 0.5 ? 1 : -1);
    }
    draw() {
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    update() {
      if(!this.falling){
        this.x += this.dx;
        if(this.x < this.size/2 || this.x > W - this.size/2){
          this.dx *= -1;
        }
      } else {
        this.y += this.speed;
        // столкновение с башней
        for(let b of tower){
          if(Math.abs(this.x - b.x) < this.size && Math.abs(this.y+this.size/2 - b.y) < this.size/2){
            this.falling = false;
            this.y = b.y - this.size;
            tower.push(this);
            currentBlock = null;
            afterPlaced();
            return;
          }
        }
        // дно
        if(this.y + this.size/2 >= H){
          this.falling = false;
          this.y = H - this.size/2;
          tower.push(this);
          currentBlock = null;
          afterPlaced();
          return;
        }
      }
    }
  }

  function afterPlaced(){
    score++;
    scoreEl.textContent = score;
    // создаём сразу новый бегущий блок
    currentBlock = new Block(W/2, 30, 40);
  }

  function dropBlock(){
    if(gameOver) return;
    if(currentBlock && !currentBlock.falling){
      currentBlock.falling = true;
    }
  }

  function reset(){
    tower = [];
    currentBlock = new Block(W/2, 30, 40); // сразу первый
    score = 0;
    gameOver = false;
    scoreEl.textContent = score;
    overlay.classList.add('hidden');
  }

  function checkCollapse(){
    if(tower.length < 2) return;
    for(let b of tower){
      if(b.x < 0 || b.x > W){
        gameOver = true;
      }
    }
  }

  function loop(){
    ctx.clearRect(0,0,W,H);
    for(let b of tower) b.draw();
    if(currentBlock){
      currentBlock.update();
      currentBlock.draw();
    }
    if(!gameOver){
      checkCollapse();
      requestAnimationFrame(loop);
    } else {
      finalEl.textContent = score;
      overlay.classList.remove('hidden');
    }
  }

  dropBtn.addEventListener('click', dropBlock);
  resetBtn.addEventListener('click', reset);
  closeOv.addEventListener('click', reset);

  document.addEventListener('keydown', e=>{
    if(e.code === 'Space'){ e.preventDefault(); dropBlock(); }
  });

  reset(); // запуск игры
  loop();
})();
