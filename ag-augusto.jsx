// ===================== GTA AUGUSTO =====================
function GTAAugustoGame() {
  const canvasRef = React.useRef(null);
  const stRef = React.useRef(null);
  const rafRef = React.useRef(null);
  const keysRef = React.useRef({});
  const [score, setScore] = React.useState(0);
  const [wanted, setWanted] = React.useState(0);
  const [status, setStatus] = React.useState('idle');
  const W = 380, H = 460;

  const start = () => {
    stRef.current = {
      px: W/2, py: H-80, pvx: 0, pvy: 0,
      cars: [], coins: [], cops: [],
      roadY: 0, score: 0, wanted: 0,
      spawnT: 0, coinT: 0, copT: 0,
      running: true,
    };
    setScore(0); setWanted(0); setStatus('playing');
  };

  React.useEffect(() => {
    if (status !== 'playing') return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const s = stRef.current;

    const draw = () => {
      // grass
      ctx.fillStyle = '#0d2a0d'; ctx.fillRect(0,0,W,H);
      // road
      ctx.fillStyle = '#1a1a24'; ctx.fillRect(40,0,W-80,H);
      // lane dashes
      ctx.fillStyle = '#f5e050';
      for (let y = ((s.roadY) % 40) - 40; y < H; y += 40) {
        ctx.fillRect(W/2-3, y, 6, 22);
      }
      // edge lines
      ctx.fillStyle = '#fff';
      ctx.fillRect(42,0,3,H); ctx.fillRect(W-45,0,3,H);
      // coins
      s.coins.forEach(c => {
        ctx.shadowColor='#facc15'; ctx.shadowBlur=12;
        ctx.fillStyle='#facc15';
        ctx.beginPath(); ctx.arc(c.x,c.y,8,0,Math.PI*2); ctx.fill();
        ctx.shadowBlur=0;
        ctx.fillStyle='#000'; ctx.font='bold 11px sans-serif'; ctx.textAlign='center';
        ctx.fillText('$',c.x,c.y+4);
      });
      // enemy cars
      s.cars.forEach(c => {
        ctx.fillStyle = c.color;
        ctx.beginPath(); ctx.roundRect(c.x-14,c.y-22,28,44,4); ctx.fill();
        ctx.fillStyle = 'rgba(120,200,255,0.6)';
        ctx.fillRect(c.x-11,c.y-16,22,10);
        ctx.fillRect(c.x-11,c.y+6,22,10);
      });
      // cops
      s.cops.forEach(c => {
        ctx.fillStyle = '#1e40af';
        ctx.beginPath(); ctx.roundRect(c.x-14,c.y-22,28,44,4); ctx.fill();
        ctx.fillStyle='#fff'; ctx.fillRect(c.x-14,c.y-5,28,6);
        const flash = Math.floor(Date.now()/120)%2;
        ctx.fillStyle=flash?'#ef4444':'#3b82f6';
        ctx.fillRect(c.x-12,c.y-22,10,4);
        ctx.fillStyle=flash?'#3b82f6':'#ef4444';
        ctx.fillRect(c.x+2,c.y-22,10,4);
      });
      // player (Augusto's car)
      ctx.shadowColor='#a855f7'; ctx.shadowBlur=16;
      ctx.fillStyle='#a855f7';
      ctx.beginPath(); ctx.roundRect(s.px-15,s.py-24,30,48,5); ctx.fill();
      ctx.shadowBlur=0;
      ctx.fillStyle='rgba(255,255,255,0.8)';
      ctx.fillRect(s.px-12,s.py-18,24,10);
      ctx.fillRect(s.px-12,s.py+8,24,10);
      ctx.fillStyle='#fbbf24'; ctx.font='bold 9px sans-serif'; ctx.textAlign='center';
      ctx.fillText('AUG',s.px,s.py+3);
      // HUD stars
      ctx.font='18px sans-serif'; ctx.textAlign='left';
      ctx.fillText('⭐'.repeat(s.wanted),8,24);
    };

    const spawnCar = () => {
      const lanes=[80,135,190,245,300];
      const x = lanes[Math.floor(Math.random()*lanes.length)];
      s.cars.push({x, y:-40, vy:2+Math.random()*2, color:['#ef4444','#22c55e','#eab308','#ec4899'][Math.floor(Math.random()*4)]});
    };
    const spawnCoin = () => {
      const x = 70 + Math.random()*(W-140);
      s.coins.push({x, y:-20});
    };
    const spawnCop = () => {
      s.cops.push({x: s.px + (Math.random()*60-30), y:-40, vy:3.2});
    };

    const tick = () => {
      if (!s.running) return;
      s.roadY += 4;
      // player movement
      const spd = 4.5;
      if (keysRef.current.left) s.px = Math.max(58, s.px - spd);
      if (keysRef.current.right) s.px = Math.min(W-58, s.px + spd);
      if (keysRef.current.up) s.py = Math.max(40, s.py - spd*0.8);
      if (keysRef.current.down) s.py = Math.min(H-30, s.py + spd*0.8);

      // spawn
      s.spawnT++; s.coinT++; s.copT++;
      if (s.spawnT > 60) { s.spawnT=0; spawnCar(); }
      if (s.coinT > 80) { s.coinT=0; spawnCoin(); }
      if (s.wanted >= 1 && s.copT > 180-s.wanted*20) { s.copT=0; spawnCop(); }

      // move entities
      s.cars.forEach(c => c.y += c.vy + 2);
      s.coins.forEach(c => c.y += 3);
      s.cops.forEach(c => {
        c.y += c.vy;
        if (c.x < s.px) c.x += 1.5;
        else if (c.x > s.px) c.x -= 1.5;
      });
      s.cars = s.cars.filter(c => c.y < H+50);
      s.coins = s.coins.filter(c => c.y < H+20);
      s.cops = s.cops.filter(c => c.y < H+50);

      // collisions
      s.coins = s.coins.filter(c => {
        if (Math.abs(c.x-s.px) < 20 && Math.abs(c.y-s.py) < 28) {
          s.score += 50; setScore(s.score);
          if (Math.random() < 0.15) { s.wanted = Math.min(5, s.wanted+1); setWanted(s.wanted); }
          return false;
        }
        return true;
      });
      for (const c of s.cars) {
        if (Math.abs(c.x-s.px) < 26 && Math.abs(c.y-s.py) < 42) {
          s.running = false;
          window.dispatchEvent(new CustomEvent('ag_score',{detail:{game:'gta_augusto',score:s.score}}));
          setStatus('over'); return;
        }
      }
      for (const c of s.cops) {
        if (Math.abs(c.x-s.px) < 26 && Math.abs(c.y-s.py) < 42) {
          s.running = false;
          window.dispatchEvent(new CustomEvent('ag_score',{detail:{game:'gta_augusto',score:s.score}}));
          setStatus('busted'); return;
        }
      }
      // passive points
      s.score += 1;
      if (s.score % 10 === 0) setScore(s.score);

      draw();
      rafRef.current = requestAnimationFrame(tick);
    };
    draw();
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status]);

  React.useEffect(() => {
    const kd = e => {
      const m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
      if (m[e.key]) { e.preventDefault(); keysRef.current[m[e.key]]=true; }
    };
    const ku = e => {
      const m={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'};
      if (m[e.key]) keysRef.current[m[e.key]]=false;
    };
    window.addEventListener('keydown',kd);
    window.addEventListener('keyup',ku);
    return () => { window.removeEventListener('keydown',kd); window.removeEventListener('keyup',ku); };
  }, []);

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
      <div style={{display:'flex',alignItems:'center',gap:20}}>
        <span style={{color:'var(--muted)',fontSize:14}}>$ <strong style={{color:'var(--green)',fontSize:18}}>{score}</strong></span>
        <span style={{color:'var(--muted)',fontSize:14}}>Wanted: <strong style={{color:'#fbbf24',fontSize:14}}>{'⭐'.repeat(wanted)||'—'}</strong></span>
        <button style={gBtnStyle} onMouseOver={e=>e.target.style.opacity='0.8'} onMouseOut={e=>e.target.style.opacity='1'} onClick={start}>{status==='idle'?'▶ Jugar':'↺ Reiniciar'}</button>
      </div>
      <div style={{position:'relative'}}>
        <canvas ref={canvasRef} width={W} height={H} style={{borderRadius:12,display:'block',border:'1px solid var(--border)'}}/>
        {status==='idle'&&<div style={gOverlay}><div style={{fontSize:56}}>🚗</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>GTA Augusto</div><div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:'0 20px'}}>Augusto recorre la ciudad recogiendo billetes. ¡Cuidado con la poli!</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>¡Jugar!</button></div>}
        {status==='over'&&<div style={gOverlay}><div style={{fontSize:52}}>💥</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>¡Crash!</div><div style={{color:'var(--green)',fontSize:26,fontWeight:900}}>${score}</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>Reintentar</button></div>}
        {status==='busted'&&<div style={gOverlay}><div style={{fontSize:52}}>🚓</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>BUSTED</div><div style={{color:'var(--green)',fontSize:26,fontWeight:900}}>${score}</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>Reintentar</button></div>}
      </div>
      <div style={{color:'var(--muted)',fontSize:12}}>← → ↑ ↓ o WASD para manejar</div>
    </div>
  );
}

// ===================== MINECRAFT AUGUSTO =====================
function MinecraftAugustoGame() {
  const COLS=16, ROWS=12, CELL=28;
  const BLOCK_TYPES = {
    0: {name:'aire',  color:null,       pts:0},
    1: {name:'césped',color:'#22c55e',  pts:1, top:'#4ade80'},
    2: {name:'tierra',color:'#92400e',  pts:2},
    3: {name:'piedra',color:'#64748b',  pts:3},
    4: {name:'carbón',color:'#27272a',  pts:5, sparkle:'#18181b'},
    5: {name:'oro',   color:'#eab308',  pts:20, sparkle:'#fde047'},
    6: {name:'diamante',color:'#06b6d4',pts:50, sparkle:'#a5f3fc'},
    7: {name:'madera',color:'#78350f',  pts:4, sparkle:'#57290a'},
  };

  const initWorld = () => {
    const w = Array(ROWS).fill(null).map(()=>Array(COLS).fill(0));
    for (let c=0;c<COLS;c++) {
      const h = 4 + Math.floor(Math.random()*2);
      w[h][c] = 1;
      for (let r=h+1;r<ROWS;r++) {
        if (r < h+3) w[r][c] = 2;
        else {
          const rand = Math.random();
          if (rand < 0.04) w[r][c] = 6;
          else if (rand < 0.1) w[r][c] = 5;
          else if (rand < 0.25) w[r][c] = 4;
          else w[r][c] = 3;
        }
      }
    }
    // some trees
    for (let t=0;t<3;t++) {
      const c = 2 + Math.floor(Math.random()*(COLS-4));
      let top = 0; while (top<ROWS && w[top][c]===0) top++;
      if (top>=2) { w[top-1][c]=7; w[top-2][c]=7; }
    }
    return w;
  };

  const [world, setWorld] = React.useState(initWorld);
  const [inventory, setInventory] = React.useState({1:0,2:0,3:0,4:0,5:0,6:0,7:0});
  const [selected, setSelected] = React.useState(2);
  const [mode, setMode] = React.useState('mine');
  const [score, setScore] = React.useState(0);
  const [status, setStatus] = React.useState('idle');

  React.useEffect(() => {
    if (status === 'over' && score > 0) {
      window.dispatchEvent(new CustomEvent('ag_score',{detail:{game:'minecraft_augusto',score}}));
    }
  }, [status]);

  const start = () => {
    setWorld(initWorld());
    setInventory({1:0,2:0,3:0,4:0,5:0,6:0,7:0});
    setSelected(2); setMode('mine'); setScore(0); setStatus('playing');
  };

  const click = (r,c) => {
    if (status!=='playing') return;
    const w = world.map(row=>[...row]);
    if (mode==='mine') {
      const t = w[r][c]; if (!t) return;
      w[r][c] = 0;
      setInventory(inv => ({...inv, [t]:(inv[t]||0)+1}));
      setScore(sc => sc + BLOCK_TYPES[t].pts);
    } else {
      if (w[r][c]!==0) return;
      if ((inventory[selected]||0) <= 0) return;
      w[r][c] = selected;
      setInventory(inv => ({...inv, [selected]:inv[selected]-1}));
    }
    setWorld(w);
  };

  const renderCell = (t) => {
    if (!t) return { bg:'linear-gradient(180deg,#1e3a8a 0%,#60a5fa 100%)', content:null };
    const B = BLOCK_TYPES[t];
    let bg = B.color;
    if (t===1) bg = `linear-gradient(180deg,${B.top} 0%, ${B.top} 20%, ${B.color} 20%)`;
    return { bg, content: B.sparkle ? B.sparkle : null };
  };

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14}}>
      <div style={{display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{color:'var(--muted)',fontSize:14}}>Puntos: <strong style={{color:'var(--green)',fontSize:18}}>{score}</strong></span>
        <div style={{display:'flex',gap:4,background:'var(--surface3)',borderRadius:99,padding:3}}>
          <button onClick={()=>setMode('mine')} style={{
            padding:'5px 14px',borderRadius:99,fontSize:12,fontWeight:700,
            background:mode==='mine'?'var(--purple)':'transparent',color:'#fff',border:'none'
          }}>⛏️ Minar</button>
          <button onClick={()=>setMode('place')} style={{
            padding:'5px 14px',borderRadius:99,fontSize:12,fontWeight:700,
            background:mode==='place'?'var(--cyan)':'transparent',color:'#fff',border:'none'
          }}>🧱 Poner</button>
        </div>
        <button style={gBtnStyle} onClick={start}>{status==='idle'?'▶ Jugar':'↺ Reiniciar'}</button>
      </div>
      <div style={{position:'relative',background:'linear-gradient(180deg,#1e3a8a,#60a5fa)',borderRadius:12,padding:2,border:'1px solid var(--border)'}}>
        <div style={{display:'grid',gridTemplateColumns:`repeat(${COLS},${CELL}px)`,gridAutoRows:`${CELL}px`,gap:0}}>
          {world.flatMap((row,r) => row.map((t,c) => {
            const info = renderCell(t);
            return (
              <div key={`${r}-${c}`} onClick={()=>click(r,c)} style={{
                width:CELL, height:CELL,
                background: t ? info.bg : 'transparent',
                border: t ? '1px solid rgba(0,0,0,0.2)' : '1px solid rgba(255,255,255,0.03)',
                cursor: status==='playing'?'pointer':'default',
                display:'flex',alignItems:'center',justifyContent:'center',
                position:'relative',userSelect:'none',
              }}>
                {t && info.content && <div style={{width:8,height:8,borderRadius:2,background:info.content,boxShadow:`0 0 6px ${info.content}`}}/>}
              </div>
            );
          }))}
        </div>
        {status==='idle'&&<div style={gOverlay}><div style={{fontSize:56}}>⛏️</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>Minecraft Augusto</div><div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:'0 20px'}}>Mina bloques, colecciona recursos y construye</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>¡Jugar!</button></div>}
      </div>
      {/* Inventory / Hotbar */}
      <div style={{display:'flex',gap:6,background:'var(--surface2)',padding:6,borderRadius:12,border:'1px solid var(--border)'}}>
        {[1,2,3,4,5,6,7].map(id => {
          const B = BLOCK_TYPES[id];
          const count = inventory[id]||0;
          const isSel = selected===id;
          return (
            <button key={id} onClick={()=>setSelected(id)} style={{
              width:48,height:48,borderRadius:8,
              background: id===1?`linear-gradient(180deg,${B.top} 0%, ${B.top} 25%, ${B.color} 25%)`:B.color,
              border: `2px solid ${isSel?'#fff':'rgba(0,0,0,0.3)'}`,
              position:'relative',cursor:'pointer',
              boxShadow: isSel?'0 0 12px rgba(255,255,255,0.5)':'none',
            }} title={B.name}>
              {B.sparkle && <div style={{position:'absolute',top:8,left:8,width:10,height:10,borderRadius:2,background:B.sparkle,boxShadow:`0 0 6px ${B.sparkle}`}}/>}
              <div style={{position:'absolute',bottom:-2,right:2,fontSize:11,fontWeight:900,color:'#fff',textShadow:'0 1px 3px #000'}}>{count}</div>
            </button>
          );
        })}
      </div>
      <div style={{color:'var(--muted)',fontSize:12}}>Click en un bloque para minarlo · Selecciona un bloque del inventario para colocarlo</div>
    </div>
  );
}

// ===================== WWE AUGUSTO =====================
function WWEAugustoGame() {
  const [pHP, setPHP] = React.useState(100);
  const [eHP, setEHP] = React.useState(100);
  const [round, setRound] = React.useState(1);
  const [status, setStatus] = React.useState('idle');
  const [log, setLog] = React.useState([]);
  const [cooldown, setCooldown] = React.useState(false);
  const [pAnim, setPAnim] = React.useState(null);
  const [eAnim, setEAnim] = React.useState(null);
  const [finisher, setFinisher] = React.useState(0);

  const OPPONENTS = [
    {name:'El Matón',emoji:'🤼',color:'#ef4444',atk:[8,14]},
    {name:'Rocky Stone',emoji:'🗿',color:'#78716c',atk:[10,16]},
    {name:'Trueno',emoji:'⚡',color:'#eab308',atk:[12,20]},
  ];
  const oppIdx = Math.min(round-1, OPPONENTS.length-1);
  const opp = OPPONENTS[oppIdx];

  React.useEffect(() => {
    if (status==='won'||status==='lost') {
      const total = (round-1)*150 + (status==='won'?200:0) + pHP;
      if (total > 0) window.dispatchEvent(new CustomEvent('ag_score',{detail:{game:'wwe_augusto',score:total}}));
    }
  }, [status]);

  const start = () => {
    setPHP(100); setEHP(100); setRound(1); setStatus('playing');
    setLog(['¡Ding ding ding! Augusto entra al ring']);
    setFinisher(0);
  };

  const addLog = (msg) => setLog(l => [msg, ...l].slice(0,5));

  const enemyAttack = (p) => {
    setCooldown(true);
    setTimeout(() => {
      setEAnim('attack');
      const dmg = opp.atk[0] + Math.floor(Math.random()*(opp.atk[1]-opp.atk[0]+1));
      setTimeout(() => {
        setEAnim(null);
        setPAnim('hit');
        setPHP(h => {
          const nh = Math.max(0, h-dmg);
          if (nh===0) setStatus('lost');
          return nh;
        });
        addLog(`${opp.name} golpea a Augusto (-${dmg})`);
        setTimeout(() => { setPAnim(null); setCooldown(false); }, 300);
      }, 400);
    }, 500);
  };

  const attack = (type) => {
    if (status!=='playing' || cooldown) return;
    setCooldown(true);
    setPAnim('attack');

    let dmg=0, cost=0, label='';
    if (type==='punch')   { dmg = 8+Math.floor(Math.random()*6);  label='🥊 Puñetazo'; cost=0; }
    if (type==='kick')    { dmg = 12+Math.floor(Math.random()*8); label='🦵 Patada voladora'; cost=0; }
    if (type==='slam')    { dmg = 16+Math.floor(Math.random()*10);label='💥 Body Slam'; cost=0; }
    if (type==='finisher'){ dmg = 40+Math.floor(Math.random()*15);label='🔥 AUGUSTO STUNNER'; cost=100; }

    setTimeout(() => {
      setPAnim(null);
      setEAnim('hit');
      const newHP = Math.max(0, eHP - dmg);
      setEHP(newHP);
      setFinisher(f => Math.min(100, type==='finisher'?0:f + 20));
      addLog(`Augusto — ${label} (-${dmg})`);

      if (newHP === 0) {
        addLog(`¡${opp.name} cae K.O.!`);
        setTimeout(() => setEAnim(null), 400);
        if (round >= OPPONENTS.length) {
          setStatus('won');
          setCooldown(false);
        } else {
          setTimeout(() => {
            setRound(r => r+1);
            setEHP(100);
            setCooldown(false);
          }, 1200);
        }
      } else {
        setTimeout(() => {
          setEAnim(null);
          enemyAttack();
        }, 400);
      }
    }, 350);
  };

  const fighterStyle = (isP, anim) => ({
    width:100,height:140,borderRadius:12,
    display:'flex',alignItems:'center',justifyContent:'center',
    fontSize:70,position:'relative',
    transition:'transform 0.18s',
    transform: anim==='attack' ? (isP?'translateX(30px) scale(1.1)':'translateX(-30px) scale(1.1)')
             : anim==='hit'    ? (isP?'translateX(-10px)':'translateX(10px)') + ' rotate(' + (isP?-5:5) + 'deg)'
             : 'translateX(0)',
    filter: anim==='hit' ? 'brightness(1.6) hue-rotate(-30deg)' : 'none',
  });

  const Bar = ({val,color,label}) => (
    <div style={{flex:1,minWidth:120}}>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,fontWeight:700,marginBottom:3}}>
        <span>{label}</span><span>{val}/100</span>
      </div>
      <div style={{height:12,background:'var(--surface3)',borderRadius:99,overflow:'hidden',border:'1px solid var(--border)'}}>
        <div style={{width:`${val}%`,height:'100%',background:color,transition:'width 0.3s',boxShadow:`0 0 8px ${color}`}}/>
      </div>
    </div>
  );

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:14,minWidth:420}}>
      <div style={{display:'flex',alignItems:'center',gap:16,width:'100%',maxWidth:500}}>
        <Bar val={pHP} color="#22c55e" label="🧔 AUGUSTO"/>
        <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:14,color:'var(--orange)',whiteSpace:'nowrap'}}>RD {round}/{OPPONENTS.length}</div>
        <Bar val={eHP} color={opp.color} label={`${opp.emoji} ${opp.name}`}/>
      </div>
      {/* Finisher meter */}
      <div style={{width:'100%',maxWidth:500,display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:11,fontWeight:800,color:'var(--muted)',letterSpacing:'0.08em'}}>FINISHER</span>
        <div style={{flex:1,height:8,background:'var(--surface3)',borderRadius:99,overflow:'hidden'}}>
          <div style={{width:`${finisher}%`,height:'100%',background:'linear-gradient(90deg,#f59e0b,#ef4444)',transition:'width 0.25s',boxShadow:finisher>=100?'0 0 14px #f59e0b':'none'}}/>
        </div>
        <span style={{fontSize:11,fontWeight:800,color:finisher>=100?'#f59e0b':'var(--muted)'}}>{finisher}%</span>
      </div>
      {/* Ring */}
      <div style={{position:'relative',width:'100%',maxWidth:500,height:220,
        background:'linear-gradient(180deg,#1e1b4b 0%,#312e81 60%,#4c1d95 100%)',
        borderRadius:14,border:'4px solid #7c3aed',overflow:'hidden',
        display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 40px'}}>
        {/* ring ropes */}
        <div style={{position:'absolute',top:16,left:0,right:0,height:2,background:'#facc15',opacity:0.5}}/>
        <div style={{position:'absolute',top:40,left:0,right:0,height:2,background:'#ef4444',opacity:0.5}}/>
        <div style={{position:'absolute',top:64,left:0,right:0,height:2,background:'#22c55e',opacity:0.5}}/>
        <div style={{position:'absolute',bottom:0,left:0,right:0,height:30,background:'#18181b',borderTop:'2px solid #facc15'}}/>
        {/* player */}
        <div style={fighterStyle(true,pAnim)}>🧔</div>
        {/* VS */}
        <div style={{fontFamily:'var(--font-display)',fontWeight:900,fontSize:28,color:'#facc15',textShadow:'0 0 16px #f59e0b',zIndex:1}}>VS</div>
        {/* enemy */}
        <div style={fighterStyle(false,eAnim)}>{opp.emoji}</div>
        {status==='idle'&&<div style={gOverlay}><div style={{fontSize:56}}>🤼</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>WWE Augusto</div><div style={{color:'var(--muted)',fontSize:13,textAlign:'center',padding:'0 20px'}}>Derrota a todos los luchadores en el ring</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>¡Al ring!</button></div>}
        {status==='won'&&<div style={gOverlay}><div style={{fontSize:52}}>🏆</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>¡CAMPEÓN!</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>Defender título</button></div>}
        {status==='lost'&&<div style={gOverlay}><div style={{fontSize:52}}>😵</div><div style={{fontFamily:'var(--font-display)',fontSize:22,fontWeight:900}}>K.O.</div><button style={{...gBtnStyle,marginTop:8}} onClick={start}>Revancha</button></div>}
      </div>
      {/* Actions */}
      <div style={{display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center'}}>
        <button disabled={cooldown||status!=='playing'} onClick={()=>attack('punch')} style={{...gBtnStyle,opacity:cooldown||status!=='playing'?0.5:1}}>🥊 Puño</button>
        <button disabled={cooldown||status!=='playing'} onClick={()=>attack('kick')} style={{...gBtnStyle,background:'var(--cyan)',color:'#000',opacity:cooldown||status!=='playing'?0.5:1}}>🦵 Patada</button>
        <button disabled={cooldown||status!=='playing'} onClick={()=>attack('slam')} style={{...gBtnStyle,background:'var(--orange)',color:'#000',opacity:cooldown||status!=='playing'?0.5:1}}>💥 Slam</button>
        <button disabled={cooldown||status!=='playing'||finisher<100} onClick={()=>attack('finisher')} style={{...gBtnStyle,background:'linear-gradient(90deg,#f59e0b,#ef4444)',opacity:cooldown||status!=='playing'||finisher<100?0.4:1}}>🔥 Stunner</button>
      </div>
      {/* Log */}
      <div style={{width:'100%',maxWidth:500,background:'var(--surface2)',borderRadius:10,padding:'8px 12px',border:'1px solid var(--border)',fontSize:12,minHeight:60}}>
        {log.map((l,i) => (
          <div key={i} style={{color:i===0?'var(--text)':'var(--muted)',marginBottom:2,opacity:1-i*0.15}}>{l}</div>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { GTAAugustoGame, MinecraftAugustoGame, WWEAugustoGame });
