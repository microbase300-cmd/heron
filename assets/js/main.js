(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const loader = document.querySelector('.loader');
  window.addEventListener('load', () => setTimeout(() => loader?.classList.add('hide'), reduce ? 120 : 900));

  // reveal-on-scroll
  const items = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), {threshold:.12});
    items.forEach(i => io.observe(i));
  } else items.forEach(i => i.classList.add('in'));

  // cursor + data-reactive tilt
  if (!reduce && matchMedia('(pointer:fine)').matches) {
    const c = document.querySelector('.cursor'), d = document.querySelector('.cursor-dot');
    let x=innerWidth/2,y=innerHeight/2, tx=x,ty=y;
    addEventListener('pointermove', e => {tx=e.clientX;ty=e.clientY;});
    const tick=()=>{x+=(tx-x)*.18;y+=(ty-y)*.18;c&&(c.style.left=x+'px',c.style.top=y+'px');d&&(d.style.left=tx+'px',d.style.top=ty+'px');requestAnimationFrame(tick)}; tick();
    document.querySelectorAll('[data-tilt]').forEach(el=>{
      el.addEventListener('pointermove',e=>{const r=el.getBoundingClientRect();const rx=((e.clientY-r.top)/r.height-.5)*-4;const ry=((e.clientX-r.left)/r.width-.5)*4;el.style.transform=`perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`});
      el.addEventListener('pointerleave',()=>el.style.transform='');
    });
  }

  // Mobile app dialog — delegated events + explicit hidden state for reliable open/close.
  const appDialog = document.getElementById('app-dialog');
  if (appDialog) {
    const setAppDialog = (open) => {
      appDialog.hidden = !open;
      appDialog.setAttribute('aria-hidden', String(!open));
      document.body.classList.toggle('app-dialog-open', open);
      if (open) document.querySelector('[data-close-app]')?.focus();
    };
    document.addEventListener('click', (event) => {
      const openButton = event.target.closest?.('[data-app]');
      const closeButton = event.target.closest?.('[data-close-app]');
      if (openButton) { event.preventDefault(); setAppDialog(true); return; }
      if (closeButton) { event.preventDefault(); setAppDialog(false); return; }
      if (event.target === appDialog) setAppDialog(false);
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !appDialog.hidden) setAppDialog(false);
    });
    setAppDialog(false);

    // Show the mobile-app announcement once per browser session, while keeping
    // the footer trigger available on every page. It remains fully dismissible.
    try {
      const key = 'heron_mobile_prompt_seen_v1';
      if (!sessionStorage.getItem(key)) {
        setTimeout(() => {
          if (appDialog.hidden) {
            sessionStorage.setItem(key, '1');
            setAppDialog(true);
          }
        }, 1400);
      }
    } catch (_) {
      setTimeout(() => { if (appDialog.hidden) setAppDialog(true); }, 1400);
    }
  }

  // mobile nav
  const menuBtn = document.querySelector('[data-menu]');
  const nav = document.querySelector('.navlinks');
  if(menuBtn && nav){menuBtn.addEventListener('click',()=>nav.classList.toggle('open'));}

  // live market feed (Binance public API)
  const marketRoot = document.querySelector('[data-market]');
  if (marketRoot && window.React && window.ReactDOM) {
    const {createElement:h,useEffect,useMemo,useState} = React;
    const symbols = ['BTCUSDT','ETHUSDT','BNBUSDT','SOLUSDT','XRPUSDT','ADAUSDT','DOGEUSDT','AVAXUSDT'];
    const names = {BTCUSDT:'Bitcoin',ETHUSDT:'Ethereum',BNBUSDT:'BNB',SOLUSDT:'Solana',XRPUSDT:'XRP',ADAUSDT:'Cardano',DOGEUSDT:'Dogecoin',AVAXUSDT:'Avalanche'};
    const short = {BTCUSDT:'BTC',ETHUSDT:'ETH',BNBUSDT:'BNB',SOLUSDT:'SOL',XRPUSDT:'XRP',ADAUSDT:'ADA',DOGEUSDT:'DOGE',AVAXUSDT:'AVAX'};
    function App(){
      const [rows,setRows]=useState([]); const [status,setStatus]=useState('Loading market feed…');
      const load=async()=>{try{const r=await fetch('https://api.binance.com/api/v3/ticker/24hr'); if(!r.ok) throw Error('bad response'); const all=await r.json(); const map=new Map(all.filter(x=>symbols.includes(x.symbol)).map(x=>[x.symbol,x])); setRows(symbols.map(s=>map.get(s)).filter(Boolean)); setStatus('Live • refreshed every 15 seconds');}catch(e){setStatus('Market feed unavailable — retrying')}};
      useEffect(()=>{load();const id=setInterval(load,15000);return()=>clearInterval(id)},[]);
      return h('div',{className:'market-list'}, rows.length?rows.map(x=>h('div',{className:'ticker',key:x.symbol},
        h('div',{className:'coin'},h('div',{className:'coin-dot'},short[x.symbol][0]),h('div',null,h('strong',null,short[x.symbol]),h('div',{className:'market-note'},names[x.symbol]))),
        h('div',{className:'ticker-price'},'$'+Number(x.lastPrice).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:6})),
        h('div',{className:x.priceChangePercent>=0?'up':'down'},(x.priceChangePercent>=0?'+':'')+Number(x.priceChangePercent).toFixed(2)+'%'),
        h('div',{className:'market-note ticker-meta'},'Vol '+Number(x.quoteVolume).toLocaleString(undefined,{notation:'compact',maximumFractionDigits:1}))
      )):h('div',{className:'market-note'},'Connecting to public market data…'), h('div',{className:'market-note',style:{marginTop:'16px'}},status));
    }
    ReactDOM.createRoot(marketRoot).render(h(App));
  }

  // Three.js hero: lightweight wireframe orbit / sphere, no build step.
  const canvas = document.getElementById('viz');
  if(canvas && window.THREE && !reduce){
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,100); camera.position.z=7;
    const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'}); renderer.setPixelRatio(Math.min(devicePixelRatio,1.6)); renderer.setSize(innerWidth,innerHeight);
    const group=new THREE.Group(); scene.add(group);
    const geo=new THREE.IcosahedronGeometry(2,5); const mat=new THREE.MeshBasicMaterial({color:0xd6a84f,wireframe:true,transparent:true,opacity:.24}); const mesh=new THREE.Mesh(geo,mat); group.add(mesh);
    const ringMat=new THREE.MeshBasicMaterial({color:0xffffff,wireframe:true,transparent:true,opacity:.08});
    [1.4,2.4,3.1].forEach((r,i)=>{const tor=new THREE.Mesh(new THREE.TorusGeometry(r,.007,8,180),ringMat);tor.rotation.x=(i*.6)+.4;tor.rotation.y=i*.35;group.add(tor)});
    const pointsGeo=new THREE.BufferGeometry(); const pts=[]; for(let i=0;i<850;i++){const a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1), r=2.55+Math.random()*1.4;pts.push(r*Math.sin(b)*Math.cos(a),r*Math.sin(b)*Math.sin(a),r*Math.cos(b));}
    pointsGeo.setAttribute('position',new THREE.Float32BufferAttribute(pts,3)); const pm=new THREE.PointsMaterial({color:0xe7cf9d,size:.018,transparent:true,opacity:.5}); group.add(new THREE.Points(pointsGeo,pm));
    let mx=0,my=0; addEventListener('pointermove',e=>{mx=(e.clientX/innerWidth-.5)*.35;my=(e.clientY/innerHeight-.5)*.22});
    const clock=new THREE.Clock(); function frame(){const t=clock.getElapsedTime(); group.rotation.y=t*.06+mx;group.rotation.x=t*.025+my;mesh.rotation.z=t*.08;renderer.render(scene,camera);requestAnimationFrame(frame)} frame();
    addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
  }

  // Interactive Profit & Yield Simulator Engine
  const calcAmountInput = document.getElementById('calc-amount-input');
  const calcAmountSlider = document.getElementById('calc-amount-slider');
  const resPlanName = document.getElementById('res-plan-name');
  const resPlanBadge = document.getElementById('res-plan-badge');
  const resPrincipal = document.getElementById('res-principal');
  const resProfit = document.getElementById('res-profit');
  const resTotal = document.getElementById('res-total');
  const resReferral = document.getElementById('res-referral');
  const resDurationText = document.getElementById('res-duration-text');
  const calcInvestBtn = document.getElementById('calc-invest-btn');
  const presetBtns = document.querySelectorAll('.calc-preset-btn');
  const planCards = document.querySelectorAll('[data-plan]');

  const plansConfig = [
    {
      id: 'amateur',
      name: 'Amateur Plan',
      min: 100,
      max: 1999,
      hours: 24,
      rate: 0.045,
      rateStr: '4.5%',
      referralRate: 0.08,
      referralStr: '8%'
    },
    {
      id: 'standard',
      name: 'Standard Plan',
      min: 2000,
      max: 5999,
      hours: 48,
      rate: 0.095,
      rateStr: '9.5%',
      referralRate: 0.16,
      referralStr: '16%'
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      min: 6000,
      max: 10999,
      hours: 72,
      rate: 0.155,
      rateStr: '15.5%',
      referralRate: 0.24,
      referralStr: '24%'
    },
    {
      id: 'retirement',
      name: 'Retirement Plan',
      min: 11000,
      max: Infinity,
      hours: 96,
      rate: 0.225,
      rateStr: '22.5%',
      referralRate: 0.30,
      referralStr: '30%'
    }
  ];

  if (calcAmountInput && calcAmountSlider) {
    function formatCurrency(val) {
      return '$' + Number(val).toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    }

    function updateCalculator(amountVal, triggerSource) {
      let amount = parseFloat(amountVal);
      if (isNaN(amount) || amount < 0) amount = 100;

      // Sync slider if input triggered
      if (triggerSource !== 'slider') {
        calcAmountSlider.value = Math.min(amount, 50000);
      }
      if (triggerSource !== 'input') {
        calcAmountInput.value = amount;
      }

      // Determine matching tier
      let selectedPlan = plansConfig[0];
      for (const p of plansConfig) {
        if (amount >= p.min) {
          selectedPlan = p;
        }
      }

      // Calculate yields
      const profit = amount * selectedPlan.rate;
      const total = amount + profit;
      const referralEarn = amount * selectedPlan.referralRate;

      // Update Result Elements
      if (resPlanName) resPlanName.textContent = selectedPlan.name;
      if (resPlanBadge) resPlanBadge.textContent = `${selectedPlan.hours} Hours • ${selectedPlan.rateStr}`;
      if (resPrincipal) resPrincipal.textContent = formatCurrency(amount);
      if (resProfit) resProfit.textContent = `+${formatCurrency(profit)}`;
      if (resTotal) resTotal.textContent = formatCurrency(total);
      if (resReferral) resReferral.textContent = `${formatCurrency(referralEarn)} (${selectedPlan.referralStr})`;
      if (resDurationText) resDurationText.textContent = `${selectedPlan.hours} hours (${selectedPlan.rateStr} net return)`;
      if (calcInvestBtn) {
        calcInvestBtn.textContent = `Invest with ${formatCurrency(amount)} ↗`;
        calcInvestBtn.href = `contact.html?plan=${selectedPlan.id}&amount=${amount}`;
      }

      // Highlight active plan card in the 4-tier grid
      planCards.forEach(card => {
        if (card.getAttribute('data-plan') === selectedPlan.id) {
          card.classList.add('active-calc');
        } else {
          card.classList.remove('active-calc');
        }
      });

      // Update preset buttons active state
      presetBtns.forEach(btn => {
        if (parseFloat(btn.getAttribute('data-val')) === amount) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }

    calcAmountInput.addEventListener('input', (e) => {
      updateCalculator(e.target.value, 'input');
    });

    calcAmountSlider.addEventListener('input', (e) => {
      updateCalculator(e.target.value, 'slider');
    });

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = parseFloat(btn.getAttribute('data-val'));
        updateCalculator(val, 'preset');
      });
    });

    // Plan card direct buttons
    document.querySelectorAll('[data-select-plan]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const planId = btn.getAttribute('data-select-plan');
        const plan = plansConfig.find(p => p.id === planId);
        if (plan) {
          updateCalculator(plan.min, 'plan_select');
        }
      });
    });

    // Initial run
    updateCalculator(parseFloat(calcAmountInput.value) || 3500, 'init');
  }
})();
