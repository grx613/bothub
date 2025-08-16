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
  const blockSize = 40;

  const colors = ["#6b5cff","#ff6bd6","#59c4ff","#7af0d8","#ffa86b"];

  let tower = [];
  let currentBlock = null;
  let score = 0;
  let gameOver = false;
  let ishergi = [];

  // ======= Класс блока =======
  class Block {
    constructor(x,y,size,color){
      this.x = x;
      this.y = y;
      this.size = size;
      this.color = color;
      this.falling = false;
      this.speed = 3;
      this.dx = 2 * (Math.random()>0.5?1:-1);
    }
    draw(){
      ctx.fillStyle = this.color;
      ctx.fillRect(this.x - this.size/2, this.y - this.size/2, this.size, this.size);
    }
    update(){
      if(!this.falling){
        this.x += this.dx;
        if(this.x < this.size/2 || this.x > W - this.size/2){
          this.dx *= -1;
        }
      }else{
        this.y += this.speed;
        // сталкивание с башней
        for(let b of tower){
          if(Math.abs(this.x - b.x) < this.size &&
             this.y + this.size/2 >= b.y - this.size/2){
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
        }
      }
    }
  }

  // ======= Класс ищерга =======
  class Isherg {
    constructor() {
      this.x = Math.random() * W;
      this.y = H - 10;
      this.color = randColor();
      this.timer = 0;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 8, 0, Math.PI*2);
      ctx.fillStyle = this.color;
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.fillRect(this.x-3, this.y-3, 2, 2);
      ctx.fillRect(this.x+1, this.y-3, 2, 2);
    }
    update() {
      this.x += (Math.random()-0.5)*1.5;
      this.x = Math.max(8, Math.min(W-8,this.x));
      this.timer++;
      if(this.timer > 180){ // примерно раз в 3 секунды
        this.timer = 0;
        gnawBlock(this.x);
      }
    }
  }

  // ======= Функции =======
  function afterPlaced(){
    score++;
    scoreEl.textContent = score;
    currentBlock = new Block(W/2, 30, blockSize, randColor());
  }

  function dropBlock(){
    if(gameOver) return;
    if(currentBlock && !currentBlock.falling){
      currentBlock.falling = true;
    }
  }

  function reset(){
    tower = [];
    score = 0;
    gameOver = false;
    scoreEl.textContent = score;
    overlay.classList.add('hidden');

    // фундамент
    const base = new Block(W/2, H - blockSize/2, blockSize, "#444");
    tower.push(base);

    // первый блок
    currentBlock = new Block(W/2, 30, blockSize, randColor());

    // спавн ищергов
    ishergi = [];
    spawnIshergs(4);
  }

  function checkCollapse(){
    for(let b of tower){
      if(b.x < 0 || b.x > W){
        gameOver = true;
      }
    }
    if(tower.length <= 1 && !gameOver){ 
      // остался один фундамент — значит, башню съели
      gameOver = true;
    }
  }

  function gnawBlock(xPos){
    // ищем нижние блоки кроме фундамента
    let candidates = tower.filter(b => b.color !== "#444" && b.y > H - blockSize*2);
    if(candidates.length){
      let victim = candidates.reduce((prev,cur)=>
        Math.abs(cur.x-xPos)<Math.abs(prev.x-xPos)?cur:prev
      );
      let idx = tower.indexOf(victim);
      if(idx>=0){
        tower.splice(idx,1);
        // всё, что выше жертвы, опускаем вниз
        for(let b of tower){
          if(b.y < victim.y){
            b.y += blockSize;
          }
        }
      }
    }
  }

  function spawnIshergs(n=3){
    for(let i=0;i<n;i++) ishergi.push(new Isherg());
  }

  function loop(){
    ctx.clearRect(0,0,W,H);
    tower.forEach(b => b.draw());
    if(currentBlock){
      currentBlock.update();
      currentBlock.draw();
    }
    // ищерги
    ishergi.forEach(i => { i.update(); i.draw(); });

    if(!gameOver){
      checkCollapse();
      requestAnimationFrame(loop);
    } else {
      finalEl.textContent = score;
      overlay.classList.remove('hidden');
    }
  }

  function randColor(){
    return colors[Math.floor(Math.random()*colors.length)];
  }

  // ======= Управление =======
  dropBtn.addEventListener('click', dropBlock);
  resetBtn.addEventListener('click', reset);
  closeOv.addEventListener('click', reset);
  document.addEventListener('keydown', e=>{
    if(e.code === 'Space'){ e.preventDefault(); dropBlock(); }
  });

  // ======= Старт =======
  reset();
  loop();
})();
