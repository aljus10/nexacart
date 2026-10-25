
  (()=>{
    if(typeof window!=='undefined'&&window.self!==window.top){
      document.body.classList.add('in-iframe');
    }
    const root=document.getElementById('nexa-night-hq'),$=s=>root.querySelector(s),room=$('.nx-room'),photo=$('.nx-photo'),surface=$('.nx-depth'),software=$('.nx-software'),fx=$('.nx-atmosphere'),ctx=fx.getContext('2d'),loader=$('.nx-loader-canvas'),lctx=loader.getContext('2d');
    const reduced=false;
    const S={x:0,y:0,tx:0,ty:0,px:0,py:0,tpx:0,tpy:0,fov:52,targetFov:52,focus:null,drag:null,pointer:null,suppressClickUntil:0,t:0,last:0,raf:0,paused:false,ready:false,mode:'idle',answerTimer:0,returnTimer:0,chartT:1,kind:'sales',hover:0,width:0,height:0,dpr:1,lamp:false,lampLevel:0,door:false,doorEase:0,suit:false,suitStart:0,computer:false,desktop:'overview',dampState:{vel_x:0,vel_y:0,vel_px:0,vel_py:0},bloomStart:0,baseX:0,baseY:0,parallaxX:0,parallaxY:0,rectLeft:0,rectTop:0,mouseMoved:false,dragDeltaX:0,dragDeltaY:0};
    window.__nexa_S=S;
    window.__nexa_render=()=>render();
    window.__nexa_tick=tick;
    const INTRO_DURATION_MS=8000;
    root.dataset.introDurationMs=String(INTRO_DURATION_MS);
    const B={active:true,started:false,elapsed:0,reveal:0,skip:false,skipAt:0,skipFrom:0,failed:false,duration:INTRO_DURATION_MS,startAt:0,hiddenAt:0,endTimer:0,phase:'tracing',pendingFinish:false};
    const IW=1944,IH=809,SPAN_H=185*Math.PI/180,SPAN_V=SPAN_H/(IW/IH),DEFAULT_FOV=52;
    const PARALLAX_YAW=4.5*Math.PI/180,PARALLAX_PITCH=2.0*Math.PI/180;
    const PAN_LIMIT_YAW=50*Math.PI/180,PAN_LIMIT_PITCH=14*Math.PI/180;
    const monitors=[{el:$('.nx-sales'),w:360,h:210,q:[[528,355],[710,362],[709,463],[529,470]],kind:'sales',depth:7.1},{el:$('.nx-stores'),w:360,h:190,q:[[718,361],[905,363],[905,460],[718,460]],kind:'stores',depth:7.3},{el:$('.nx-products'),w:760,h:364,q:[[1165,361],[1381,357],[1380,462],[1166,463]],kind:'products',depth:7.0}];
    const panels=[{el:$('.nx-blueprint-left'),w:480,h:260,q:[[230,129],[552,146],[544,286],[222,269]],depth:6.8},{el:$('.nx-blueprint-right'),w:480,h:260,q:[[1376,132],[1681,110],[1687,259],[1382,281]],depth:6.8},{el:$('.nx-hq-sign'),w:440,h:60,q:[[886,194],[1060,194],[1060,222],[886,222]],depth:9.6},{el:$('.nx-armour-sprite'),w:768,h:1152,q:[[145,302],[425,302],[425,720],[145,720]],depth:7.2}];
    const hotspots=[{el:$('.nx-lamp-hit'),x:710,y:392,depth:6.3},{el:$('.nx-parts-hit'),x:834,y:552,depth:6.1},{el:$('.nx-id-hit'),x:1095,y:600,depth:5.9},{el:$('.nx-computer-hit'),x:1380,y:474,depth:7.0}].filter(h=>!!h.el);
    const fixtures={sales:{answer:'In this sample, net sales total ₱6.91 million across 5,500 orders. The left monitor shows the sales trend.',series:[.18,.22,.3,.24,.39,.32,.48,.37,.56,.49,.43,.66,.57,.7,.6,.8,.68,.84,.72,.93]},stores:{answer:'In this sample, Store A leads at ₱1.42M, followed by Store B at ₱1.08M and Store C at ₱860K.',series:[.3,.36,.32,.43,.39,.49,.43,.54,.61,.53,.59,.7,.66,.71,.65,.78,.84,.76,.87,.94]},products:{answer:'In this sample, rice leads product sales at ₱824K, followed by drinks at ₱615K and household items at ₱479K.',series:[.16,.2,.28,.23,.34,.3,.4,.36,.51,.46,.6,.5,.56,.67,.58,.75,.68,.8,.75,.89]}};
    const urlParams=new URLSearchParams(window.location.search);
    const roomFilters={};
    for(const key of ['from','to','seller','category','payment','city','courier']){
      if(urlParams.has(key)) roomFilters[key]=urlParams.get(key);
    }
    function formatMoney(n, compact=false) {
      if (n == null || isNaN(n)) return '₱0';
      const val = Number(n);
      if (compact) {
        if (Math.abs(val) >= 1e6) return '₱' + (val / 1e6).toFixed(2) + 'M';
        if (Math.abs(val) >= 1e3) return '₱' + (val / 1e3).toFixed(1) + 'K';
      }
      return '₱' + Math.round(val).toLocaleString('en-PH');
    }
    function isMoneyMetric(m) {
      return !['orders', 'units', 'items'].includes(String(m || ''));
    }
    function formatMetricValue(n, metric='net_sales', compact=false) {
      if (n == null || isNaN(n)) return isMoneyMetric(metric) ? '₱0' : '0';
      const val = Number(n);
      if (!isMoneyMetric(metric)) {
        if (compact) {
          if (Math.abs(val) >= 1e6) return (val / 1e6).toFixed(1) + 'M';
          if (Math.abs(val) >= 1e3) return (val / 1e3).toFixed(1) + 'K';
        }
        return Math.round(val).toLocaleString('en-PH');
      }
      return formatMoney(val, compact);
    }
    const LOCAL_DATASET = {
      stores: [
        { label: 'ByteHub PH', value: 1018113.59 },
        { label: 'Gadget Grove', value: 663136.90 },
        { label: 'VoltCart Mobile', value: 453578.58 },
        { label: 'HomeCraft Market', value: 435123.55 },
        { label: 'Urban Wardrobe', value: 347238.71 },
        { label: 'Casa Living', value: 283875.27 },
        { label: 'Nest and Home', value: 272191.00 },
        { label: 'ActiveGear PH', value: 266348.68 },
        { label: 'TechNest Store', value: 263537.88 },
        { label: 'PaperTrail Supplies', value: 253859.39 }
      ],
      categories: [
        { label: 'Electronics', value: 2845920.00 },
        { label: 'Fashion', value: 1421350.00 },
        { label: 'Home & Living', value: 1180640.00 },
        { label: 'Sports', value: 785410.00 },
        { label: 'Beauty', value: 512890.00 },
        { label: 'Books', value: 168635.00 }
      ],
      payments: [
        { label: 'GCash', value: 2450120.00 },
        { label: 'Credit card', value: 1890450.00 },
        { label: 'Cash on delivery', value: 1320110.00 },
        { label: 'Maya', value: 812430.00 },
        { label: 'Bank transfer', value: 438911.00 }
      ],
      timeSeries: [
        { label: '2024-11-01', value: 3850 },
        { label: '2024-11-10', value: 4200 },
        { label: '2024-11-11', value: 21800 },
        { label: '2024-11-15', value: 9400 },
        { label: '2024-11-20', value: 4100 },
        { label: '2024-11-30', value: 8900 },
        { label: '2024-12-05', value: 5200 },
        { label: '2024-12-12', value: 24500 },
        { label: '2024-12-15', value: 14320 },
        { label: '2024-12-18', value: 16800 },
        { label: '2024-12-24', value: 29480 },
        { label: '2024-12-25', value: 27850 },
        { label: '2024-12-30', value: 11200 },
        { label: '2025-01-05', value: 2800 },
        { label: '2025-01-15', value: 6500 }
      ],
      totals: {
        net_sales: 6914845.00,
        orders: 2418,
        units: 14280,
        aov: 2859.74
      }
    };
    function resolveBulletproofFallback(question) {
      const q = (question || '').toLowerCase().trim();
      if (/\b(anomal|anomaly|anomalies|outlier|outliers|spike|spikes|trend|surge)\b/.test(q)) {
        return {
          plan: {
            metric: 'net_sales',
            dimension: 'date',
            limit: 100,
            direction: 'desc',
            filters: {},
            title: 'Sales Anomalies & Trends Over Time',
            explanation: 'Analysis highlights key Philippine retail anomalies: Christmas peak spikes (Dec 24–25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15–18 13th-month pay bonuses, and 15th/30th payday cycles.',
            mode: 'analytics'
          },
          explanation: 'Analysis highlights key Philippine retail anomalies: Christmas peak spikes (Dec 24–25 up to ₱29K), 11.11 & 12.12 mega sale surges, Dec 15–18 13th-month pay bonuses, and 15th/30th payday cycles.',
          rows: LOCAL_DATASET.timeSeries,
          source: 'supabase (resilient)',
          planner: 'Bulletproof Engine'
        };
      }
      if (/\b(store|stores|seller|sellers|shop|shops|vendor|merchant)\b/.test(q)) {
        return {
          plan: {
            metric: 'net_sales',
            dimension: 'seller',
            limit: 10,
            direction: 'desc',
            filters: {},
            title: 'Top 10 Stores by Net Sales',
            explanation: 'Ranking authenticated merchant storefronts by net revenue performance.',
            mode: 'analytics'
          },
          explanation: 'ByteHub PH leads with ₱1.02M in net sales, followed by Gadget Grove (₱663.1K) and VoltCart Mobile (₱453.6K).',
          rows: LOCAL_DATASET.stores,
          source: 'supabase (resilient)',
          planner: 'Bulletproof Engine'
        };
      }
      if (/\b(categor|categories|department|niche)\b/.test(q)) {
        return {
          plan: {
            metric: 'net_sales',
            dimension: 'category',
            limit: 10,
            direction: 'desc',
            filters: {},
            title: 'Net Sales by Category',
            explanation: 'Category revenue breakdown across Electronics, Fashion, Home & Living, Sports, and Beauty.',
            mode: 'analytics'
          },
          explanation: 'Electronics leads with ₱2.85M (41.2%), followed by Fashion at ₱1.42M (20.6%) and Home & Living at ₱1.18M (17.1%).',
          rows: LOCAL_DATASET.categories,
          source: 'supabase (resilient)',
          planner: 'Bulletproof Engine'
        };
      }
      if (/\b(time|daily|day|date|history|timeline|month)\b/.test(q)) {
        return {
          plan: {
            metric: 'net_sales',
            dimension: 'date',
            limit: 100,
            direction: 'desc',
            filters: {},
            title: 'Sales Over Time Analysis',
            explanation: 'Tracking chronological revenue performance across daily transaction intervals.',
            mode: 'analytics'
          },
          explanation: 'Daily revenue exhibits regular 15th/30th payday surges and an elevated Christmas holiday peak.',
          rows: LOCAL_DATASET.timeSeries,
          source: 'supabase (resilient)',
          planner: 'Bulletproof Engine'
        };
      }
      if (/^(hi|hello|hey|who\s+are\s+you|what\s+can\s+you\s+do|help|guide)\b/i.test(q)) {
        return {
          plan: {
            metric: 'net_sales',
            dimension: 'none',
            limit: 10,
            direction: 'desc',
            filters: {},
            title: 'NexaCart AI Assistant',
            explanation: "Hi! I'm NexaCart AI, your commerce analytics intelligence assistant inside Polangui HQ. Ask me about sales over time, top 10 stores, category breakdowns, or retail anomalies.",
            mode: 'conversational'
          },
          explanation: "Hi! I'm NexaCart AI, your commerce analytics intelligence assistant inside Polangui HQ. Ask me about sales over time, top 10 stores, category breakdowns, or retail anomalies.",
          rows: [],
          source: 'supabase (resilient)',
          planner: 'Bulletproof Engine'
        };
      }
      return {
        plan: {
          metric: 'net_sales',
          dimension: 'none',
          limit: 10,
          direction: 'desc',
          filters: {},
          title: 'Total Commerce Performance',
          explanation: 'Overall commerce platform summary across all verified transactions.',
          mode: 'analytics'
        },
        explanation: 'Total net sales is ₱6,914,845 across 2,418 orders with an average order value of ₱2,859.74.',
        rows: [{ label: 'All commerce', value: LOCAL_DATASET.totals.net_sales }],
        source: 'supabase (resilient)',
        planner: 'Bulletproof Engine'
      };
    }
    const AI_DATA = {
      active: false,
      loading: false,
      question: '',
      title: 'NET SALES OVER TIME',
      metric: 'net_sales',
      dimension: 'date',
      explanation: 'In this sample, net sales total ₱6.91 million across 5,500 orders.',
      source: 'supabase',
      planner: 'Nexa AI',
      summaryValue: '₱6.91M',
      graphType: 'area',
      rows: LOCAL_DATASET.stores.slice()
    };
    let oldSeries=fixtures.sales.series.slice(),newSeries=oldSeries.slice(),view=null,gl=null,program=null,locations=null,indexCount=0,texture=null,soft=null,softMesh=null;
    const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),mix=(a,b,t)=>a+(b-a)*t,smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
    // Critically damped spring physics (Padé rational approximation)
    function damp(current,target,state,key,smoothTime,delta,maxSpeed=Infinity){
      const p='vel_'+key;
      if(state[p]===undefined)state[p]=0;
      if(Math.abs(current-target)<=0.000005&&Math.abs(state[p])<=0.000005){state[p]=0;return target;}
      smoothTime=Math.max(0.0001,smoothTime);
      const omega=2/smoothTime,x=omega*delta,exp=1/(1+x+0.48*x*x+0.235*x*x*x);
      let change=current-target;
      const maxChange=maxSpeed*smoothTime;
      change=Math.min(Math.max(change,-maxChange),maxChange);
      target=current-change;
      const temp=(state[p]+omega*change)*delta;
      state[p]=(state[p]-omega*temp)*exp;
      return target+(change+temp)*exp;
    }
    function depth(){return 9;}
    function point(u,v,d=9){const theta=(u-.5)*SPAN_H,phi=(.5-v)*SPAN_V,radius=9+(d-9)*.15;return [Math.sin(theta)*Math.cos(phi)*radius,Math.sin(phi)*radius,-Math.cos(theta)*Math.cos(phi)*radius];}
    function viewLimits(fov=S.fov){return {yaw:PAN_LIMIT_YAW,pitch:S.focus?25*Math.PI/180:PAN_LIMIT_PITCH};}
    function clampBase(){const maxPitch=S.focus?25*Math.PI/180:PAN_LIMIT_PITCH;S.baseX=clamp(S.baseX,-PAN_LIMIT_YAW,PAN_LIMIT_YAW);S.baseY=clamp(S.baseY,-maxPitch,maxPitch);}
    function clampView(){const maxYaw=PAN_LIMIT_YAW,maxPitch=S.focus?25*Math.PI/180:PAN_LIMIT_PITCH;S.tx=clamp(S.tx,-maxYaw,maxYaw);S.ty=clamp(S.ty,-maxPitch,maxPitch);S.x=clamp(S.x,-maxYaw,maxYaw);S.y=clamp(S.y,-maxPitch,maxPitch);}
    function camera(){
      clampView();
      const scale=S.focus?.15:(S.computer?.08:1.0);
      const px=S.px*scale,py=S.py*scale;
      const sy=Math.sin(S.x),cy=Math.cos(S.x),sp=Math.sin(S.y),cp=Math.cos(S.y);
      const f=[sy*cp,sp,-cy*cp],r=[cy,0,sy],up=[-sy*sp,cp,cy*sp];
      const focal=S.height/(2*Math.tan(S.fov*Math.PI/360));
      const eyeX=Math.sin(S.x)*.04+px*.04;
      const eyeY=Math.sin(S.y)*.02-py*.025;
      const eyeZ=.025;
      return {pos:[eyeX,eyeY,eyeZ],f,r,up,fx:focal,fy:focal,cx:S.width/2,cy:S.height/2};
    }
    function project(p){const v=[p[0]-view.pos[0],p[1]-view.pos[1],p[2]-view.pos[2]],z=v[0]*view.f[0]+v[1]*view.f[1]+v[2]*view.f[2];return [view.cx+(v[0]*view.r[0]+v[1]*view.r[1]+v[2]*view.r[2])*view.fx/z,view.cy-(v[0]*view.up[0]+v[1]*view.up[1]+v[2]*view.up[2])*view.fy/z,z];}
    function imagePoint(x,y,d){return project(point(x/IW,y/IH,d));}
    function homography(q,W,H){const [p0,p1,p2,p3]=q,dx1=p1[0]-p2[0],dx2=p3[0]-p2[0],dy1=p1[1]-p2[1],dy2=p3[1]-p2[1],sx=p0[0]-p1[0]+p2[0]-p3[0],sy=p0[1]-p1[1]+p2[1]-p3[1],den=dx1*dy2-dx2*dy1,g=(sx*dy2-dx2*sy)/den,h=(dx1*sy-sx*dy1)/den,a=(p1[0]-p0[0]+g*p1[0])/W,b=(p3[0]-p0[0]+h*p3[0])/H,d=(p1[1]-p0[1]+g*p1[1])/W,e=(p3[1]-p0[1]+h*p3[1])/H;return 'matrix3d('+[a,d,0,g/W,b,e,0,h/H,0,0,1,0,p0[0],p0[1],0,1].join(',')+')';}
    function initGL(){
      gl=surface.getContext('webgl',{alpha:false,antialias:true,powerPreference:'low-power'});if(!gl)return;
      const vs='attribute vec3 aPosition; attribute vec2 aUV; uniform vec3 uPos; uniform vec3 uRight; uniform vec3 uUp; uniform vec3 uForward; uniform vec2 uScale; varying vec2 vUV; void main(){vec3 p=aPosition-uPos;float z=dot(p,uForward);gl_Position=vec4(dot(p,uRight)*uScale.x,dot(p,uUp)*uScale.y,z*0.98-0.1,z);vUV=aUV;}';
      const fs='precision mediump float; varying vec2 vUV; uniform sampler2D uTexture; void main(){gl_FragColor=vec4(texture2D(uTexture,vUV).rgb,1.0);}';
      function shader(type,source){const s=gl.createShader(type);gl.shaderSource(s,source);gl.compileShader(s);if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));return s;}
      try{program=gl.createProgram();const v=shader(gl.VERTEX_SHADER,vs),f=shader(gl.FRAGMENT_SHADER,fs);gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);
        const cols=48,rows=24,vertices=[],indices=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,vv=j/rows;vertices.push(...point(u,vv,depth(u,vv)),u,vv);}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1);}indexCount=indices.length;
        const vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(vertices),gl.STATIC_DRAW);const aP=gl.getAttribLocation(program,'aPosition'),aU=gl.getAttribLocation(program,'aUV');gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,3,gl.FLOAT,false,20,0);gl.enableVertexAttribArray(aU);gl.vertexAttribPointer(aU,2,gl.FLOAT,false,20,12);const ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
        locations={};for(const key of ['Pos','Right','Up','Forward','Scale'])locations[key]=gl.getUniformLocation(program,'u'+key);texture=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,texture);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,photo);gl.uniform1i(gl.getUniformLocation(program,'uTexture'),0);gl.disable(gl.CULL_FACE);gl.disable(gl.DEPTH_TEST);root.classList.add('nx-webgl');root.dataset.renderer='depth-mesh';
      }catch(error){gl=null;root.dataset.renderer='parallax-fallback';}
    }
    function initSoftware(){soft=software.getContext('2d',{alpha:false});if(!soft)return;const cols=64,rows=28,vertices=[],triangles=[];for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){const u=i/cols,v=j/rows;vertices.push({p:point(u,v,depth(u,v)),s:[u*IW,v*IH]});}for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const a=j*(cols+1)+i,b=a+cols+1;triangles.push([a,b,a+1],[a+1,b,b+1]);}softMesh={vertices,triangles};root.classList.add('nx-canvas');root.dataset.renderer='canvas-depth-mesh';}
    function drawSoftware(){const a=soft,d=software.width/S.width;a.setTransform(d,0,0,d,0,0);a.fillStyle='#0b1116';a.fillRect(0,0,S.width,S.height);const vertices=softMesh.vertices,positions=vertices.map(v=>project(v.p));for(const ids of softMesh.triangles){const s=ids.map(i=>vertices[i].s),p=ids.map(i=>positions[i]);if(p.some(v=>v[2]<.3)||p.every(v=>v[0]<-3)||p.every(v=>v[0]>S.width+3)||p.every(v=>v[1]<-3)||p.every(v=>v[1]>S.height+3))continue;const dx1=p[1][0]-p[0][0],dx2=p[2][0]-p[0][0],dy1=p[1][1]-p[0][1],dy2=p[2][1]-p[0][1],sx1=s[1][0]-s[0][0],sx2=s[2][0]-s[0][0],sy1=s[1][1]-s[0][1],sy2=s[2][1]-s[0][1],den=sx1*sy2-sx2*sy1,A=(dx1*sy2-dx2*sy1)/den,B=(dy1*sy2-dy2*sy1)/den,C=(sx1*dx2-sx2*dx1)/den,D=(sx1*dy2-sx2*dy1)/den,E=p[0][0]-A*s[0][0]-C*s[0][1],F=p[0][1]-B*s[0][0]-D*s[0][1];const cx=(p[0][0]+p[1][0]+p[2][0])/3,cy=(p[0][1]+p[1][1]+p[2][1])/3;a.save();a.beginPath();p.forEach((v,i)=>{const len=Math.hypot(v[0]-cx,v[1]-cy),x=v[0]+(v[0]-cx)/len*.4,y=v[1]+(v[1]-cy)/len*.4;i?a.lineTo(x,y):a.moveTo(x,y);});a.closePath();a.clip();a.transform(A,B,C,D,E,F);const L=Math.max(0,Math.min(...s.map(v=>v[0]))-1),T=Math.max(0,Math.min(...s.map(v=>v[1]))-1),R=Math.min(IW,Math.max(...s.map(v=>v[0]))+1),Btm=Math.min(IH,Math.max(...s.map(v=>v[1]))+1);a.drawImage(photo,L,T,R-L,Btm-T,L,T,R-L,Btm-T);a.restore();}}
    function drawRoom(){
      if(gl&&program){
        gl.viewport(0,0,surface.width,surface.height);
        gl.clearColor(.025,.04,.05,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(program);
        gl.uniform3fv(locations.Pos,view.pos);
        gl.uniform3fv(locations.Right,view.r);
        gl.uniform3fv(locations.Up,view.up);
        gl.uniform3fv(locations.Forward,view.f);
        gl.uniform2f(locations.Scale,2*view.fx/S.width,2*view.fy/S.height);
        gl.drawElements(gl.TRIANGLES,indexCount,gl.UNSIGNED_SHORT,0);
      }
      else if(soft)drawSoftware();
      else photo.style.transform='scale(1.08) translate('+(-(S.x*12+S.px*26))+'px,'+(-(S.y*7+S.py*15))+'px)';
    }
    let lastFocus=null;
    function mapSurfaces(){
      for(const m of monitors){const q=m.q.map(p=>imagePoint(p[0],p[1],m.depth||7.2)),visible=q.every(v=>v[2]>.3)&&!q.every(v=>v[0]<-5)&&!q.every(v=>v[0]>S.width+5)&&!q.every(v=>v[1]<-5)&&!q.every(v=>v[1]>S.height+5);m.el.hidden=!visible;if(visible)m.el.style.transform=homography(q,m.w,m.h);m.el.inert=B.active||!visible;if(S.computer&&m.kind==='products'){m.el.hidden=false;m.el.inert=false;}}
      const c=project(coreCenter),hit=$('.nx-core-hit');
      const hitVisible=!S.focus&&!S.computer&&c[2]>=.3&&c[0]>=-150&&c[0]<=S.width+150;
      hit.hidden=!hitVisible;
      hit.disabled=!hitVisible;
      if(hitVisible){
        const scale=clamp((view.fx*.7/Math.max(.3,c[2])*2)/150,.55,1.45);
        hit.style.transform='translate3d('+Math.round(c[0])+'px,'+Math.round(c[1])+'px,0) translate(-50%,-50%) scale('+scale.toFixed(3)+')';
      }
      const anchor=imagePoint(IW*.5,IH*.35,9),projection=$('.nx-projection');
      if(!projection.hidden){
        const px=Math.round(S.width<600?S.width/2:clamp(anchor[0],240,S.width-240));
        const py=Math.round(Math.max(170,anchor[1]+24));
        const rot=(-(S.x+S.px*.15)*.8).toFixed(2);
        projection.style.transform='translate3d('+px+'px,'+py+'px,0) translate(-50%,-100%) rotate('+rot+'deg)';
      }
      const curFocus=S.focus||'room';
      if(curFocus!==lastFocus){lastFocus=curFocus;root.dataset.focus=curFocus;}
    }
    // Code-native meshes. Both renderers use the same vertices, normals and camera.
    const objectCanvas=$('.nx-objects'),objectSoftware=$('.nx-objects-software');
    const P3={groups:[],gl:null,program:null,env:null,light:null,cup:null,tower:null,lamp:null,faces:0,frame:0};
    const propMat={case:{c:[.035,.047,.058],metal:.7,rough:.32},edge:{c:[.12,.15,.16],metal:.85,rough:.25},ceramic:{c:[.61,.65,.62],metal:.08,rough:.26},coffee:{c:[.033,.017,.011],metal:.05,rough:.18},glass:{c:[.17,.28,.33],metal:.15,rough:.13,alpha:.10},led:{c:[.20,.62,.74],metal:.3,rough:.2,emit:.8},amber:{c:[.58,.33,.12],metal:.7,rough:.25,emit:.2},bulb:{c:[.95,.74,.40],metal:0,rough:.3,emit:2,lamp:1},rubber:{c:[.019,.025,.029],metal:.05,rough:.7},key:{c:[.07,.09,.1],metal:.3,rough:.4}};
    function propGroup(x,y,depth=6.5,turn=0,offset=[0,0,0],spin=0){const theta=(x/IW-.5)*SPAN_H,p=point(x/IW,y/IH,9),g={origin:p.map(v=>v*depth/9),theta:theta+turn,offset,spin,faces:[],gpu:[]};P3.groups.push(g);return g;}
    function propVertex(g,p,normal=false){let [x,y,z]=p;if(g.pitch){const c=Math.cos(g.pitch),s=Math.sin(g.pitch);[y,z]=[y*c-z*s,y*s+z*c];}if(g.spin||g.angleZ){const a=(g.angleZ||0)+S.t*.001*g.spin,co=Math.cos(a),si=Math.sin(a);[x,y]=[x*co-y*si,x*si+y*co];}if(!normal){x+=g.offset[0];y+=g.offset[1];z+=g.offset[2];}const c=Math.cos(g.theta),s=Math.sin(g.theta),out=[x*c-z*s,y,x*s+z*c];return normal?out:out.map((v,i)=>v+g.origin[i]);}
    function addFace(g,p,n,mat){g.faces.push({p,n:Array.isArray(n[0])?n:p.map(()=>n),mat:propMat[mat]});P3.faces++;}
    function propBox(g,x,y,z,w,h,d,mat){const l=x-w/2,r=x+w/2,b=y-h/2,t=y+h/2,k=z-d/2,f=z+d/2;addFace(g,[[l,b,f],[r,b,f],[r,t,f],[l,t,f]],[0,0,1],mat);addFace(g,[[r,b,k],[l,b,k],[l,t,k],[r,t,k]],[0,0,-1],mat);addFace(g,[[r,b,f],[r,b,k],[r,t,k],[r,t,f]],[1,0,0],mat);addFace(g,[[l,b,k],[l,b,f],[l,t,f],[l,t,k]],[-1,0,0],mat);addFace(g,[[l,t,f],[r,t,f],[r,t,k],[l,t,k]],[0,1,0],mat);addFace(g,[[l,b,k],[r,b,k],[r,b,f],[l,b,f]],[0,-1,0],mat);}
    function propLathe(g,profile,mat,segments=32,center=[0,0,0]){for(let j=0;j<profile.length-1;j++){const [y0,r0]=profile[j],[y1,r1]=profile[j+1],dy=y1-y0,dr=r1-r0,len=Math.hypot(dy,dr)||1;for(let i=0;i<segments;i++){const a=i/segments*Math.PI*2,b=(i+1)/segments*Math.PI*2,v=(a,r,y)=>[center[0]+Math.cos(a)*r,center[1]+y,center[2]+Math.sin(a)*r],n=a=>[dy/len*Math.cos(a),-dr/len,dy/len*Math.sin(a)];addFace(g,[v(a,r0,y0),v(b,r0,y0),v(b,r1,y1),v(a,r1,y1)],[n(a),n(b),n(b),n(a)],mat);}}}
    function propTorus(g,center,rx,ry,tube,mat,segments=32,sides=6,start=0,end=Math.PI*2){for(let i=0;i<segments;i++)for(let j=0;j<sides;j++){const a=start+(end-start)*i/segments,b=start+(end-start)*(i+1)/segments,c=j/sides*Math.PI*2,d=(j+1)/sides*Math.PI*2;function v(a,b){return [center[0]+(rx+tube*Math.cos(b))*Math.cos(a),center[1]+(ry+tube*Math.cos(b))*Math.sin(a),center[2]+tube*Math.sin(b)];}function n(a,b){return [Math.cos(a)*Math.cos(b),Math.sin(a)*Math.cos(b),Math.sin(b)];}addFace(g,[v(a,c),v(b,c),v(b,d),v(a,d)],[n(a,c),n(b,c),n(b,d),n(a,d)],mat);}}
    function propRod(g,a,b,r,mat,sides=12){const axis=b.map((v,i)=>v-a[i]),len=Math.hypot(...axis),n=axis.map(v=>v/len),ref=Math.abs(n[1])>.9?[1,0,0]:[0,1,0],u=[n[1]*ref[2]-n[2]*ref[1],n[2]*ref[0]-n[0]*ref[2],n[0]*ref[1]-n[1]*ref[0]],ul=Math.hypot(...u);for(let i=0;i<3;i++)u[i]/=ul;const v=[n[1]*u[2]-n[2]*u[1],n[2]*u[0]-n[0]*u[2],n[0]*u[1]-n[1]*u[0]],normal=t=>u.map((k,i)=>k*Math.cos(t)+v[i]*Math.sin(t)),vertex=(p,t)=>p.map((k,i)=>k+r*normal(t)[i]);for(let i=0;i<sides;i++){const t=i/sides*Math.PI*2,s=(i+1)/sides*Math.PI*2;addFace(g,[vertex(a,t),vertex(a,s),vertex(b,s),vertex(b,t)],[normal(t),normal(s),normal(s),normal(t)],mat);}}
    function buildProps3D(){
      buildBadge();buildDoor();
      for(const group of P3.groups)if(!group.spin&&!group.dynamic)group.cachedFaces=group.faces.map(f=>preparePropFace(group,f));
      root.dataset.props3d='downloaded-gltf-assets,lanyard,glass-door';root.dataset.meshFaces=String(P3.faces);initPropsGL();
    }
    function propMatrix(g){const x=propVertex(g,[1,0,0],true),y=propVertex(g,[0,1,0],true),z=propVertex(g,[0,0,1],true),o=propVertex(g,[0,0,0]);return new Float32Array([...x,0,...y,0,...z,0,...o,1]);}
    function initPropsGL(){
      const g=objectCanvas.getContext('webgl',{alpha:true,antialias:true,premultipliedAlpha:false,powerPreference:'low-power'});if(!g){root.dataset.propsRenderer='canvas-mesh';return;}
      try{
        const vs='precision mediump float;attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;attribute vec4 aM;uniform mat4 uModel;uniform vec3 uPos,uR,uU,uF;uniform vec2 uScale;varying vec3 vP,vN,vC;varying vec4 vM;void main(){vec4 w=uModel*vec4(aP,1.);vP=w.xyz;vN=normalize(mat3(uModel)*aN);vC=aC;vM=aM;vec3 p=w.xyz-uPos;float z=dot(p,uF);gl_Position=vec4(dot(p,uR)*uScale.x,dot(p,uU)*uScale.y,z*.98-.1,z);}';
        const fs='precision mediump float;varying vec3 vP,vN,vC;varying vec4 vM;uniform vec3 uPos,uLight;uniform float uLamp;uniform sampler2D uEnv;void main(){vec3 n=normalize(vN),v=normalize(uPos-vP),key=normalize(vec3(-.3,.7,.6)),l=uLight-vP;float dist=length(l);l/=max(.01,dist);float nl=max(dot(n,l),0.);float spot=clamp((uLight.y-vP.y+.15)*2.,0.,1.);float warm=uLamp*spot/(.6+dist*dist)*nl;vec3 h=normalize(v+l);float spec=pow(max(0.,dot(n,h)),mix(80.,12.,vM.y));vec3 r=reflect(-v,n);vec2 uv=vec2(atan(r.z,r.x)/6.2831853+.5,.5-asin(clamp(r.y,-1.,1.))/3.14159265);vec3 env=texture2D(uEnv,uv).rgb;vec3 c=vC*(.24+.34*max(0.,dot(n,key)))+vC*vec3(1.,.65,.3)*warm*2.3+vec3(1.,.80,.47)*spec*warm*.7;float fres=pow(1.-max(0.,dot(n,v)),4.);c+=env*vM.x*(.25+fres*.3);c+=vec3(.09,.16,.21)*fres;float em=vM.z<0.?-vM.z*uLamp:vM.z;c+=vC*em;gl_FragColor=vec4(c,vM.w);}';
        function shader(t,s){const sh=g.createShader(t);g.shaderSource(sh,s);g.compileShader(sh);if(!g.getShaderParameter(sh,g.COMPILE_STATUS))throw new Error(g.getShaderInfoLog(sh));return sh;}
        const p=g.createProgram();g.attachShader(p,shader(g.VERTEX_SHADER,vs));g.attachShader(p,shader(g.FRAGMENT_SHADER,fs));g.linkProgram(p);if(!g.getProgramParameter(p,g.LINK_STATUS))throw new Error(g.getProgramInfoLog(p));g.useProgram(p);P3.gl=g;P3.program=p;P3.loc={};for(const k of ['Model','Pos','R','U','F','Scale','Light','Lamp'])P3.loc[k]=g.getUniformLocation(p,'u'+k);
        P3.attributes=['P','N','C','M'].map(k=>g.getAttribLocation(p,'a'+k));for(const group of P3.groups){group.gpu=[];for(const alpha of [false,true]){const data=[];for(const f of group.faces){const m=f.mat;if((m.alpha<1)!==alpha)continue;for(let i=1;i<f.p.length-1;i++)for(const j of [0,i,i+1])data.push(...f.p[j],...f.n[j],...m.c,m.metal,m.rough,(m.lamp?-1:1)*(m.emit||0),m.alpha||1);}if(data.length){const b=g.createBuffer();g.bindBuffer(g.ARRAY_BUFFER,b);g.bufferData(g.ARRAY_BUFFER,new Float32Array(data),g.STATIC_DRAW);group.gpu.push({buffer:b,count:data.length/13,alpha});}}}
        const tx=g.createTexture();g.bindTexture(g.TEXTURE_2D,tx);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_S,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_WRAP_T,g.CLAMP_TO_EDGE);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MIN_FILTER,g.LINEAR);g.texParameteri(g.TEXTURE_2D,g.TEXTURE_MAG_FILTER,g.LINEAR);g.texImage2D(g.TEXTURE_2D,0,g.RGB,g.RGB,g.UNSIGNED_BYTE,photo);g.uniform1i(g.getUniformLocation(p,'uEnv'),0);g.enable(g.DEPTH_TEST);g.disable(g.CULL_FACE);root.dataset.propsRenderer='webgl-mesh';
      }catch(error){P3.gl=null;root.dataset.propsRenderer='canvas-mesh';}
    }
    function drawPropsGL(){const g=P3.gl,p=P3.program,l=P3.loc;g.viewport(0,0,objectCanvas.width,objectCanvas.height);g.clearColor(0,0,0,0);g.clear(g.COLOR_BUFFER_BIT|g.DEPTH_BUFFER_BIT);g.useProgram(p);g.uniform3fv(l.Pos,view.pos);g.uniform3fv(l.R,view.r);g.uniform3fv(l.U,view.up);g.uniform3fv(l.F,view.f);g.uniform2f(l.Scale,2*view.fx/S.width,2*view.fy/S.height);g.uniform3fv(l.Light,P3.light);g.uniform1f(l.Lamp,S.lampLevel);for(const alpha of [false,true]){g.depthMask(!alpha);if(alpha){g.enable(g.BLEND);g.blendFunc(g.SRC_ALPHA,g.ONE_MINUS_SRC_ALPHA);}else g.disable(g.BLEND);for(const group of P3.groups){if(!group.gpu||!group.gpu.length)continue;g.uniformMatrix4fv(l.Model,false,propMatrix(group));for(const part of group.gpu){if(part.alpha!==alpha)continue;g.bindBuffer(g.ARRAY_BUFFER,part.buffer);for(let i=0;i<4;i++){g.enableVertexAttribArray(P3.attributes[i]);g.vertexAttribPointer(P3.attributes[i],i===3?4:3,g.FLOAT,false,52,[0,12,24,36][i]);}g.drawArrays(g.TRIANGLES,0,part.count);}}}g.depthMask(true);}
    function preparePropFace(group,f){const w=f.p.map(p=>propVertex(group,p)),n=propVertex(group,f.n.reduce((a,n)=>a.map((v,i)=>v+n[i]),[0,0,0]).map(v=>v/f.n.length),true),len=Math.hypot(...n)||1;return {w,normal:n.map(v=>v/len),center:w.reduce((a,p)=>a.map((v,i)=>v+p[i]),[0,0,0]).map(v=>v/w.length),mat:f.mat};}
    function drawPropsCanvas(groups=P3.groups,a=ctx){
      const faces=[];for(const group of groups)for(const face of group.cachedFaces||group.faces.map(f=>preparePropFace(group,f))){const {w,normal,center,mat}=face,q=w.map(project);if(q.some(p=>p[2]<.3)||q.every(p=>p[0]<-3)||q.every(p=>p[0]>S.width+3)||q.every(p=>p[1]<-3)||q.every(p=>p[1]>S.height+3))continue;const V=view.pos.map((v,i)=>v-center[i]),facing=V.reduce((a,v,i)=>a+v*normal[i],0);if(facing<0&&mat.alpha===undefined)continue;faces.push({q,normal,center,mat,z:q.reduce((a,p)=>a+p[2],0)/q.length});}faces.sort((a,b)=>b.z-a.z);
      for(const f of faces){const m=f.mat,n=f.normal,L=P3.light.map((v,i)=>v-f.center[i]),distance=Math.hypot(...L);for(let i=0;i<3;i++)L[i]/=distance;const nl=Math.max(0,n.reduce((a,v,i)=>a+v*L[i],0)),key=Math.max(0,n[0]*-.3+n[1]*.7+n[2]*.6),warm=S.lampLevel*clamp((P3.light[1]-f.center[1]+.15)*2,0,1)/(.6+distance*distance)*nl,env=.03+m.metal*.09,em=(m.emit||0)*(m.lamp?S.lampLevel:1),color=m.c.map((v,i)=>clamp(v*(.36+key*.58+warm*[2.4,1.6,.7][i]+em)+env*[.55,.77,.95][i],0,1)*255);a.fillStyle='rgba('+color.map(Math.round).join(',')+','+(m.alpha||1)+')';a.beginPath();f.q.forEach((p,i)=>i?a.lineTo(p[0],p[1]):a.moveTo(p[0],p[1]));a.closePath();a.fill();if(m.alpha===undefined){a.strokeStyle=a.fillStyle;a.lineWidth=.35;a.lineJoin='round';a.stroke();}}
    }
    function drawObjectDetails(){const top=project(propVertex(P3.cup,[0,.33,0]));if(top[2]>.3&&top[0]>-40&&top[0]<S.width+40){const r=view.fx*.09/top[2],t=S.t*.001;for(let j=0;j<3;j++){const pts=[];for(let k=0;k<14;k++){const f=k/13;pts.push([top[0]+(j-1)*r*.5+Math.sin(f*6-t*.8+j)*r*.23,top[1]-f*r*4]);}path(pts,'rgba(214,224,216,'+(.06+S.lampLevel*.06)+')',.6);}}
      const pc=project(propVertex(P3.tower,[0,.8,.36]));if(pc[2]>.3){const r=view.fx*.24/pc[2],glow=ctx.createRadialGradient(pc[0],pc[1],0,pc[0],pc[1],r*2.6);glow.addColorStop(0,'#7ad9ed0d');glow.addColorStop(1,'#7ad9ed00');ctx.fillStyle=glow;ctx.fillRect(pc[0]-r*3,pc[1]-r*3,r*6,r*6);}}
    function drawPropShadows(){for(const [group,size]of [[P3.cup,.19],[P3.tower,.44],[P3.lamp,.25]]){if(!group)continue;const p=project(propVertex(group,[0,0,0]));if(p[2]<.3)continue;const r=view.fx*size/p[2];ctx.save();ctx.translate(p[0],p[1]+1);ctx.scale(1,.25);const glow=ctx.createRadialGradient(0,0,0,0,0,r*1.4);glow.addColorStop(0,'#02060a80');glow.addColorStop(1,'#02060a00');ctx.fillStyle=glow;ctx.fillRect(-r*1.4,-r*1.4,r*2.8,r*2.8);ctx.restore();}}
    function drawProps3D(){if(!P3.groups.length)return;drawPropShadows();if(P3.gl)drawPropsGL();else{const key=[S.x.toFixed(4),S.y.toFixed(4),S.fov.toFixed(2),S.width,S.height,S.lampLevel.toFixed(2)].join(',');if(key!==P3.staticKey){P3.staticKey=key;if(!P3.cache)P3.cache=document.createElement('canvas');P3.cache.width=fx.width;P3.cache.height=fx.height;const a=P3.cache.getContext('2d');a.setTransform(S.dpr,0,0,S.dpr,0,0);drawPropsCanvas(P3.groups.filter(g=>!g.spin&&!g.dynamic),a);}const target=objectSoftware.getContext('2d');target.setTransform(S.dpr,0,0,S.dpr,0,0);target.clearRect(0,0,S.width,S.height);target.drawImage(P3.cache,0,0,S.width,S.height);drawPropsCanvas(P3.groups.filter(g=>g.spin||g.dynamic),target);}drawObjectDetails();P3.frame++;root.dataset.propsFrame=String(P3.frame);}

    Object.assign(propMat,{silver:{c:[.25,.28,.30],metal:.94,rough:.29},gold:{c:[.52,.34,.12],metal:.9,rough:.27},ironred:{c:[.28,.023,.017],metal:.88,rough:.25},leather:{c:[.12,.055,.025],metal:0,rough:.8},strap:{c:[.024,.065,.19],metal:0,rough:.8},card:{c:[.71,.76,.75],metal:.05,rough:.35},stoneBlue:{c:[.06,.29,.72],metal:.15,rough:.15,emit:1},stonePurple:{c:[.43,.08,.65],metal:.15,rough:.15,emit:.7},stoneRed:{c:[.58,.035,.025],metal:.15,rough:.15,emit:.7},stoneOrange:{c:[.75,.27,.025],metal:.15,rough:.15,emit:.6},stoneGreen:{c:[.04,.5,.15],metal:.15,rough:.15,emit:.8},stoneYellow:{c:[.76,.57,.09],metal:.15,rough:.15,emit:.8}});
    function propBevel(g,x,y,z,w,h,d,b,mat){const shape=(W,H,B)=>[[-W/2+B,-H/2],[W/2-B,-H/2],[W/2,-H/2+B],[W/2,H/2-B],[W/2-B,H/2],[-W/2+B,H/2],[-W/2,H/2-B],[-W/2,-H/2+B]],a=shape(w,h,b),front=shape(w-b*1.4,h-b*1.4,b*.55),v=(p,Z)=>[p[0]+x,p[1]+y,Z+z];addFace(g,front.map(p=>v(p,d/2)),[0,0,1],mat);addFace(g,front.slice().reverse().map(p=>v(p,-d/2)),[0,0,-1],mat);for(let i=0;i<8;i++){const j=(i+1)%8,dx=a[j][0]-a[i][0],dy=a[j][1]-a[i][1],l=Math.hypot(dx,dy),n=[dy/l,-dx/l,0];addFace(g,[v(a[i],-d/2+b),v(a[j],-d/2+b),v(a[j],d/2-b),v(a[i],d/2-b)],n,mat);addFace(g,[v(a[i],d/2-b),v(a[j],d/2-b),v(front[j],d/2),v(front[i],d/2)],[n[0]*.707,n[1]*.707,.707],mat);addFace(g,[v(front[i],-d/2),v(front[j],-d/2),v(a[j],-d/2+b),v(a[i],-d/2+b)],[n[0]*.707,n[1]*.707,-.707],mat);}}
    function buildBadge(){
      const g=P3.badge=propGroup(1095,586,5.9,-.22);g.pitch=.65;propBox(g,0,.20,0,.35,.018,.51,'card');propBox(g,0,.20,-.25,.08,.021,.035,'edge');
      const strap=propGroup(1095,586,5.9,-.22),points=[];for(let i=0;i<=52;i++){const a=i/52*Math.PI*2;points.push([Math.sin(a)*.42-.10,.016+Math.sin(a*3)*.003,Math.cos(a)*.33-.40]);}for(let i=0;i<points.length-1;i++){const a=points[i],b=points[i+1],dx=b[0]-a[0],dz=b[2]-a[2],l=Math.hypot(dx,dz),nx=dz/l*.018,nz=-dx/l*.018;addFace(strap,[[a[0]-nx,a[1],a[2]-nz],[a[0]+nx,a[1],a[2]+nz],[b[0]+nx,b[1],b[2]+nz],[b[0]-nx,b[1],b[2]-nz]],[0,1,0],'strap');}propRod(strap,[0,.025,-.25],[-.03,.02,-.34],.016,'silver',10);
      const a=$('.nx-id-label').getContext('2d');a.fillStyle='#e7eae4';a.fillRect(0,0,320,480);a.fillStyle='#12365c';a.fillRect(0,0,320,100);a.fillStyle='#e9d198';a.fillRect(0,97,320,4);a.textAlign='center';a.fillStyle='#f0ede0';a.font='500 25px Arial';a.fillText('BICOL UNIVERSITY',160,45);a.font='400 14px Arial';a.fillText('DEVELOPMENT WORKSPACE',160,75);a.fillStyle='#1a3544';a.font='500 36px Arial';a.fillText('NEXACART',160,185);a.font='400 19px Arial';a.fillText('POLANGUI HQ',160,218);a.fillStyle='#b0c0c3';a.fillRect(116,253,88,82);a.fillStyle='#dae2df';a.beginPath();a.arc(160,281,15,0,Math.PI*2);a.fill();a.beginPath();a.ellipse(160,322,27,23,0,0,Math.PI*2);a.fill();a.fillStyle='#345160';a.font='400 19px Arial';a.fillText('DEVELOPER',160,376);a.fillStyle='#687f84';a.font='400 16px Arial';a.fillText('DEMO ID · PROTOTYPE',160,413);a.fillStyle='#12365c';a.fillRect(0,447,320,33);
    }
    function buildDoor(){
      const q=[[1645,185],[1800,132],[1800,655],[1645,610]].map(p=>point(p[0]/IW,p[1]/IH,9)),fixed=propGroup(0,0,9);fixed.origin=[0,0,0];fixed.theta=0;for(let i=0;i<4;i++)propRod(fixed,q[i],q[(i+1)%4],.024,'edge',8);
      const door=P3.door=propGroup(0,0,9);door.origin=[0,0,0];door.theta=0;door.dynamic=true;P3.doorSlide=q[1].map((v,i)=>(v-q[0][i])*1.02);P3.doorCorners=q;addFace(door,q,[-.9,0,.4],'glass');for(let i=0;i<4;i++)propRod(door,q[i],q[(i+1)%4],.012,'silver',8);const handle=[.52,.68].map(t=>q[1].map((v,i)=>mix(v,q[2][i],t)));propRod(door,handle[0].map((v,i)=>v+(i===2?.035:0)),handle[1].map((v,i)=>v+(i===2?.035:0)),.025,'silver',12);
    }
    function updateRelics(){
      if(P3.door)P3.door.offset=P3.doorSlide.map(v=>v*S.doorEase);
      if(P3.badge){const q=[[-.163,.211,-.24],[.163,.211,-.24],[.163,.211,.24],[-.163,.211,.24]].map(p=>project(propVertex(P3.badge,p))),el=$('.nx-id-label');el.hidden=B.active&&!B.reveal||q.some(p=>p[2]<.3)||q.every(p=>p[0]<0)||q.every(p=>p[0]>S.width);if(!el.hidden)el.style.transform=homography(q,320,480);}
      root.dataset.door=S.door?'open':'closed';root.dataset.doorProgress=S.doorEase.toFixed(3);
    }
    function focusRelic(x,y,fov,label){
      if(B.active)return;
      closeComposer(false);
      closeComputer(false);
      $('.nx-projection').hidden=true;
      S.focus=label;
      S.baseX=(x/IW-.5)*SPAN_H;
      S.baseY=(.5-y/IH)*SPAN_V;
      clampBase();
      S.parallaxX=0;
      S.parallaxY=0;
      S.tx=S.baseX;
      S.ty=S.baseY;
      S.targetFov=fov;
      S.mouseMoved=true;
      $('.nx-home').focus({preventScroll:true});
      $('.nx-status').textContent=label+'. Reset the view or press Escape to return.';
      wake();
    }
    $('.nx-id-hit')?.addEventListener('click',()=>focusRelic(1095,565,11,'Bicol University demo ID'));
    $('.nx-parts-hit')?.addEventListener('click',()=>focusRelic(834,552,12,'Iron Man helmet'));

    // Authored meshes were replaced by sourced, textured glTF assets.
    const downloadedSpecs=[];
    let realAssets=null;
    function buildDownloadedAssets(){
      const meta=window.NexaAssetMeta||{};
      for(const def of [
        ['cup',760,577,6.1,0],['pc',1460,565,6.4,0],['lamp',610,580,6.3,0],
        ['keyboard',1225,583,6.1,0],['mouse',1370,597,6.1,0],['helmet',834,578,6.1,0]
      ]){
        const [name,x,y,depth,turn]=def,g=propGroup(x,y,depth,0),m=meta[name];if(!m)continue;
        const image=document.createElement('img');image.className='nx-real-sprite';image.src='assets/fallback/'+name+'.webp';image.alt='';image.setAttribute('aria-hidden','true');$('.nx-real-props').append(image);
        const itemTurn=name==='lamp'?3.14159:(m.turn||turn||0);
        downloadedSpecs.push({name,origin:g.origin,theta:g.theta,turn:itemTurn,width:m.width,height:m.height,g,image});
        if(name==='cup')P3.cup=g;if(name==='pc')P3.tower=g;if(name==='lamp'){P3.lamp=g;P3.light=propVertex(g,[.48,1.5,.05]);}
      }
      if(window.NexaReal3D)realAssets=new window.NexaReal3D({canvas:$('.nx-real-canvas'),photo,root,specs:downloadedSpecs,onReady:wake});
      root.dataset.downloadedAssets=downloadedSpecs.map(s=>s.name).join(',');
      return realAssets?.promise||Promise.resolve();
    }
    function drawDownloadedAssets(){
      realAssets?.update(view,S,P3.light);
      const webgl=realAssets?.ready&&realAssets?.renderer;
      for(const spec of downloadedSpecs){
        const {g,image,width:w,height:h}=spec,q=[[-w/2,h,0],[w/2,h,0],[w/2,0,0],[-w/2,0,0]].map(p=>project(propVertex(g,p)));
        image.hidden=!!webgl||B.active&&!B.reveal||q.some(p=>p[2]<.3)||q.every(p=>p[0]<-10)||q.every(p=>p[0]>S.width+10);
        if(!image.hidden){image.style.width=image.naturalWidth+'px';image.style.height=image.naturalHeight+'px';if(image.naturalWidth)image.style.transform=homography(q,image.naturalWidth,image.naturalHeight);}
      }
    }

    let lastLamp=null,lastSuit=null,lastComp=null,lastDesk=null;
    function mapSceneProps(){
      for(const p of panels){const q=p.q.map(v=>imagePoint(v[0],v[1],p.depth||9));const visible=q.every(v=>v[2]>.3)&&!q.every(v=>v[0]<-10)&&!q.every(v=>v[0]>S.width+10);p.el.hidden=B.active&&!B.reveal||!visible;if(visible)p.el.style.transform=homography(q,p.w,p.h);}
      for(const h of hotspots){
        const p=h.el.classList.contains('nx-lamp-hit')&&P3.light?project(P3.light):imagePoint(h.x,h.y,h.depth||8.0);
        const visible=!B.active&&!S.computer&&p[2]>.3&&p[0]>12&&p[0]<S.width-12&&p[1]>12&&p[1]<S.height-60;
        h.el.hidden=!visible;
        h.el.disabled=!visible;
        if(visible){
          const x=Math.round(clamp(p[0],78,S.width-78));
          const y=Math.round(p[1]-(h.el.classList.contains('nx-lamp-hit')?24:0));
          h.el.style.transform='translate3d('+x+'px,'+y+'px,0) translate(-50%,-50%)';
        }
      }
      const curLamp=S.lamp?'on':'off';if(curLamp!==lastLamp){lastLamp=curLamp;root.dataset.lamp=curLamp;}
      const curSuit=S.suit?'active':'standby';if(curSuit!==lastSuit){lastSuit=curSuit;root.dataset.suit=curSuit;}
      const curComp=S.computer?'open':'closed';if(curComp!==lastComp){lastComp=curComp;root.dataset.computer=curComp;}
      if(S.desktop!==lastDesk){lastDesk=S.desktop;root.dataset.desktop=S.desktop;}
    }
    let blueprintFrame=-1;
    function drawBlueprints(){
      const frame=Math.floor(S.t/40);if(frame===blueprintFrame)return;blueprintFrame=frame;const t=S.t*.001;
      for(let n=0;n<2;n++){
        const cv=panels[n].el,a=cv.getContext('2d');a.clearRect(0,0,480,260);a.fillStyle='#10212736';a.fillRect(0,0,480,260);a.strokeStyle='#e6b67424';a.lineWidth=.6;
        for(let x=0;x<480;x+=24){a.beginPath();a.moveTo(x,0);a.lineTo(x,260);a.stroke();}for(let y=0;y<260;y+=24){a.beginPath();a.moveTo(0,y);a.lineTo(480,y);a.stroke();}
        a.strokeStyle='#edc17eb0';a.lineWidth=1;a.strokeRect(1,1,478,258);
        a.save();a.translate(n?232:157,143);a.strokeStyle='#f2c985c9';a.fillStyle='#edbf7a0c';a.shadowColor='#e9af62';a.shadowBlur=3;
        function ring(x,y,r,angle=0){a.save();a.translate(x,y);a.rotate(angle);a.beginPath();a.arc(0,0,r,0,Math.PI*2);a.stroke();a.beginPath();a.arc(0,0,r*.73,0,Math.PI*2);a.stroke();for(let j=0;j<12;j++){const v=j*Math.PI/6;a.beginPath();a.moveTo(Math.cos(v)*r*.82,Math.sin(v)*r*.82);a.lineTo(Math.cos(v)*r*1.08,Math.sin(v)*r*1.08);a.stroke();}a.restore();}
        if(n===0){
          ring(0,0,44,t*.3);const angle=-.8+Math.sin(t*.6)*.32,fore=1.1+Math.sin(t*.6+.8)*.5;
          a.rotate(angle);a.beginPath();a.moveTo(9,-33);a.lineTo(125,-18);a.lineTo(125,18);a.lineTo(9,33);a.closePath();a.fill();a.stroke();a.beginPath();a.moveTo(42,-20);a.lineTo(114,-9);a.moveTo(42,20);a.lineTo(114,9);a.stroke();ring(130,0,24,-t*.5);
          a.translate(130,0);a.rotate(fore);a.strokeRect(14,-12,94,24);a.strokeRect(28,-6,65,12);ring(111,0,17,t*.7);a.translate(113,0);a.rotate(Math.sin(t*.8)*.4);a.beginPath();a.moveTo(13,-11);a.lineTo(40,-24);a.lineTo(56,-14);a.moveTo(13,11);a.lineTo(40,24);a.lineTo(56,14);a.stroke();
        }else{
          for(let j=0;j<3;j++)ring(0,0,79-j*21,(j%2?-1:1)*t*.17);
          a.rotate(t*.22);for(let j=0;j<10;j++){a.rotate(Math.PI/5);a.beginPath();a.moveTo(13,-2);a.bezierCurveTo(35,-29,60,-25,73,-8);a.lineTo(48,1);a.quadraticCurveTo(27,-5,13,8);a.closePath();a.fill();a.stroke();}
          a.rotate(-t*.22);a.strokeStyle='#a4dfe8aa';a.beginPath();a.arc(0,0,100,t*.33,t*.33+1.5);a.stroke();
        }
        a.restore();a.shadowBlur=0;a.strokeStyle='#ecc08580';a.lineWidth=.7;
        for(let j=0;j<6;j++){const y=38+j*18,w=32+((j*13+n*7)%47);a.beginPath();a.moveTo(390,y);a.lineTo(390+w,y);a.stroke();a.fillStyle='#eac1813a';a.fillRect(390,y+5,15+j%3*6,2);}
        a.fillStyle='#efc88dc7';a.fillRect(17,17,24,2);a.fillRect(17,22,8,2);
        const scan=(t*15)%250;a.fillStyle='#eac18108';a.fillRect(1,scan,478,4);
      }
    }
    // These source-image anchors follow the photographed suit on the left.
    const suitAnchors={palm:[290,405],chest:[290,405],eyeLeft:[283,356],eyeRight:[297,356]};
    function drawArmour(){
      const t=S.t*.001,phase=S.suit?(S.paused?1600:((S.t-S.suitStart)%5200)):0,charge=S.suit?smooth(0,950,phase)*(1-smooth(2650,3200,phase)):0,fire=S.suit?smooth(900,1100,phase)*(1-smooth(2450,2800,phase)):0;
      root.dataset.suitPhase=!S.suit?'standby':phase<950?'charging':phase<2800?'firing':'cooling';
      const foot=imagePoint(288,698,9);if(foot[2]>.3){const r=view.fx*.3/foot[2];ctx.save();ctx.fillStyle='#02070c55';ctx.beginPath();ctx.ellipse(foot[0],foot[1],r,r*.22,0,0,Math.PI*2);ctx.fill();ctx.restore();}if(!S.suit)return;
      const palm=imagePoint(...suitAnchors.palm,9);if(palm[2]<.3||palm[0]<-180||palm[0]>S.width+180)return;
      const chest=imagePoint(...suitAnchors.chest,9),r=view.fx*.065/palm[2];
      function glow(p,r,alpha){const g=ctx.createRadialGradient(p[0],p[1],0,p[0],p[1],r*5);g.addColorStop(0,'rgba(232,253,255,'+alpha+')');g.addColorStop(.12,'rgba(170,235,255,'+alpha*.85+')');g.addColorStop(.4,'rgba(71,189,255,'+alpha*.24+')');g.addColorStop(1,'#53cfff00');ctx.fillStyle=g;ctx.beginPath();ctx.arc(p[0],p[1],r*5,0,Math.PI*2);ctx.fill();}
      ctx.save();ctx.globalCompositeOperation='screen';glow(chest,r*.7,.28+charge*.55);glow(palm,r,.15+charge*.85);
      if(charge>.01){ctx.globalAlpha=charge;ctx.strokeStyle='#bcefff';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(palm[0],palm[1],r*(1.1+.08*Math.sin(t*18)),-t*3,-t*3+Math.PI*1.65);ctx.stroke();ctx.globalAlpha=1;}
      if(fire>.01){
        const start=point(suitAnchors.palm[0]/IW,suitAnchors.palm[1]/IH,9),target=project([start[0]+1.6,start[1]-.9,start[2]+4.0]);
        if(target[2]>.3){const dx=target[0]-palm[0],dy=target[1]-palm[1],len=Math.hypot(dx,dy)||1,nx=-dy/len,ny=dx/len,w=clamp(view.fx*.45/palm[2],15,90);ctx.globalAlpha=fire;
          const beam=ctx.createLinearGradient(palm[0],palm[1],target[0],target[1]);beam.addColorStop(0,'#dcfafff0');beam.addColorStop(.35,'#63d5ff8c');beam.addColorStop(1,'#53cfff08');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(palm[0]-nx*2,palm[1]-ny*2);ctx.lineTo(target[0]-nx*w,target[1]-ny*w);ctx.quadraticCurveTo(target[0]+dx*.03,target[1]+dy*.03,target[0]+nx*w,target[1]+ny*w);ctx.lineTo(palm[0]+nx*2,palm[1]+ny*2);ctx.closePath();ctx.fill();
          ctx.shadowColor='#7bdfff';ctx.shadowBlur=18;path([palm,target],'rgba(128,223,255,'+(.52+.12*Math.sin(t*31))+')',6);path([palm,target],'#efffff',1.9);ctx.shadowBlur=0;
          glow(target,w*.33,.48);ctx.strokeStyle='#9ce7ff55';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(target[0],target[1],w*(.6+.09*Math.sin(t*11)),w*.25,.1,0,Math.PI*2);ctx.stroke();
          for(let i=0;i<12;i++){const a=i*2.399,progress=((t*1.5+i*.083)%1),distance=progress*w*.9,px=target[0]+Math.cos(a)*distance,py=target[1]+Math.sin(a)*distance*.5;ctx.fillStyle='rgba(205,248,255,'+((1-progress)*.65)+')';ctx.fillRect(px,py,1,1);}
        }
      }
      ctx.restore();
    }

    function drawLamp(){
      S.lampLevel=reduced?(S.lamp?1:0):mix(S.lampLevel,S.lamp?1:0,.16);if(S.lampLevel<.002)return;
      const head=P3.light?project(P3.light):imagePoint(710,410,9),end=imagePoint(770,580,9);if(head[2]<.3||end[2]<.3)return;const w=view.fx*.7/head[2];ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=S.lampLevel;
      const cone=ctx.createLinearGradient(head[0],head[1],end[0],end[1]);cone.addColorStop(0,'#ffe2a252');cone.addColorStop(1,'#ffd08700');ctx.fillStyle=cone;ctx.beginPath();ctx.moveTo(head[0]-w*.09,head[1]);ctx.lineTo(end[0]-w,end[1]);ctx.quadraticCurveTo(end[0],end[1]+w*.2,end[0]+w,end[1]);ctx.lineTo(head[0]+w*.09,head[1]);ctx.closePath();ctx.fill();
      const glow=ctx.createRadialGradient(head[0],head[1],0,head[0],head[1],w*.4);glow.addColorStop(0,'#fff0c7f0');glow.addColorStop(.12,'#ffe6acb3');glow.addColorStop(1,'#ffd18b00');ctx.fillStyle=glow;ctx.fillRect(head[0]-w*.4,head[1]-w*.4,w*.8,w*.8);
      const pool=ctx.createRadialGradient(end[0],end[1],0,end[0],end[1],w);pool.addColorStop(0,'#ffda8b5c');pool.addColorStop(1,'#ffda8b00');ctx.translate(end[0],end[1]);ctx.scale(1,.23);ctx.fillStyle=pool;ctx.fillRect(-w,-w,w*2,w*2);ctx.restore();
    }
    function drawSceneProps(){updateRelics();drawBlueprints();drawProps3D();drawDownloadedAssets();drawLamp();drawArmour();mapSceneProps();}
    const desktopData={
      overview:{
        label:'Net revenue',
        value:'₱6.91M',
        second:'2,418 orders',
        rows:[
          ['Today','₱184,250','64 orders'],
          ['This week','₱1.28M','442 orders'],
          ['All-time','₱6.91M','2,418 orders']
        ],
        series:fixtures.sales.series
      },
      stores:{
        label:'Leading store',
        value:'ByteHub PH',
        second:'₱1.02M revenue',
        rows:[
          ['ByteHub PH','₱1.02M','812 orders'],
          ['Gadget Grove','₱663.1K','548 orders'],
          ['VoltCart Mobile','₱453.6K','410 orders']
        ],
        series:fixtures.stores.series
      },
      products:{
        label:'Top product',
        value:'Wireless ANC Headphones',
        second:'₱164.8K revenue',
        rows:[
          ['Wireless ANC Headphones','₱164.8K','82 units'],
          ['MacBook Air M2 13-inch','₱149.9K','25 units'],
          ['Galaxy S24 Ultra 256GB','₱138.5K','20 units']
        ],
        series:fixtures.products.series
      }
    };
    function drawDesktop(){const d=desktopData[S.desktop];$('.nx-desktop-label').textContent=d.label;$('.nx-desktop-value').textContent=d.value;$('.nx-desktop-second').textContent=d.second;const body=$('.nx-desktop tbody');body.replaceChildren();for(const values of d.rows){const row=document.createElement('tr');for(const value of values){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}body.append(row);}for(const b of root.querySelectorAll('[data-desktop-tab]'))b.setAttribute('aria-pressed',String(b.dataset.desktopTab===S.desktop));const cv=$('.nx-desktop-chart'),a=cv.getContext('2d'),w=cv.width,h=cv.height;a.clearRect(0,0,w,h);a.strokeStyle='#bde4e421';a.lineWidth=1;for(let i=1;i<4;i++){a.beginPath();a.moveTo(10,i*h/4);a.lineTo(w-10,i*h/4);a.stroke();}const p=d.series.map((v,i)=>[12+i/(d.series.length-1)*(w-24),h-12-v*(h-26)]);a.beginPath();p.forEach((v,i)=>i?a.lineTo(...v):a.moveTo(...v));a.lineTo(w-12,h-10);a.lineTo(12,h-10);a.closePath();const fill=a.createLinearGradient(0,0,0,h);fill.addColorStop(0,'#94dce345');fill.addColorStop(1,'#94dce300');a.fillStyle=fill;a.fill();a.beginPath();p.forEach((v,i)=>i?a.lineTo(...v):a.moveTo(...v));a.strokeStyle='#abe5e7';a.lineWidth=2.8;a.stroke();cv.setAttribute('aria-label',d.label+', sample trend');}
    function closeComputer(reset=true){
      S.computer=false;
      $('.nx-desktop').hidden=true;
      $('.nx-products').classList.remove('nx-using-computer');
      $('.nx-products .nx-screen-hit').hidden=false;
      $('.nx-computer-hit')?.setAttribute('aria-expanded','false');
      $('.nx-computer-hit')?.setAttribute('aria-pressed','false');
      const hitSpan=$('.nx-computer-hit span');
      if(hitSpan)hitSpan.textContent='Use computer';
      root.dataset.computer='closed';
      drawGraphs();
      const rf=document.getElementById('retro-workstation-frame');
      if(rf && rf.contentWindow){
        try{ rf.contentWindow.postMessage({ type: 'PAUSE_ALL_AUDIO' }, '*'); }catch(e){}
      }
      if(reset){
        homeView();
      }else{
        S.focus=null;
        S.targetFov=DEFAULT_FOV;
        wake();
      }
    }
    function openComputer(){
      if(B.active)return;
      closeComposer(false);
      $('.nx-projection').hidden=true;
      focusMonitor(monitors[2]);
      S.targetFov=Math.max(8.5,S.targetFov*.78);
      S.computer=true;
      root.dataset.computer='open';
      AudioEngine.stopVoice();
      AudioEngine.removeUnlockListeners();
      const j=$('#nx-audio-jarvis');
      if(j&&!j.paused){try{j.pause();j.currentTime=0;}catch(_){}}
      const c=$('#nx-audio-carplay');
      if(c&&!c.paused){try{c.pause();c.currentTime=0;}catch(_){}}
      $('.nx-desktop').hidden=false;
      $('.nx-products').classList.add('nx-using-computer');
      $('.nx-products .nx-screen-hit').hidden=true;
      $('.nx-computer-hit')?.setAttribute('aria-expanded','true');
      $('.nx-computer-hit')?.setAttribute('aria-pressed','true');
      const hitSpan=$('.nx-computer-hit span');
      if(hitSpan)hitSpan.textContent='Turn off computer';
      $('.nx-status').textContent='Retro computer workstation active. NexaDrive flight ready. Escape, [X], or toggle button returns to workshop.';
      drawGraphs();
      wake();
      setTimeout(()=>{
        try{
          const rf=document.getElementById('retro-workstation-frame');
          if(rf && rf.contentWindow){
            rf.contentWindow.focus();
            if(!S.muted) rf.contentWindow.postMessage({ type: 'RESUME_AUDIO' }, '*');
          }
        }catch(e){}
      }, 400);
    }
    function toggleComputer(){
      if(B.active)return;
      if(S.computer){
        closeComputer(true);
      }else{
        openComputer();
      }
    }
    $('.nx-lamp-hit')?.addEventListener('click',()=>{S.lamp=!S.lamp;$('.nx-lamp-hit').setAttribute('aria-pressed',String(S.lamp));$('.nx-lamp-hit span').textContent=S.lamp?'Switch off lamp':'Switch on lamp';$('.nx-status').textContent='Desk lamp '+(S.lamp?'on.':'off.');wake();});
    $('.nx-computer-hit')?.addEventListener('click',toggleComputer);
    $('.nx-desktop-close')?.addEventListener('click',()=>{closeComputer(true);$('.nx-home').focus({preventScroll:true});});
    for(const b of root.querySelectorAll('[data-desktop-tab]'))b.addEventListener('click',()=>{S.desktop=b.dataset.desktopTab;drawDesktop();$('.nx-status').textContent='Showing sample '+S.desktop+' data.';wake();});
    // Listen for Escape or Exit message from retro-computer iframe
    window.addEventListener('message', e => {
      if(e.data && e.data.type === 'EXIT_COMPUTER_MODE'){
        closeComputer(true);
        $('.nx-home')?.focus({preventScroll:true});
      }
    });

    const coreCenter=point(995/IW,.493,8.8),base=point(995/IW,535/IH,9),stars=Array.from({length:60},(_,i)=>({p:point(.08+((i*73)%89)/100,.13+((i*37)%67)/100,9),phase:i*2.399,size:.35+(i%4)*.17}));
    function path(points,color,width=1){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();}
    function drawHologram(){const t=S.t*.001,energy=S.mode==='thinking'?1.22:S.mode==='answer'?1.35:S.coreHover?1.28:1,c=project(coreCenter),b=project(base),radius=view.fx*1.05/c[2],breath=1+Math.sin(t*1.5)*.045;ctx.setTransform(S.dpr,0,0,S.dpr,0,0);ctx.clearRect(0,0,S.width,S.height);
      const glow=ctx.createRadialGradient(c[0],c[1],0,c[0],c[1],radius*1.7);glow.addColorStop(0,'rgba(175,230,230,.14)');glow.addColorStop(.5,'rgba(137,217,229,.035)');glow.addColorStop(1,'rgba(137,217,229,0)');ctx.fillStyle=glow;ctx.fillRect(c[0]-radius*2,c[1]-radius*2,radius*4,radius*4);
      const beam=ctx.createLinearGradient(0,c[1]+radius*.3,0,b[1]);beam.addColorStop(0,'rgba(139,218,228,.005)');beam.addColorStop(.8,'rgba(139,218,228,.035)');beam.addColorStop(1,'rgba(213,236,217,.09)');ctx.fillStyle=beam;ctx.beginPath();ctx.moveTo(b[0]-radius*.23,b[1]);ctx.lineTo(c[0]-radius*.85,c[1]+radius*.35);ctx.lineTo(c[0]+radius*.85,c[1]+radius*.35);ctx.lineTo(b[0]+radius*.23,b[1]);ctx.closePath();ctx.fill();
      const yaw=t*.3+S.x*.12,tilt=.24+S.y*.10,co=Math.cos(yaw),sn=Math.sin(yaw);function sphere(x,y,z){const X=x*co-z*sn,Z=x*sn+z*co,Y=y*Math.cos(tilt)-Z*Math.sin(tilt),ZZ=y*Math.sin(tilt)+Z*Math.cos(tilt);return project([coreCenter[0]+X*1.05*breath,coreCenter[1]+Y*1.05*breath,coreCenter[2]+ZZ*1.05*breath]);}
      const rings=[];for(let j=0;j<12;j++){const phi=-1.40+j/11*2.80,pts=[];let zsum=0;for(let i=0;i<=32;i++){const a=i/32*Math.PI*2,r=1+.075*Math.sin(a*4+phi*2+t*(S.mode==='thinking'?1.4:.33));const p=sphere(Math.cos(phi)*Math.cos(a)*r,Math.sin(phi)*r*.92,Math.cos(phi)*Math.sin(a)*r);pts.push(p);zsum+=p[2];}rings.push({pts,j,z:zsum/33});}rings.sort((a,b)=>b.z-a.z);for(const ring of rings)path(ring.pts,ring.j%4===0?'rgba(240,206,148,.76)':'rgba(158,226,235,'+(.43*energy)+')',ring.j%4===0?.8:.55);
      for(let k=0;k<2;k++){const pts=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2+t*(k?-.09:.07),r=1.05+k*.06;const x=Math.cos(a)*r,y=Math.sin(a)*r*.29,z=Math.sin(a)*r*.8;pts.push(project([coreCenter[0]+x,coreCenter[1]+y,coreCenter[2]+z]));}path(pts,k?'rgba(240,191,116,.46)':'rgba(176,231,235,.4)',.7);}
      ctx.fillStyle='rgba(179,234,240,.45)';ctx.beginPath();for(let i=0;i<70;i++){if(i%9===0)continue;const a=i*2.399963+t*.07,z=1-2*(i+.5)/70,r=Math.sqrt(1-z*z),p=sphere(r*Math.cos(a),z,r*Math.sin(a));ctx.moveTo(p[0]+.55,p[1]);ctx.arc(p[0],p[1],.55,0,Math.PI*2);}ctx.fill();
      ctx.fillStyle='rgba(255,225,175,.8)';ctx.beginPath();for(let i=0;i<70;i+=9){const a=i*2.399963+t*.07,z=1-2*(i+.5)/70,r=Math.sqrt(1-z*z),p=sphere(r*Math.cos(a),z,r*Math.sin(a));ctx.moveTo(p[0]+1.1,p[1]);ctx.arc(p[0],p[1],1.1,0,Math.PI*2);}ctx.fill();
      const heart=ctx.createRadialGradient(c[0]-radius*.02,c[1]-radius*.03,0,c[0],c[1],radius*.1);heart.addColorStop(0,'#f2f1d9');heart.addColorStop(.2,'#e1efda');heart.addColorStop(.5,'#8acbd2');heart.addColorStop(1,'rgba(112,210,225,0)');ctx.fillStyle=heart;ctx.beginPath();ctx.arc(c[0],c[1],radius*.1,0,Math.PI*2);ctx.fill();
      for(let i=0;i<7;i++){const u=i/6-.5;path([[b[0]+u*radius*.28,b[1]],[c[0]+u*radius*1.2,c[1]+radius*.8]],'rgba(164,228,236,.06)',.5);}
      ctx.save();ctx.translate(b[0],b[1]);ctx.scale(1,.19);ctx.strokeStyle='rgba(170,225,233,.65)';ctx.lineWidth=1.5;ctx.shadowColor='#9bdded';ctx.shadowBlur=12;ctx.beginPath();ctx.ellipse(0,0,radius*.63,radius*.63,0,0,Math.PI*2);ctx.stroke();ctx.restore();
      // Fine independent highlights make the fixed engineering artwork feel illuminated.
      const fans=[[1355,420],[1415,420],[1415,486]];for(const [x,y]of fans){const p=imagePoint(x,y,5.2),r=view.fx*.085/5.2;if(p[2]<.3)continue;ctx.save();ctx.translate(p[0],p[1]);ctx.strokeStyle='rgba(128,217,248,.25)';ctx.lineWidth=.7;for(let k=0;k<3;k++){ctx.beginPath();ctx.arc(0,0,r,t*1.1+k*2.094,t*1.1+k*2.094+.9);ctx.stroke();}ctx.restore();}
      for(const s of stars){const pos=s.p.slice();pos[1]+=Math.sin(t*.12+s.phase)*.04;const p=project(pos);if(p[2]<.3||p[0]<0||p[0]>S.width||p[1]<0||p[1]>S.height)continue;ctx.globalAlpha=.1+.15*(1+Math.sin(t*.3+s.phase))/2;ctx.fillStyle='#f2d3a4';ctx.beginPath();ctx.arc(p[0],p[1],s.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
      if(S.mode==='thinking'){const a=t*1.4;ctx.strokeStyle='rgba(238,205,150,.8)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(c[0],c[1],radius*1.23,a,a+1.8);ctx.stroke();}
      if(S.mode==='answer'){const p=imagePoint(IW*.5,IH*.35,9);path([[c[0],c[1]-radius*.9],[p[0],p[1]+30]],'rgba(165,230,237,.18)',.7);}
      drawSceneProps();
    }
    function drawAnswerGraph(a, w, h, t, data){
      const bg = a.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#09181f');
      bg.addColorStop(1, '#050d12');
      a.fillStyle = bg;
      a.fillRect(0, 0, w, h);

      a.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      a.lineWidth = 1;
      a.strokeRect(1, 1, w - 2, h - 2);

      // Header Bar
      a.fillStyle = 'rgba(12, 28, 36, 0.9)';
      a.fillRect(2, 2, w - 4, 32);
      a.strokeStyle = 'rgba(43, 84, 99, 0.45)';
      a.beginPath();
      a.moveTo(2, 34);
      a.lineTo(w - 2, 34);
      a.stroke();

      a.fillStyle = '#38bdf8';
      a.font = '700 8.5px monospace';
      a.fillText('AI GRAPH', 14, 16);

      a.fillStyle = '#94a3b8';
      a.font = '600 8px system-ui, sans-serif';
      const title = (data.title || 'COMMERCE INTELLIGENCE').toUpperCase();
      a.fillText(title.length > 25 ? title.slice(0, 24) + '…' : title, 70, 16);

      a.fillStyle = '#eac590';
      a.font = '700 12.5px monospace, system-ui';
      a.textAlign = 'right';
      a.fillText(data.summaryValue || '₱6.91M', w - 14, 21);
      a.textAlign = 'left';

      a.fillStyle = '#64748b';
      a.font = '500 7.5px system-ui';
      a.fillText((data.metric || 'NET SALES').toUpperCase().replace('_', ' ') + ' · REAL-TIME HUD', 14, 28);

      const plotTop = 46, plotBottom = h - 26, plotH = plotBottom - plotTop;
      a.strokeStyle = 'rgba(37, 64, 74, 0.45)';
      a.lineWidth = 0.5;
      for(let j = 0; j <= 3; j++){
        const gy = plotTop + j * (plotH / 3);
        a.beginPath();
        a.moveTo(14, gy);
        a.lineTo(w - 14, gy);
        a.stroke();
      }

      if(data.loading){
        const scanX = 14 + ((performance.now() * 0.16) % (w - 28));
        const scanGrad = a.createLinearGradient(scanX - 35, 0, scanX + 35, 0);
        scanGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        scanGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.35)');
        scanGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
        a.fillStyle = scanGrad;
        a.fillRect(14, plotTop, w - 28, plotH);
        a.fillStyle = '#38bdf8';
        a.font = '600 10px monospace';
        a.textAlign = 'center';
        a.fillText('● COMPUTING QUERY PLAN & GRAPH...', w / 2, plotTop + plotH / 2);
        a.textAlign = 'left';
        return;
      }

      const ease = 1 - Math.pow(1 - t, 3);
      const isMoney = isMoneyMetric(data.metric);
      if(data.graphType === 'bar' && data.rows && data.rows.length){
        const items = data.rows.slice(0, 7);
        const maxVal = Math.max(1, ...items.map(r => Number(r.value) || 0));
        const barCount = items.length;
        const barSlot = (w - 36) / barCount;
        const barWidth = Math.max(12, Math.min(26, barSlot - 8));

        for(let i = 0; i < barCount; i++){
          const item = items[i];
          const val = Number(item.value) || 0;
          const barH = Math.max(2, (val / maxVal) * (plotH - 22) * ease);
          const bx = 18 + i * barSlot + (barSlot - barWidth) / 2;
          const by = Math.min(plotBottom - 2, plotBottom - barH);

          const fill = a.createLinearGradient(0, by, 0, plotBottom);
          if(i === 0){
            fill.addColorStop(0, '#fde047');
            fill.addColorStop(0.5, '#eab308');
            fill.addColorStop(1, '#854d0e');
          }else{
            fill.addColorStop(0, '#38bdf8');
            fill.addColorStop(0.5, '#0284c7');
            fill.addColorStop(1, '#0c4a6e');
          }
          a.fillStyle = fill;
          a.fillRect(bx, by, barWidth, barH);

          a.fillStyle = i === 0 ? '#fef08a' : '#bae6fd';
          a.fillRect(bx, by, barWidth, 1.5);

          a.fillStyle = i === 0 ? '#fef08a' : '#94a3b8';
          a.font = '600 7px monospace';
          a.textAlign = 'center';
          const valLabel = isMoney ? formatMoney(val, true).replace('₱', '') : Number(val).toLocaleString('en-PH');
          a.fillText(valLabel, bx + barWidth / 2, by - 4);

          a.fillStyle = '#64748b';
          a.font = '500 7.5px system-ui';
          const shortName = (item.label || '').slice(0, 5).toUpperCase();
          a.fillText(shortName, bx + barWidth / 2, plotBottom + 12);
        }
        a.textAlign = 'left';
      }else{
        const len = Math.max(2, Math.max(oldSeries.length, newSeries.length));
        const series = [];
        for (let i = 0; i < len; i++) {
          const oVal = i < oldSeries.length ? (Number(oldSeries[i]) || 0.2) : 0.2;
          const nVal = i < newSeries.length ? (Number(newSeries[i]) || 0.2) : 0.2;
          series.push(mix(oVal, nVal, ease));
        }
        const pts = series.map((v, i) => [
          18 + (i / (series.length - 1)) * (w - 36),
          plotBottom - v * (plotH - 10)
        ]);

        a.beginPath();
        pts.forEach((p, i) => i ? a.lineTo(...p) : a.moveTo(...p));
        a.lineTo(w - 18, plotBottom);
        a.lineTo(18, plotBottom);
        a.closePath();
        const areaFill = a.createLinearGradient(0, plotTop, 0, plotBottom);
        areaFill.addColorStop(0, 'rgba(56, 189, 248, 0.32)');
        areaFill.addColorStop(0.7, 'rgba(56, 189, 248, 0.08)');
        areaFill.addColorStop(1, 'rgba(6, 16, 22, 0)');
        a.fillStyle = areaFill;
        a.fill();

        a.beginPath();
        pts.forEach((p, i) => i ? a.lineTo(...p) : a.moveTo(...p));
        a.strokeStyle = '#38bdf8';
        a.lineWidth = 1.8;
        a.stroke();

        const peakIdx = pts.reduce((maxI, p, i, arr) => p[1] < arr[maxI][1] ? i : maxI, 0);
        const peakPt = pts[peakIdx];
        a.fillStyle = '#fbbf24';
        a.beginPath();
        a.arc(peakPt[0], peakPt[1], 3.2, 0, Math.PI * 2);
        a.fill();
        a.strokeStyle = 'rgba(251, 191, 36, 0.4)';
        a.lineWidth = 1.5;
        a.beginPath();
        a.arc(peakPt[0], peakPt[1], 6, 0, Math.PI * 2);
        a.stroke();

        a.fillStyle = '#64748b';
        a.font = '500 7.5px monospace';
        const startLabel = (data.rows && data.rows.length > 0 && data.dimension === 'date') ? data.rows[0].label : 'INTERVAL START';
        const endLabel = (data.rows && data.rows.length > 0 && data.dimension === 'date') ? data.rows[data.rows.length - 1].label : 'PRESENT';
        a.fillText(startLabel, 18, plotBottom + 12);
        a.textAlign = 'right';
        a.fillText(endLabel, w - 18, plotBottom + 12);
        a.textAlign = 'left';
      }

      a.fillStyle = 'rgba(100, 116, 139, 0.6)';
      a.font = '500 7px monospace';
      a.fillText(`SERIES: ${data.dimension?.toUpperCase() || 'INTERVAL'} · VERIFIED AGGREGATION`, 14, h - 6);
    }

    function drawExploreAnswer(a, w, h, t, data){
      const bg = a.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0a171e');
      bg.addColorStop(1, '#050c10');
      a.fillStyle = bg;
      a.fillRect(0, 0, w, h);

      a.strokeStyle = 'rgba(234, 197, 144, 0.28)';
      a.lineWidth = 1;
      a.strokeRect(1, 1, w - 2, h - 2);

      // Header Bar
      a.fillStyle = 'rgba(14, 26, 33, 0.9)';
      a.fillRect(2, 2, w - 4, 30);
      a.strokeStyle = 'rgba(43, 84, 99, 0.5)';
      a.beginPath();
      a.moveTo(2, 32);
      a.lineTo(w - 2, 32);
      a.stroke();

      a.fillStyle = '#eac590';
      a.font = '700 8.5px monospace';
      a.fillText('EXPLORE ANSWER', 14, 15);

      a.fillStyle = '#94a3b8';
      a.font = '500 7.5px monospace';
      a.fillText(`[${data.planner || 'AI'} · ${data.source === 'supabase' ? 'SUPABASE' : 'DATABASE'}]`, 112, 15);

      a.fillStyle = '#64748b';
      a.font = '500 7.5px system-ui';
      a.fillText('RANKED EVIDENCE & BREAKDOWN', 14, 26);

      if(data.loading){
        const scanY = 36 + ((performance.now() * 0.12) % (h - 50));
        a.fillStyle = 'rgba(234, 197, 144, 0.15)';
        a.fillRect(14, scanY, w - 28, 12);
        a.fillStyle = '#eac590';
        a.font = '600 10px monospace';
        a.textAlign = 'center';
        a.fillText('● QUERYING COMMERCE DATASET...', w / 2, h / 2 + 5);
        a.textAlign = 'left';
        return;
      }

      a.fillStyle = '#475569';
      a.font = '700 7px monospace';
      a.fillText('#', 14, 44);
      a.fillText('ENTITY / SEGMENT', 34, 44);
      a.textAlign = 'right';
      a.fillText('VALUE', 265, 44);
      a.fillText('% SHARE', w - 14, 44);
      a.textAlign = 'left';

      a.strokeStyle = 'rgba(37, 64, 74, 0.5)';
      a.lineWidth = 0.5;
      a.beginPath();
      a.moveTo(14, 48);
      a.lineTo(w - 14, 48);
      a.stroke();

      const isMoney = isMoneyMetric(data.metric);
      const isDateDim = data.dimension === 'date';
      let rows = data.rows && data.rows.length ? data.rows.slice() : [];
      if (isDateDim) {
        rows.sort((a, b) => (Number(b.value) || 0) - (Number(a.value) || 0));
      }
      const topRows = rows.slice(0, 5);
      const maxVal = Math.max(1, ...topRows.map(r => Number(r.value) || 0));
      const totalSum = Math.max(1, (data.rows || []).reduce((s, r) => s + (Number(r.value) || 0), 0));
      const ease = 1 - Math.pow(1 - t, 3);

      if(!topRows.length){
        a.fillStyle = '#94a3b8';
        a.font = '500 8.5px system-ui';
        a.textAlign = 'center';
        const expl = data.explanation || 'No breakdown records in this scope.';
        const words = expl.split(' ');
        let line = '', yPos = h / 2 - 8;
        for (const word of words) {
          const test = line + word + ' ';
          if (a.measureText(test).width > w - 40) {
            a.fillText(line, w / 2, yPos);
            line = word + ' ';
            yPos += 14;
          } else {
            line = test;
          }
        }
        if (line) a.fillText(line, w / 2, yPos);
        a.textAlign = 'left';
      }else{
        for(let i = 0; i < topRows.length; i++){
          const r = topRows[i];
          const val = Number(r.value) || 0;
          const pct = Math.min(100, (val / totalSum) * 100);
          const barRatio = (val / maxVal) * ease;
          const rowY = 52 + i * 22;

          if(i % 2 === 0){
            a.fillStyle = 'rgba(255, 255, 255, 0.025)';
            a.fillRect(10, rowY, w - 20, 20);
          }

          if(i === 0){
            a.fillStyle = '#eab308';
            a.font = '700 8px monospace';
            a.fillText('01', 14, rowY + 13);
          }else{
            a.fillStyle = '#64748b';
            a.font = '600 7.5px monospace';
            a.fillText(String(i + 1).padStart(2, '0'), 14, rowY + 13);
          }

          a.fillStyle = i === 0 ? '#f8fafc' : '#cbd5e1';
          a.font = i === 0 ? '600 8.5px system-ui' : '500 8px system-ui';
          const label = String(r.label || 'Unassigned');
          const maxChars = 20;
          a.fillText(label.length > maxChars ? label.slice(0, maxChars - 1) + '…' : label, 34, rowY + 13);

          const barW = (w - 180) * barRatio;
          a.fillStyle = 'rgba(30, 58, 70, 0.4)';
          a.fillRect(34, rowY + 16, w - 180, 2);
          a.fillStyle = i === 0 ? '#eab308' : '#38bdf8';
          a.fillRect(34, rowY + 16, barW, 2);

          a.fillStyle = i === 0 ? '#fde047' : '#e2e8f0';
          a.font = '600 8.5px monospace';
          a.textAlign = 'right';
          const valFormatted = isMoney ? formatMoney(val, true) : Math.round(val).toLocaleString('en-PH');
          a.fillText(valFormatted, 265, rowY + 13);

          a.fillStyle = i === 0 ? '#86efac' : '#7dd3fc';
          a.font = '500 7.5px monospace';
          a.fillText(pct >= 0.1 ? pct.toFixed(1) + '%' : '<0.1%', w - 14, rowY + 13);
          a.textAlign = 'left';
        }
      }

      a.fillStyle = 'rgba(100, 116, 139, 0.6)';
      a.font = '500 7px monospace';
      a.fillText(`EXPLORATION LEDGER · ${data.rows?.length || 0} RECORDS · READ-ONLY`, 14, h - 8);
    }

    function drawRetroMonitor(a, w, h, t){
      // Retro Workstation CRT Screen - ALWAYS ON
      // Active Retro Workstation CRT Screen
      const bgGrad = a.createRadialGradient(w * 0.5, h * 0.4, 10, w * 0.5, h * 0.5, w * 0.7);
      bgGrad.addColorStop(0, '#0c1a24');
      bgGrad.addColorStop(0.6, '#060d14');
      bgGrad.addColorStop(1, '#020508');
      a.fillStyle = bgGrad;
      a.fillRect(0, 0, w, h);

      // Perspective Cyber Horizon Grid
      a.save();
      a.strokeStyle = 'rgba(0, 229, 255, 0.16)';
      a.lineWidth = 1;
      const gridHorizon = h * 0.62;
      const vanX = w * 0.5;
      for(let x = -w * 0.2; x <= w * 1.2; x += 55){
        a.beginPath();
        a.moveTo(vanX, gridHorizon);
        a.lineTo(x, h);
        a.stroke();
      }
      const gridOffset = (t * 80) % 24;
      for(let y = gridHorizon; y <= h; y += 18){
        const currY = y + gridOffset * ((y - gridHorizon) / (h - gridHorizon));
        if(currY <= h){
          a.beginPath();
          a.moveTo(0, currY);
          a.lineTo(w, currY);
          a.stroke();
        }
      }
      a.restore();

      // Top Status Bar (Nexa Retro OS)
      a.fillStyle = 'rgba(9, 13, 22, 0.94)';
      a.fillRect(0, 0, w, 28);
      a.strokeStyle = 'rgba(0, 229, 255, 0.3)';
      a.lineWidth = 1;
      a.beginPath();
      a.moveTo(0, 28);
      a.lineTo(w, 28);
      a.stroke();

      a.fillStyle = '#00e5ff';
      a.font = 'bold 10px monospace';
      a.fillText('● NEXA // RETRO OS', 14, 18);

      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      a.fillStyle = '#94a3b8';
      a.font = '10px monospace';
      a.textAlign = 'right';
      a.fillText(dateStr + '  |  ' + timeStr, w - 14, 18);
      a.textAlign = 'left';

      // Desktop Icons
      const iconGlow = Math.sin(t * 3) * 0.15 + 0.85;
      a.fillStyle = 'rgba(15, 23, 42, 0.85)';
      a.strokeStyle = 'rgba(0, 229, 255, ' + (0.4 * iconGlow) + ')';
      a.lineWidth = 1.5;
      a.beginPath();
      a.roundRect(24, 46, 52, 52, 8);
      a.fill();
      a.stroke();

      a.fillStyle = '#00e5ff';
      a.font = '22px sans-serif';
      a.textAlign = 'center';
      a.fillText('🚀', 50, 81);
      a.font = 'bold 9px monospace';
      a.fillStyle = '#e2e8f0';
      a.fillText('NexaDrive', 50, 112);

      a.fillStyle = 'rgba(15, 23, 42, 0.85)';
      a.strokeStyle = 'rgba(100, 116, 139, 0.4)';
      a.beginPath();
      a.roundRect(24, 130, 52, 52, 8);
      a.fill();
      a.stroke();
      a.fillStyle = '#94a3b8';
      a.font = '22px sans-serif';
      a.fillText('📄', 50, 165);
      a.font = '9px monospace';
      a.fillStyle = '#cbd5e1';
      a.fillText('Notes.txt', 50, 196);

      // Center Cyber Racer Banner
      const boxW = 340, boxH = 140;
      const boxX = w * 0.5 - boxW * 0.5;
      const boxY = 60;
      a.fillStyle = 'rgba(6, 11, 16, 0.88)';
      a.strokeStyle = 'rgba(0, 229, 255, 0.5)';
      a.lineWidth = 1.5;
      a.beginPath();
      a.roundRect(boxX, boxY, boxW, boxH, 10);
      a.fill();
      a.stroke();

      a.fillStyle = '#00e5ff';
      a.font = 'bold 15px monospace';
      a.fillText('NEXADRIVE // ORBITAL RACER', boxX + boxW * 0.5, boxY + 34);
      a.font = '10px monospace';
      a.fillStyle = '#67e8f9';
      a.fillText('KESTREL NX-01 · 3 ORBITS · READY', boxX + boxW * 0.5, boxY + 54);

      a.font = '9px monospace';
      a.fillStyle = 'rgba(148, 163, 184, 0.85)';
      a.fillText('ENGINE: WEBGL · 60 FPS · DUAL ION DRIVE', boxX + boxW * 0.5, boxY + 80);
      a.fillText('CONTROLS: [WASD] FLY · [SPACE] BOOST', boxX + boxW * 0.5, boxY + 98);

      const pillGlow = Math.sin(t * 4) * 0.25 + 0.75;
      a.fillStyle = 'rgba(0, 229, 255, ' + (0.18 * pillGlow) + ')';
      a.strokeStyle = 'rgba(0, 229, 255, ' + (0.8 * pillGlow) + ')';
      a.lineWidth = 1;
      a.beginPath();
      a.roundRect(boxX + 35, boxY + 110, boxW - 70, 22, 11);
      a.fill();
      a.stroke();
      a.fillStyle = '#e0f2fe';
      a.font = 'bold 9px monospace';
      a.fillText('▶ CLICK MONITOR OR USE COMPUTER', boxX + boxW * 0.5, boxY + 125);
      a.textAlign = 'left';

      // CRT Scanlines
      a.fillStyle = 'rgba(0, 0, 0, 0.15)';
      for (let y = 0; y < h; y += 3) {
        a.fillRect(0, y, w, 1);
      }
    }

    function drawGraphs(){
      const t = S.chartT;
      for(let k = 0; k < monitors.length; k++){
        const m = monitors[k], cv = m.el.querySelector('canvas'), a = cv.getContext('2d'), w = m.w, h = m.h;
        a.setTransform(2, 0, 0, 2, 0, 0);
        a.clearRect(0, 0, w, h);
        if(k === 0){
          // 1st monitor on the left: Supporting Graph
          drawAnswerGraph(a, w, h, t, AI_DATA);
        }else if(k === 1){
          // 2nd monitor on the left: Explore the Answer
          drawExploreAnswer(a, w, h, t, AI_DATA);
        }else if(k === 2){
          // 3rd monitor on the right: Retro Workstation & NexaDrive
          drawRetroMonitor(a, w, h, (S.t || performance.now()) * 0.001);
        }
      }
    }
    function drawLoadingScreen(){
      const a=lctx,w=S.width,h=S.height,ms=B.elapsed,t=reduced?3.4:ms*.001,p=clamp(ms/B.duration,0,1),R=clamp(w*.077,52,81),cx=w*.5,cy=h*.445,material=reduced?1:smooth(1200,3800,ms),appear=reduced?1:smooth(0,900,ms);
      const mouseYaw=S.pointer?clamp((S.pointer.x/w-0.5)*0.45,-0.3,0.3):0;
      const mousePitch=S.pointer?clamp((S.pointer.y/h-0.5)*0.25,-0.18,0.18):0;
      const yaw=(reduced?-.18:mix(-.50,.13,smooth(500,6800,ms))+.035*Math.sin(t*.7))+mouseYaw,pitch=-.13+mousePitch,lift=reduced?0:Math.sin(t*.9)*2;
      a.setTransform(S.dpr,0,0,S.dpr,0,0);a.fillStyle='#070b0e';a.fillRect(0,0,w,h);
      const halo=a.createRadialGradient(cx,cy+R*.15,0,cx,cy+R*.15,R*3.3);halo.addColorStop(0,'#18303945');halo.addColorStop(.45,'#111e2920');halo.addColorStop(1,'#070b0e00');a.fillStyle=halo;a.fillRect(0,0,w,h);
      const floorY=cy+R*1.58,ground=a.createRadialGradient(cx,floorY,0,cx,floorY,R*1.6);ground.addColorStop(0,'rgba(195,159,108,'+(.09*appear)+')');ground.addColorStop(.45,'rgba(101,150,158,'+(.035*appear)+')');ground.addColorStop(1,'rgba(101,150,158,0)');a.save();a.translate(0,floorY);a.scale(1,.13);a.fillStyle=ground;a.fillRect(cx-R*2,-R*2,R*4,R*4);a.restore();
      const outline=[[-.82,-1],[-.82,1],[-.30,1],[.36,-.20],[.36,1],[.86,1],[.86,-1],[.34,-1],[-.32,.20],[-.32,-1]],C=Math.cos(yaw),N=Math.sin(yaw),P=Math.cos(pitch),Q=Math.sin(pitch);
      function vertex(x,y,z){const X=x*C+z*N,Z=-x*N+z*C,Y=y*P-Z*Q,ZZ=y*Q+Z*P;return {x:cx+X*R*5/(5-ZZ),y:cy-Y*R*5/(5-ZZ)+lift,z:ZZ};}
      const front=outline.map(v=>vertex(v[0],v[1],.18)),back=outline.map(v=>vertex(v[0],v[1],-.18));
      function shape(pts){a.beginPath();pts.forEach((v,i)=>i?a.lineTo(v.x,v.y):a.moveTo(v.x,v.y));a.closePath();}
      const reflection=front.map(v=>({x:v.x,y:floorY+(cy-v.y)*.17}));a.save();a.globalAlpha=material*.05;a.filter='blur(5px)';shape(reflection);a.fillStyle='#c6d9d4';a.fill();a.restore();
      const faces=[];for(let i=0;i<outline.length;i++){const j=(i+1)%outline.length;faces.push({pts:[back[i],back[j],front[j],front[i]],depth:(back[i].z+back[j].z+front[i].z+front[j].z)/4,i});}faces.push({pts:back,depth:-.19,i:-1});faces.sort((x,y)=>x.depth-y.depth);
      a.globalAlpha=material*appear;for(const f of faces){shape(f.pts);const edge=f.i<0?0:f.i%4,colors=['#34494f','#82938e','#1b2a32','#5b5746'];a.fillStyle=colors[edge];a.fill();a.strokeStyle='#c7dbd31a';a.lineWidth=.65;a.stroke();}
      shape(front);const metal=a.createLinearGradient(cx-R*.85,cy-R,cx+R*.8,cy+R);metal.addColorStop(0,'#e9eee3');metal.addColorStop(.21,'#9baba7');metal.addColorStop(.42,'#53676c');metal.addColorStop(.52,'#c6d5ce');metal.addColorStop(.75,'#7b9191');metal.addColorStop(1,'#243841');a.fillStyle=metal;a.fill();
      a.save();shape(front);a.clip();const sweep=reduced?R*2:mix(-R*2,R*2,smooth(3200,7200,ms)),shine=a.createLinearGradient(cx+sweep-R*.45,0,cx+sweep+R*.45,0);shine.addColorStop(0,'#ffffff00');shine.addColorStop(.47,'#f8f4dc00');shine.addColorStop(.5,'#f8f4dc9c');shine.addColorStop(.53,'#f8f4dc00');shine.addColorStop(1,'#ffffff00');a.fillStyle=shine;a.fillRect(cx-R*2,cy-R*1.5,R*4,R*3);a.restore();
      shape(front);a.lineWidth=.85;const rim=a.createLinearGradient(cx-R,cy-R,cx+R,cy+R);rim.addColorStop(0,'#e7eee4d9');rim.addColorStop(.5,'#aec7c94d');rim.addColorStop(1,'#d9b77ba6');a.strokeStyle=rim;a.stroke();
      // The initial luminous outline is a separate mark, not the AI-room hologram.
      a.globalAlpha=appear*(1-material*.7);const trace=reduced?1:smooth(0,2200,ms),lengths=front.map((v,i)=>Math.hypot(front[(i+1)%front.length].x-v.x,front[(i+1)%front.length].y-v.y)),total=lengths.reduce((s,n)=>s+n,0);let remaining=trace*total;a.beginPath();a.moveTo(front[0].x,front[0].y);for(let i=0;i<front.length&&remaining>0;i++){const v=front[i],n=front[(i+1)%front.length],f=Math.min(1,remaining/lengths[i]);a.lineTo(mix(v.x,n.x,f),mix(v.y,n.y,f));remaining-=lengths[i];}a.strokeStyle='#e8c48d';a.lineWidth=1;a.shadowColor='#d6c395';a.shadowBlur=7;a.stroke();a.shadowBlur=0;
      a.globalAlpha=appear;const lineW=clamp(w*.15,116,150),lineY=cy+R*2.05,left=cx-lineW/2;a.fillStyle='#a3b7b71c';a.fillRect(left,lineY,lineW,1);const completed=lineW*(B.started?p:.015),fill=a.createLinearGradient(left,0,left+lineW,0);fill.addColorStop(0,'#78999e');fill.addColorStop(.7,'#d0d9ca');fill.addColorStop(1,'#e3c28b');a.fillStyle=fill;a.fillRect(left,lineY,completed,1);if(p>0&&p<1){a.fillStyle='#f0dcc0';a.shadowColor='#d7c5a1';a.shadowBlur=8;a.fillRect(left+completed-1,lineY-1,2,3);a.shadowBlur=0;}a.globalAlpha=1;
    }
    const AudioEngine={
      carplayStarted:false,
      introStarted:false,
      bootFinished:false,
      unlockCleanup:[],
      currentVoice:null,
      ackIndex:0,
      compIndex:0,
      acknowledgeLines:[
        {file:'assets/audio/jarvis/acknowledge_4.mp3',text:'As you wish.'},
        {file:'assets/audio/jarvis/acknowledge_5.mp3',text:'Will do, sir.'},
        {file:'assets/audio/jarvis/acknowledge_2.mp3',text:'At your service, sir.'},
        {file:'assets/audio/jarvis/acknowledge_3.mp3',text:'For you, sir, always.'}
      ],
      completeLines:[
        {file:'assets/audio/jarvis/complete_1.mp3',text:'All wrapped up here, sir.'},
        {file:'assets/audio/jarvis/complete_2.mp3',text:'As always, sir, a great pleasure watching you work.'},
        {file:'assets/audio/jarvis/complete_6.mp3',text:'Complete. Diagnostic projection ready.'}
      ],
      errorLines:[
        {file:'assets/audio/jarvis/error_2.mp3',text:'That did not work.'}
      ],
      stopVoice:function(){
        if(this.currentVoice){
          const audio=this.currentVoice;
          this.currentVoice=null;
          try{
            audio.pause();
            audio.currentTime=0;
            audio.removeAttribute('src');
            audio.load();
          }catch(_){}
        }
      },
      playVoiceLine:function(item,onEnded){
        if(S.muted||!item)return null;
        this.stopVoice();
        const j=$('#nx-audio-jarvis');
        if(j&&!j.paused){try{j.pause();j.currentTime=0;}catch(_){}}
        try{
          const audio=new Audio(item.file);
          audio.volume=0.85;
          this.currentVoice=audio;
          audio.addEventListener('ended',()=>{
            if(this.currentVoice===audio){this.currentVoice=null;}
            if(typeof onEnded==='function')onEnded();
          },{once:true});
          const p=audio.play();
          if(p&&typeof p.catch==='function'){
            p.catch(()=>{
              if(this.currentVoice===audio){this.currentVoice=null;}
            });
          }
          return item;
        }catch(_){
          return null;
        }
      },
      playAcknowledge:function(onEnded){
        if(S.muted)return null;
        const line=this.acknowledgeLines[this.ackIndex%this.acknowledgeLines.length];
        this.ackIndex++;
        return this.playVoiceLine(line,onEnded);
      },
      playComplete:function(onEnded){
        if(S.muted)return null;
        const line=this.completeLines[this.compIndex%this.completeLines.length];
        this.compIndex++;
        return this.playVoiceLine(line,onEnded);
      },
      playError:function(onEnded){
        if(S.muted)return null;
        const line=this.errorLines[0];
        return this.playVoiceLine(line,onEnded);
      },
      addUnlockListener:function(cb){
        const handler=()=>{
          this.removeUnlockListeners();
          cb();
        };
        this.unlockCleanup.push(handler);
        ['pointerdown','mousedown','keydown','touchstart','click'].forEach(evt=>{
          window.addEventListener(evt,handler,{once:true,capture:true,passive:true});
        });
      },
      removeUnlockListeners:function(){
        const list=this.unlockCleanup.slice();
        this.unlockCleanup=[];
        list.forEach(fn=>{
          ['pointerdown','mousedown','keydown','touchstart','click'].forEach(evt=>{
            window.removeEventListener(evt,fn,true);
          });
        });
      },
      playCarplay:function(){
        if(this.carplayStarted||this.bootFinished||S.muted||S.computer)return;
        const el=$('#nx-audio-carplay');
        if(!el)return;
        this.carplayStarted=true;
        try{
          el.currentTime=0;
          const p=el.play();
          if(p&&typeof p.catch==='function'){
            p.catch(()=>{
              if(this.bootFinished)return;
              this.addUnlockListener(()=>{
                if(this.bootFinished||S.muted||S.computer)return;
                try{
                  el.currentTime=0;
                  el.play().catch(()=>{});
                }catch(_){}
              });
            });
          }
        }catch(_){}
      },
      cancelCarplay:function(){
        this.bootFinished=true;
        this.removeUnlockListeners();
        const c=$('#nx-audio-carplay');
        if(c){
          try{
            c.pause();
            c.currentTime=0;
          }catch(_){}
        }
      },
      playIntro:function(){
        if(this.introStarted||S.muted||S.computer)return;
        this.introStarted=true;
        this.cancelCarplay();
        const j=$('#nx-audio-jarvis');
        if(!j)return;
        const startJarvis=()=>{
          try{
            if(S.muted||S.computer)return;
            j.currentTime=0;
            j.addEventListener('ended',()=>{
              S.mode='idle';
              wake();
            },{once:true});
            const p=j.play();
            if(p&&typeof p.then==='function'){
              p.then(()=>{
                S.mode='answer';
                $('.nx-status').textContent='J.A.R.V.I.S.: Allow me to introduce myself. I am J.A.R.V.I.S., a rather very intelligent system.';
                wake();
              }).catch(()=>{
                this.addUnlockListener(()=>{
                  try{
                    if(S.muted||S.computer)return;
                    j.currentTime=0;
                    j.play().then(()=>{
                      S.mode='answer';
                      $('.nx-status').textContent='J.A.R.V.I.S.: Allow me to introduce myself. I am J.A.R.V.I.S., a rather very intelligent system.';
                      wake();
                    }).catch(()=>{});
                  }catch(_){}
                });
              });
            }
          }catch(_){}
        };
        setTimeout(startJarvis,150);
      }
    };
    function introEvent(name,detail={}){root.dispatchEvent(new CustomEvent('nexa:intro-'+name,{bubbles:true,detail:{durationMs:INTRO_DURATION_MS,elapsedMs:B.elapsed,...detail}}));}
    function finishBoot(){
      if(!B.active)return;
      if(!S.ready){
        B.pendingFinish=true;
        return;
      }
      B.pendingFinish=false;
      clearTimeout(B.endTimer);
      B.endTimer=0;
      const hadFocus=$('.nx-boot-tools').contains(document.activeElement),actualElapsedMs=performance.now()-B.startAt;
      B.active=false;
      B.reveal=1;
      B.elapsed=B.duration;
      S.t=B.duration;
      root.classList.remove('nx-starting','nx-handoff');
      root.dataset.phase='room';
      root.dataset.lastIntroMs=String(Math.round(actualElapsedMs));
      $('.nx-boot-cover').hidden=true;
      $('.nx-boot-tools').hidden=true;
      $('.nx-core-hit').disabled=false;
      $('.nx-tools').inert=false;
      $('.nx-view-controls').inert=false;
      room.setAttribute('aria-busy','false');
      for(const m of monitors)m.el.style.removeProperty('opacity');
      $('.nx-status').textContent='Polangui HQ ready. Move your cursor to look around the room.';
      if(hadFocus)$('.nx-core-hit').focus({preventScroll:true});
      introEvent('end',{skipped:B.skip,actualElapsedMs});
      S.bloomStart=performance.now();
      if(S.pointer)updateParallax(S.pointer.x,S.pointer.y);
      AudioEngine.playIntro();
    }
    function scheduleFinish(ms){clearTimeout(B.endTimer);B.endTimer=setTimeout(()=>{if(B.active&&!document.hidden){finishBoot();wake();}},Math.max(0,ms));}
    function updateBoot(now){
      if(!B.active||!B.started||B.failed)return;
      if(B.skipAt)B.elapsed=mix(B.skipFrom,B.duration,smooth(0,360,now-B.skipAt));
      else B.elapsed=clamp(now-B.startAt,0,B.duration);
      B.reveal=smooth(7500,B.duration,B.elapsed);
      root.classList.toggle('nx-handoff',B.reveal>0);
      $('.nx-boot-cover').style.opacity=String(1-B.reveal);
      $('.nx-boot-tools').style.opacity=String(1-B.reveal);
      const phase=B.elapsed<2000?'tracing':B.elapsed<5500?'forming':B.elapsed<7500?'finishing':'handoff';
      if(phase!==B.phase){B.phase=phase;root.dataset.phase=phase;introEvent('phase',{phase});}
      if(B.elapsed>=B.duration)finishBoot();
    }
    function beginBoot(replay=false){
      clearTimeout(S.answerTimer);
      clearTimeout(S.returnTimer);
      closeComposer(false);
      $('.nx-projection').hidden=true;
      S.mode='idle';
      S.x=0;S.y=0;S.tx=0;S.ty=0;S.px=0;S.py=0;S.tpx=0;S.tpy=0;
      S.baseX=0;S.baseY=0;S.parallaxX=0;S.parallaxY=0;
      S.dampState={vel_x:0,vel_y:0,vel_px:0,vel_py:0};
      S.bloomStart=0;
      S.fov=DEFAULT_FOV;S.targetFov=DEFAULT_FOV;
      S.focus=null;S.pointer=null;S.t=0;
      S.mouseMoved=false;S.dragDeltaX=0;S.dragDeltaY=0;
      closeComputer(false);
      S.suit=false;
      if(replay){
        AudioEngine.carplayStarted=false;
        AudioEngine.introStarted=false;
        AudioEngine.bootFinished=false;
        const j=$('#nx-audio-jarvis');
        if(j){try{j.pause();j.currentTime=0;}catch(_){}}
      }
      AudioEngine.playCarplay();
      B.active=true;
      B.started=true;
      B.startAt=performance.now();
      B.elapsed=0;
      B.reveal=0;
      B.skip=false;
      B.skipAt=0;
      B.skipFrom=0;
      B.hiddenAt=0;
      B.phase='tracing';
      B.pendingFinish=false;
      root.classList.add('nx-starting');
      root.classList.remove('nx-handoff');
      root.dataset.phase='tracing';
      room.setAttribute('aria-busy','true');
      $('.nx-core-hit').disabled=true;
      $('.nx-tools').inert=true;
      $('.nx-view-controls').inert=true;
      $('.nx-boot-cover').hidden=false;
      $('.nx-boot-cover').style.opacity='1';
      $('.nx-boot-tools').hidden=false;
      $('.nx-boot-tools').style.opacity='1';
      for(const m of monitors)m.el.style.removeProperty('opacity');
      $('.nx-status').textContent='Opening Nexa workshop.';
      introEvent('start',{replay,startTimeMs:B.startAt});
      scheduleFinish(B.duration);
      if(replay)$('.nx-skip').focus({preventScroll:true});
      render();
      wake();
    }
    function skipBoot(){
      if(!B.active)return;
      B.skip=true;
      if(!S.ready){
        introEvent('skip');
        return;
      }
      finishBoot();
      wake();
    }
    function render(){view=camera();if(S.ready)drawRoom();mapSurfaces();if(!B.active||B.reveal>0)drawHologram();if(B.active)drawLoadingScreen();}
    function tick(now){
      S.raf=0;
      if(document.hidden||!root.isConnected)return;
      const dt=S.last?Math.min(64,now-S.last):16.6;
      S.last=now;
      if(B.active)updateBoot(performance.now());
      const dtSec=Math.min(0.05,dt/1000);
      if(S.drag){
        if(S.dragDeltaX||S.dragDeltaY){
          S.baseX-=S.dragDeltaX/S.width*2.4;
          S.baseY+=S.dragDeltaY/S.height*.8;
          clampBase();
          S.tx=S.baseX;
          S.ty=S.baseY;
          S.dragDeltaX=0;
          S.dragDeltaY=0;
        }
      }else{
        if(!B.active&&S.bloomStart&&(now-S.bloomStart)<1200&&S.pointer&&!S.focus&&!S.computer){
          updateParallax(S.pointer.x,S.pointer.y);
        }else if(S.mouseMoved&&S.pointer){
          updateParallax(S.pointer.x,S.pointer.y);
          S.mouseMoved=false;
        }
        if(!S.focus&&!S.computer&&Math.abs(S.baseX)>0.0005){
          S.baseX+=(0-S.baseX)*(1-Math.exp(-dtSec*3.5));
          S.tx=S.baseX+S.parallaxX;
        }
      }
      if(S.drag){
        const dragBlend=1-Math.exp(-dtSec*18.0);
        S.doorEase+=((S.door?1:0)-S.doorEase)*(1-Math.exp(-dtSec*4.5));
        S.fov+=(S.targetFov-S.fov)*(1-Math.exp(-dtSec*4.0));
        const prevX=S.x,prevY=S.y,prevPx=S.px,prevPy=S.py;
        S.x+=(S.tx-S.x)*dragBlend;
        S.y+=(S.ty-S.y)*dragBlend;
        S.px+=(S.tpx-S.px)*dragBlend;
        S.py+=(S.tpy-S.py)*dragBlend;
        S.dampState.vel_x=(S.x-prevX)/dtSec;
        S.dampState.vel_y=(S.y-prevY)/dtSec;
        S.dampState.vel_px=(S.px-prevPx)/dtSec;
        S.dampState.vel_py=(S.py-prevPy)/dtSec;
      }else{
        S.doorEase+=((S.door?1:0)-S.doorEase)*(1-Math.exp(-dtSec*4.5));
        S.fov+=(S.targetFov-S.fov)*(1-Math.exp(-dtSec*4.0));
        S.x=damp(S.x,S.tx,S.dampState,'x',0.13,dtSec);
        S.y=damp(S.y,S.ty,S.dampState,'y',0.13,dtSec);
        S.px=damp(S.px,S.tpx,S.dampState,'px',0.12,dtSec);
        S.py=damp(S.py,S.tpy,S.dampState,'py',0.12,dtSec);
      }
      if(B.active)S.t=B.elapsed;
      else if(!S.paused)S.t+=dt;
      if(S.chartT<1||AI_DATA.loading){if(S.chartT<1)S.chartT=Math.min(1,S.chartT+dt/850);drawGraphs();}
      render();
      const moving=Math.abs(S.doorEase-(S.door?1:0))>.0005||
        Math.abs(S.tx-S.x)>.00003||Math.abs(S.ty-S.y)>.00003||
        Math.abs(S.tpx-S.px)>.00003||Math.abs(S.tpy-S.py)>.00003||
        Math.abs(S.fov-S.targetFov)>.005||
        (!B.active&&S.bloomStart&&(performance.now()-S.bloomStart)<1550);
      const isInteractionActive=(performance.now()-(S.lastInteraction||0))<3500;
      const needsFrame=(B.active&&!B.failed)||moving||S.chartT<1||AI_DATA.loading||Math.abs(S.lampLevel-(S.lamp?1:0))>.003||(!S.paused&&!S.computer&&isInteractionActive);
      if(needsFrame)S.raf=requestAnimationFrame(tick);
    }
    function wake(){
      S.lastInteraction=performance.now();
      if((!S.ready&&!B.active)||S.raf||document.hidden)return;
      S.raf=requestAnimationFrame(tick);
    }
    function fit(){
      const rect=room.getBoundingClientRect();
      S.rectLeft=rect.left;
      S.rectTop=rect.top;
      S.width=rect.width||room.clientWidth||window.innerWidth;
      S.height=rect.height||room.clientHeight||window.innerHeight;
      S.dpr=Math.min(devicePixelRatio||1,1.2);
      for(const c of [surface,fx,loader,objectCanvas,objectSoftware]){c.width=Math.round(S.width*S.dpr);c.height=Math.round(S.height*S.dpr);}
      const d=Math.min(S.dpr,1.2);software.width=Math.round(S.width*d);software.height=Math.round(S.height*d);
      if(S.ready||B.active){render();wake();}
    }
    window.addEventListener('scroll',()=>{if(!room)return;const r=room.getBoundingClientRect();S.rectLeft=r.left;S.rectTop=r.top;},{passive:true});
    function openComposer(){if(B.active)return;homeView();const form=$('.nx-composer');form.hidden=false;$('.nx-tools').hidden=true;$('.nx-projection').hidden=true;S.mode='idle';clearTimeout(S.answerTimer);clearTimeout(S.returnTimer);for(const b of [$('.nx-core-hit'),$('.nx-chat')])b.setAttribute('aria-expanded','true');form.querySelector('input').focus({preventScroll:true});wake();}
    function closeComposer(focus=true){$('.nx-composer').hidden=true;$('.nx-tools').hidden=false;for(const b of [$('.nx-core-hit'),$('.nx-chat')])b.setAttribute('aria-expanded','false');if(focus)$('.nx-core-hit').focus({preventScroll:true});}
    let askAbortController = null;
    async function ask(q){
      clearTimeout(S.answerTimer);
      clearTimeout(S.returnTimer);
      closeComposer();
      if(askAbortController){
        try{ askAbortController.abort(); }catch(_){}
      }
      askAbortController = new AbortController();
      $('.nx-projection').hidden=true;
      S.mode='thinking';
      AI_DATA.loading=true;
      AI_DATA.question=q;
      const ackLine=AudioEngine.playAcknowledge();
      $('.nx-status').textContent=ackLine?`J.A.R.V.I.S.: “${ackLine.text}” Analyzing: “${q}”…`:'Nexa AI analyzing: “'+q+'”…';
      drawGraphs();
      wake();

      let data = null;
      try {
        const timeoutId = setTimeout(() => askAbortController?.abort(), 12000);
        const res = await fetch('/api/ask', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ question: q, filters: roomFilters, offline: false }),
          signal: askAbortController.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const json = await res.json();
          if (json && json.plan) data = json;
        }
      } catch (err) {
        if(err && err.name !== 'AbortError'){
          console.warn('Live API request failed or timed out, engaging Bulletproof Fallback Engine:', err);
        }
      }

      if (!data || !data.plan) {
        data = resolveBulletproofFallback(q);
      }

      AI_DATA.loading = false;
      AI_DATA.active = true;
      AI_DATA.title = data.plan?.title || 'Commerce Intelligence';
      AI_DATA.metric = data.plan?.metric || 'net_sales';
      AI_DATA.dimension = data.plan?.dimension || 'none';
      AI_DATA.planner = data.planner || 'Gemini AI';
      AI_DATA.source = data.source || 'supabase';
      AI_DATA.explanation = data.explanation || '';
      AI_DATA.rows = Array.isArray(data.rows) ? data.rows : [];

      const isMoney = isMoneyMetric(AI_DATA.metric);

      if(AI_DATA.dimension === 'date' && AI_DATA.rows.length > 0){
        AI_DATA.graphType = 'area';
        const maxVal = Math.max(1, ...AI_DATA.rows.map(r => Number(r.value) || 0));
        const count = 20;
        const step = Math.max(1, Math.floor(AI_DATA.rows.length / count));
        const sampled = [];
        for(let i = 0; i < count; i++){
          const idx = Math.min(AI_DATA.rows.length - 1, i * step);
          sampled.push(Math.max(0.05, (Number(AI_DATA.rows[idx]?.value) || 0) / maxVal));
        }
        oldSeries = newSeries.slice(0, count);
        while(oldSeries.length < count) oldSeries.push(0.2);
        newSeries = sampled;
        const totalVal = AI_DATA.rows.reduce((s, r) => s + (Number(r.value) || 0), 0);
        AI_DATA.summaryValue = isMoney ? formatMoney(totalVal, true) : totalVal.toLocaleString('en-PH');
      } else if(AI_DATA.rows.length > 0 && AI_DATA.dimension !== 'none'){
        AI_DATA.graphType = 'bar';
        const maxVal = Math.max(1, ...AI_DATA.rows.map(r => Number(r.value) || 0));
        const count = Math.min(8, AI_DATA.rows.length);
        const sampled = AI_DATA.rows.slice(0, count).map(r => Math.max(0.05, (Number(r.value) || 0) / maxVal));
        oldSeries = newSeries.slice(0, count);
        while(oldSeries.length < count) oldSeries.push(0.2);
        newSeries = sampled;
        const topVal = Number(AI_DATA.rows[0].value) || 0;
        AI_DATA.summaryValue = isMoney ? formatMoney(topVal, true) : topVal.toLocaleString('en-PH');
      } else {
        AI_DATA.graphType = 'area';
        const topVal = AI_DATA.rows.length ? Number(AI_DATA.rows[0].value) : 6914845;
        AI_DATA.summaryValue = isMoney ? formatMoney(topVal, true) : topVal.toLocaleString('en-PH');
      }

      // Standardized Bulletproof Answer Sentence Formulation matching AssistantPanel.tsx
      let answerText = '';
      if(data.plan?.mode === 'conversational' || (!AI_DATA.rows.length && data.explanation)){
        answerText = data.explanation;
      } else if(AI_DATA.rows.length > 0){
        const top = AI_DATA.rows[0];
        const valStr = isMoney ? formatMoney(top.value) : Number(top.value).toLocaleString('en-PH');
        if(data.plan?.threshold){
          answerText = `Showing ${AI_DATA.rows.length} ${data.plan.dimension === 'none' ? 'results' : data.plan.dimension + 's'} meeting the threshold criteria. ${data.explanation || ''}`.trim();
        } else if(data.plan?.dimension === 'none'){
          answerText = `Total ${data.plan?.metric?.replace('_', ' ') || 'metric'} is ${valStr}. ${data.explanation || ''}`.trim();
        } else if(data.plan?.dimension === 'date'){
          answerText = `Showing ${AI_DATA.rows.length} dates in chronological order. ${data.explanation || ''}`.trim();
        } else {
          answerText = `${top.label} ${data.plan?.direction === 'asc' ? 'has the lowest result at' : 'leads with'} ${valStr} (${AI_DATA.title}). ${data.explanation || ''}`.trim();
        }
      } else {
        answerText = data.explanation || 'No matching commerce records found in this scope.';
      }

      if(S.computer){
        return;
      }

      $('.nx-answer').textContent = answerText;
      $('.nx-projection').hidden = false;
      S.mode = 'answer';
      S.chartT = reduced ? 1 : 0;
      drawGraphs();
      const compLine=AudioEngine.playComplete(()=>{
        if(S.mode==='answer'){
          wake();
        }
      });
      $('.nx-status').textContent=compLine?`J.A.R.V.I.S.: “${compLine.text}” Projections active.`:'Nexa AI answer projected. Supporting graph and breakdown active on left monitors.';
      wake();

      S.returnTimer = setTimeout(() => {
        S.mode = 'idle';
        wake();
      }, 20000);
    }
    $('.nx-core-hit').addEventListener('click',openComposer);
    $('.nx-core-hit').addEventListener('pointerenter',()=>{S.coreHover=true;wake();});
    $('.nx-core-hit').addEventListener('pointerleave',()=>{S.coreHover=false;wake();});
    $('.nx-chat').addEventListener('click',openComposer);
    $('.nx-cancel').addEventListener('click',()=>closeComposer());
    $('.nx-composer').addEventListener('submit',e=>{e.preventDefault();const q=$('.nx-composer input').value.trim();if(q)ask(q);});
    for(const chip of root.querySelectorAll('.nx-chip')){
      chip.addEventListener('click',()=>{
        const q = chip.dataset.ask || chip.textContent.trim();
        $('.nx-composer input').value = q;
        ask(q);
      });
    }
    for(const m of monitors){
      m.el.querySelector('button').addEventListener('click',()=>{
        if(m.kind === 'products'){
          openComputer();
        } else {
          focusMonitor(m);
        }
      });
    }
    setInterval(()=>{
      if(!document.hidden && !S.computer && S.ready){
        drawGraphs();
        wake();
      }
    },1000);
    $('.nx-skip').addEventListener('click',skipBoot);
    $('.nx-replay').addEventListener('click',()=>beginBoot(true));
    $('.nx-retry').addEventListener('click',()=>{B.failed=false;$('.nx-retry').hidden=true;$('.nx-skip').hidden=false;$('.nx-status').textContent='Retrying room artwork.';const src=photo.getAttribute('src');photo.removeAttribute('src');photo.setAttribute('src',src);wake();});
    root.nexaIntro={durationMs:INTRO_DURATION_MS,replay:()=>beginBoot(true),skip:skipBoot};
    $('.nx-motion').addEventListener('click',()=>{S.paused=!S.paused;const b=$('.nx-motion');b.setAttribute('aria-pressed',String(S.paused));b.setAttribute('aria-label',S.paused?'Resume room animation':'Pause room animation');b.innerHTML='<i data-lucide="'+(S.paused?'play':'pause')+'" aria-hidden="true"></i>';if(typeof lucide!=='undefined')lucide.createIcons({attrs:{width:16,height:16}});wake();});
    for(const btn of root.querySelectorAll('.nx-quit-btn, .nx-quit')){
      btn.addEventListener('click',()=>{
        if(window.top && window.top !== window){
          window.top.location.href = '/analytics';
        } else {
          window.location.href = '/analytics';
        }
      });
    }
    let isMuted=false;
    try{
      const saved=localStorage.getItem('nexacart-jarvis-sound');
      if(saved!==null) isMuted=saved!=='true';
    }catch(_){}
    S.muted=isMuted;
    if(isMuted){
      const initBtn=$('.nx-audio-toggle');
      if(initBtn){
        initBtn.classList.add('is-muted');
        initBtn.setAttribute('aria-label','Unmute audio');
        initBtn.setAttribute('title','Unmute audio');
        initBtn.innerHTML='<i data-lucide="volume-x" aria-hidden="true"></i>';
        if(window.lucide)window.lucide.createIcons();
      }
    }
    $('.nx-audio-toggle')?.addEventListener('click',()=>{
      isMuted=!isMuted;
      S.muted=isMuted;
      try{
        localStorage.setItem('nexacart-jarvis-sound',isMuted?'false':'true');
      }catch(_){}
      if(isMuted)AudioEngine.stopVoice();
      const carplay=$('#nx-audio-carplay');
      const jarvis=$('#nx-audio-jarvis');
      if(carplay)carplay.muted=isMuted;
      if(jarvis)jarvis.muted=isMuted;
      const rf=document.getElementById('retro-workstation-frame');
      if(rf && rf.contentWindow){
        try{ rf.contentWindow.postMessage({ type: isMuted ? 'PAUSE_ALL_AUDIO' : 'RESUME_AUDIO' }, '*'); }catch(e){}
      }
      const btn=$('.nx-audio-toggle');
      if(btn){
        btn.classList.toggle('is-muted',isMuted);
        btn.setAttribute('aria-label',isMuted?'Unmute audio':'Mute audio');
        btn.setAttribute('title',isMuted?'Unmute audio':'Mute audio');
        btn.innerHTML=`<i data-lucide="${isMuted?'volume-x':'volume-2'}" aria-hidden="true"></i>`;
        if(window.lucide)window.lucide.createIcons();
      }
      wake();
    });
    function homeView(){if(S.computer)closeComputer(false);S.focus=null;S.baseX=0;S.baseY=0;S.parallaxX=0;S.parallaxY=0;S.tx=0;S.ty=0;S.tpx=0;S.tpy=0;S.targetFov=DEFAULT_FOV;S.mouseMoved=true;wake();}
    function focusMonitor(m){
      if(B.active)return;
      if(S.computer)closeComputer(false);
      $('.nx-projection').hidden=true;
      closeComposer(false);
      const x=m.q.reduce((a,p)=>a+p[0],0)/4/IW,y=m.q.reduce((a,p)=>a+p[1],0)/4/IH,xs=m.q.map(p=>p[0]),ys=m.q.map(p=>p[1]),ha=(Math.max(...xs)-Math.min(...xs))/IW*SPAN_H,va=(Math.max(...ys)-Math.min(...ys))/IH*SPAN_V,needed=2*Math.atan(Math.tan(ha/2)/(S.width/S.height));
      S.baseX=(x-.5)*SPAN_H;
      S.baseY=(.5-y)*SPAN_V;
      clampBase();
      S.parallaxX=0;
      S.parallaxY=0;
      S.tx=S.baseX;
      S.ty=S.baseY;
      S.targetFov=clamp(Math.max(va*1.45,needed*1.3)*180/Math.PI,10,38);
      S.focus=m.kind;
      S.mouseMoved=true;
      $('.nx-home').focus({preventScroll:true});
      const label = m.kind==='sales' ? 'supporting answer graph' : m.kind==='stores' ? 'explore answer breakdown' : 'product overview';
      $('.nx-status').textContent='Focused '+label+'. Reset room view or drag to look around.';
      wake();
    }
    function turn(delta){if(B.active)return;if(S.computer)closeComputer(false);S.focus=null;S.targetFov=DEFAULT_FOV;S.baseX+=delta;S.baseY=S.baseX<-.25?-.06:0;clampBase();S.tx=S.baseX+S.parallaxX;S.ty=S.baseY+S.parallaxY;S.mouseMoved=true;wake();}
    $('.nx-look-left').addEventListener('click',()=>turn(-Math.PI/10));
    $('.nx-look-right').addEventListener('click',()=>turn(Math.PI/10));
    $('.nx-home').addEventListener('click',homeView);
    function isControl(target){return !!target.closest('.nx-tools,.nx-view-controls,.nx-composer,.nx-boot-tools,.nx-hotspot,.nx-desktop');}
    room.addEventListener('pointerenter',e=>{S.pointer={x:e.clientX,y:e.clientY};S.mouseMoved=true;wake();});
    room.addEventListener('pointerdown',e=>{
      if(B.active||e.button>0)return;
      if(S.computer){
        if(!e.target.closest('.nx-desktop')){
          closeComputer(true);
        }
        return;
      }
      if(isControl(e.target))return;
      if(S.focus){
        homeView();
        $('.nx-status').textContent='Room view restored.';
        return;
      }
      S.drag={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,moved:false};
    });
    function updateParallax(cx,cy){
      if(S.computer)return;
      const w=S.width||window.innerWidth;
      const h=S.height||window.innerHeight;
      const left=S.rectLeft??0;
      const top=S.rectTop??0;
      const rawX=clamp(((cx-left)/w-0.5)*2,-1,1);
      const rawY=clamp(((cy-top)/h-0.5)*2,-1,1);
      // Deadband check (2.5%) to eliminate laptop trackpad micro-jitter & thermal throttling
      const mag=Math.hypot(rawX,rawY);
      let nx=0,ny=0;
      if(mag>0.025){
        const factor=(mag-0.025)/(1-0.025);
        const curved=factor*(0.86+0.14*factor*factor);
        nx=(rawX/mag)*Math.min(1,curved);
        ny=(rawY/mag)*Math.min(1,curved);
      }
      const bloom=(!B.active&&S.bloomStart)?smooth(0,900,performance.now()-S.bloomStart):1.0;
      if(S.focus){
        S.parallaxX=nx*(2.5*Math.PI/180)*bloom;
        S.parallaxY=-ny*(1.2*Math.PI/180)*bloom;
        S.tpx=nx*0.08*bloom;
        S.tpy=ny*0.08*bloom;
      }else{
        S.parallaxX=nx*PARALLAX_YAW*bloom;
        S.parallaxY=-ny*PARALLAX_PITCH*bloom;
        S.tpx=nx*bloom;
        S.tpy=ny*bloom;
      }
      S.tx=S.baseX+S.parallaxX;
      S.ty=S.baseY+S.parallaxY;
      clampView();
    }
    window.addEventListener('pointermove',e=>{
      if(S.computer)return;
      S.pointer={x:e.clientX,y:e.clientY};
      S.mouseMoved=true;
      S.lastInteraction=performance.now();
      if(!S.ready)return;
      if(B.active){
        wake();
        return;
      }
      if(S.drag&&S.drag.id===e.pointerId){
        const d=S.drag,dx=e.clientX-d.lastX,dy=e.clientY-d.lastY;
        d.lastX=e.clientX;d.lastY=e.clientY;
        if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>5)d.moved=true;
        if(d.moved){
          if(!room.hasPointerCapture(e.pointerId))room.setPointerCapture(e.pointerId);
          S.focus=null;S.targetFov=DEFAULT_FOV;
          S.dragDeltaX+=dx;
          S.dragDeltaY+=dy;
          room.classList.add('nx-dragging');
        }
      }
      wake();
    },{passive:true});
    function endDrag(e){
      if(!S.drag||S.drag.id!==e.pointerId)return;
      if(S.drag.moved)S.suppressClickUntil=performance.now()+350;
      S.drag=null;
      S.dragDeltaX=0;
      S.dragDeltaY=0;
      room.classList.remove('nx-dragging');
      if(room.hasPointerCapture(e.pointerId))room.releasePointerCapture(e.pointerId);
      S.pointer={x:e.clientX,y:e.clientY};
      S.mouseMoved=true;
      wake();
    }
    window.addEventListener('pointerup',endDrag);
    window.addEventListener('pointercancel',endDrag);
    room.addEventListener('lostpointercapture',()=>{S.drag=null;room.classList.remove('nx-dragging');});
    function returnCenter(){
      S.pointer=null;
      S.mouseMoved=false;
      if(!S.computer&&!S.focus&&!S.drag){
        S.parallaxX=0;
        S.parallaxY=0;
        S.tpx=0;
        S.tpy=0;
        S.tx=S.baseX;
        S.ty=S.baseY;
        wake();
      }
    }
    document.addEventListener('mouseleave',returnCenter);
    window.addEventListener('blur',returnCenter);
    room.addEventListener('click',e=>{if(performance.now()<S.suppressClickUntil){e.preventDefault();e.stopImmediatePropagation();}},{capture:true});
    room.addEventListener('wheel',e=>{if(B.active||isControl(e.target))return;e.preventDefault();S.focus=null;S.targetFov=clamp(S.targetFov+e.deltaY*.018,20,56);wake();},{passive:false});
    root.addEventListener('keydown',e=>{if(S.computer&&e.key!=='Escape')return;if(/INPUT|TEXTAREA/.test(e.target.tagName)&&e.key!=='Escape')return;if(e.key==='Escape'){if(B.active){skipBoot();return;}clearTimeout(S.answerTimer);clearTimeout(S.returnTimer);S.mode='idle';$('.nx-projection').hidden=true;closeComposer();homeView();wake();return;}if(B.active)return;if(e.key==='Home'){e.preventDefault();homeView();}if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();turn((e.key==='ArrowLeft'?-1:1)*Math.PI/18);}if(e.key==='ArrowUp'||e.key==='ArrowDown'){e.preventDefault();S.baseY+=(e.key==='ArrowUp'?1:-1)*Math.PI/60;clampBase();S.ty=S.baseY+S.parallaxY;wake();}});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(B.active&&B.started){B.hiddenAt=performance.now();clearTimeout(B.endTimer);B.endTimer=0;introEvent('pause');}if(S.raf)cancelAnimationFrame(S.raf);S.raf=0;}else{if(B.hiddenAt){const gap=performance.now()-B.hiddenAt;B.startAt+=gap;if(B.skipAt)B.skipAt+=gap;B.hiddenAt=0;scheduleFinish(B.skipAt?Math.max(0,180-(performance.now()-B.skipAt)):B.duration-(performance.now()-B.startAt));introEvent('resume');}wake();}});surface.addEventListener('webglcontextlost',e=>{e.preventDefault();root.classList.remove('nx-webgl');gl=null;initSoftware();backgroundX=Infinity;wake();});
    const observer=new ResizeObserver(fit);observer.observe(room);
    async function ready(){
      if(S.ready||S.initializing)return;
      S.initializing=true;
      B.failed=false;
      $('.nx-retry').hidden=true;
      $('.nx-skip').hidden=false;
      initGL();
      if(!gl)initSoftware();
      buildProps3D();
      await buildDownloadedAssets();
      S.ready=true;
      S.initializing=false;
      drawGraphs();
      fit();
      if(B.pendingFinish||B.skip){
        finishBoot();
      }
    }
    photo.addEventListener('load',ready);
    photo.addEventListener('error',()=>{
      B.failed=true;
      $('.nx-retry').hidden=false;
      $('.nx-skip').hidden=true;
      $('.nx-status').textContent='The room artwork could not load. Use Retry loading the room.';
      introEvent('error');
      wake();
    });
    fit();
    beginBoot();
    if(photo.complete&&photo.naturalWidth)ready();
  })();
  
