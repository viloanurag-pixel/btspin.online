(function(){
  const canvas=document.getElementById('game');
  if(!canvas) return;
  const c=canvas.getContext('2d');

  function resize(){
    const ratio=960/540;
    const w=Math.min(canvas.parentElement.clientWidth,960);
    const h=Math.round(w/ratio);
    canvas.width=960;
    canvas.height=540;
    canvas.style.width=w+'px';
    canvas.style.height=h+'px';
  }
  window.addEventListener('resize',resize);
  resize();

  const W=()=>canvas.width,H=()=>canvas.height;
  let running=true,paused=false;
  let moves=0,high=parseInt(localStorage.getItem('sl_high')||'0',10);

  // Game setup
  const rows=10, cols=10, cellSize=50;
  const boardSize=rows*cols;
  const boardX=150, boardY=40;

  let player={pos:1}; // starting at square 1

  // sample  BattleRush Dice
  const snakes={97:78, 95:56, 88:24, 62:18, 48:26};
  const ladders={4:14, 9:31, 28:84, 36:44, 51:67, 71:91};

  function rollDice(){
    if(!running||paused) return;
    const roll=Math.floor(Math.random()*6)+1;
    player.pos=Math.min(player.pos+roll,boardSize);
    moves++;
    // check ladders
    if(ladders[player.pos]) player.pos=ladders[player.pos];
    // check snakes
    if(snakes[player.pos]) player.pos=snakes[player.pos];
    // win check
    if(player.pos>=boardSize){
      running=false;
    }
  }

  window.addEventListener('keydown',e=>{
    if(e.key===' '||e.key==='Enter') rollDice();
    if(e.key==='p'||e.key==='P') paused=!paused;
    if(e.key==='r'||e.key==='R') restart();
  });

  // coordinate mapping
  function getCellXY(pos){
    let row=Math.floor((pos-1)/cols);
    let col=(pos-1)%cols;
    if(row%2===1){ col=cols-1-col; }
    return {
      x: boardX+col*cellSize,
      y: H()-boardY-(row+1)*cellSize
    };
  }

  // draw board
  function drawBoard(){
    for(let r=0;r<rows;r++){
      for(let c0=0;c0<cols;c0++){
        const x=boardX+c0*cellSize;
        const y=H()-boardY-(r+1)*cellSize;
        c.fillStyle=(r+c0)%2===0?"#222832":"#1b1f29";
        c.fillRect(x,y,cellSize,cellSize);
        const num=r*cols+(r%2===0?c0:cols-1-c0)+1;
        c.fillStyle="white";
        c.font="12px Inter";
        c.fillText(num,x+4,y+14);
      }
    }
  }

  // draw snakes and ladders
  function drawLinks(){
    c.lineWidth=4;
    // ladders in green
    c.strokeStyle="limegreen";
    for(const [from,to] of Object.entries(ladders)){
      const p1=getCellXY(parseInt(from)),p2=getCellXY(to);
      c.beginPath();
      c.moveTo(p1.x+cellSize/2,p1.y+cellSize/2);
      c.lineTo(p2.x+cellSize/2,p2.y+cellSize/2);
      c.stroke();
    }
    // snakes in red
    c.strokeStyle="crimson";
    for(const [from,to] of Object.entries(snakes)){
      const p1=getCellXY(parseInt(from)),p2=getCellXY(to);
      c.beginPath();
      c.moveTo(p1.x+cellSize/2,p1.y+cellSize/2);
      c.lineTo(p2.x+cellSize/2,p2.y+cellSize/2);
      c.stroke();
    }
  }

  // draw player token
  function drawPlayer(){
    const pos=getCellXY(player.pos);
    c.fillStyle="#3B82F6";
    c.beginPath();
    c.arc(pos.x+cellSize/2,pos.y+cellSize/2,14,0,Math.PI*2);
    c.fill();
  }

  // HUD
  function drawHUD(){
    c.fillStyle="rgba(255,255,255,.92)";
    c.font="20px Inter, Arial";
    c.fillText(`Moves: ${moves}`,16,28);
    c.fillText(`Best: ${high}`,16,52);
    if(!running){
      c.textAlign="center";
      c.font="26px Inter, Arial";
      c.fillText("You reached 100! Press R to restart",W()/2,H()/2);
      c.textAlign="start";
    }
  }

  function loop(){
    if(!running||paused){
      requestAnimationFrame(loop);
      return;
    }
    c.clearRect(0,0,W(),H());
    drawBoard();
    drawLinks();
    drawPlayer();
    drawHUD();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  function restart(){
    high=Math.max(high,boardSize-moves);
    localStorage.setItem('sl_high',String(high));
    const lb=JSON.parse(localStorage.getItem('sl_leaderboard')||'[]');
    lb.push({moves,at:new Date().toISOString()});
    lb.sort((a,b)=>a.moves-b.moves);
    localStorage.setItem('sl_leaderboard',JSON.stringify(lb.slice(0,50)));
    running=true;
    paused=false;
    moves=0;
    player.pos=1;
  }

  document.getElementById('btn-pause')?.addEventListener('click',()=>{paused=!paused});
  document.getElementById('btn-restart')?.addEventListener('click',restart);
})();
