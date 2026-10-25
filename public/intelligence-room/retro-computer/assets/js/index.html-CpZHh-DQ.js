(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))s(n);new MutationObserver(n=>{for(const a of n)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function i(n){const a={};return n.integrity&&(a.integrity=n.integrity),n.referrerPolicy&&(a.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?a.credentials="include":n.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(n){if(n.ep)return;n.ep=!0;const a=i(n);fetch(n.href,a)}})();const et=32;function I(e,t){const i=window.innerWidth,s=window.innerHeight,n=et,a=Math.max(n,s-t),r=0,o=Math.max(0,i-e),d=r+Math.random()*(o-r),c=n+Math.random()*(a-n);return{x:Math.round(d),y:Math.round(c)}}function P(e){return e.endsWith("px")?parseFloat(e):e.endsWith("vw")?parseFloat(e)/100*window.innerWidth:e.endsWith("vh")?parseFloat(e)/100*window.innerHeight:parseFloat(e)||0}let it=100;function K(){return++it}const G=new Map,J=new Map;function O(e,t){!e||!t||G.set(e,{x:parseInt(t.style.left)||0,y:parseInt(t.style.top)||0,width:t.offsetWidth,height:t.offsetHeight})}function H(e){return e&&G.get(e)||null}function q(e){if(!e||!e.id)return;const t={tagName:e.tagName.toLowerCase(),attributes:{}};for(const i of e.attributes)t.attributes[i.name]=i.value;J.set(e.id,t)}function st(e){const t=J.get(e);if(!t)return null;const i=document.createElement(t.tagName);for(const[s,n]of Object.entries(t.attributes))i.setAttribute(s,n);return document.body.appendChild(i),i}function R(e,t=null){if(!e)return()=>{};const i=e.querySelector(".window-resize-top"),s=e.querySelector(".window-resize-left"),n=e.querySelector(".window-resize-right"),a=e.querySelector(".window-resize-bottom"),r=e.querySelector(".window-resize-corner-bl"),o=e.querySelector(".window-resize-corner-br"),d=e.querySelector(".window-resize-corner-tl"),c=e.querySelector(".window-resize-corner-tr");let v=!1,h=null,f,b,z,_,E,p,L=null,m=null,M=null;const A=l=>{v&&(M={clientX:l.clientX,clientY:l.clientY},m||(m=requestAnimationFrame(()=>{if(!M){m=null;return}const u=M.clientX-z,y=M.clientY-_;if(h==="top"){const g=Math.max(200,b-y),w=p+y;g>=200&&w>=0&&(e.style.height=`${g}px`,e.style.top=`${w}px`)}else if(h==="right"){const g=Math.max(300,f+u),w=window.innerWidth-E;e.style.width=`${Math.min(g,w)}px`}else if(h==="left"){const g=Math.max(300,f-u),w=E+u;g>=300&&w>=0&&(e.style.width=`${g}px`,e.style.left=`${w}px`)}else if(h==="bottom"){const g=Math.max(200,b+y),w=window.innerHeight-p;e.style.height=`${Math.min(g,w)}px`}else if(h==="bottom-left"){const g=Math.max(300,f-u),w=Math.max(200,b+y),C=E+u,S=window.innerHeight-p;g>=300&&C>=0&&(e.style.width=`${g}px`,e.style.left=`${C}px`),e.style.height=`${Math.min(w,S)}px`}else if(h==="bottom-right"){const g=Math.max(300,f+u),w=Math.max(200,b+y),C=window.innerWidth-E,S=window.innerHeight-p;e.style.width=`${Math.min(g,C)}px`,e.style.height=`${Math.min(w,S)}px`}else if(h==="top-left"){const g=Math.max(300,f-u),w=Math.max(200,b-y),C=E+u,S=p+y;g>=300&&C>=0&&(e.style.width=`${g}px`,e.style.left=`${C}px`),w>=200&&S>=0&&(e.style.height=`${w}px`,e.style.top=`${S}px`)}else if(h==="top-right"){const g=Math.max(300,f+u),w=Math.max(200,b-y),C=p+y,S=window.innerWidth-E;e.style.width=`${Math.min(g,S)}px`,w>=200&&C>=0&&(e.style.height=`${w}px`,e.style.top=`${C}px`)}M=null,m=null})))},T=l=>{v&&(v=!1,h=null,m&&(cancelAnimationFrame(m),m=null),M=null,L&&(L.releasePointerCapture(l.pointerId),L.removeEventListener("pointermove",A),L.removeEventListener("pointerup",T),L=null),t&&t())},x=(l,u,y)=>{v=!0,h=u,L=y,f=e.offsetWidth,b=e.offsetHeight,E=e.offsetLeft,p=e.offsetTop,z=l.clientX,_=l.clientY,l.preventDefault(),l.stopPropagation(),F(e),y.setPointerCapture(l.pointerId),y.addEventListener("pointermove",A),y.addEventListener("pointerup",T)};return i?.addEventListener("pointerdown",l=>x(l,"top",i)),s?.addEventListener("pointerdown",l=>x(l,"left",s)),n?.addEventListener("pointerdown",l=>x(l,"right",n)),a?.addEventListener("pointerdown",l=>x(l,"bottom",a)),r?.addEventListener("pointerdown",l=>x(l,"bottom-left",r)),o?.addEventListener("pointerdown",l=>x(l,"bottom-right",o)),d?.addEventListener("pointerdown",l=>x(l,"top-left",d)),c?.addEventListener("pointerdown",l=>x(l,"top-right",c)),()=>{}}function W(e,t,i=null,s=null){if(!e||!t)return()=>{};let n=!1,a,r;const o=c=>{if(!n)return;let v=c.clientX-a,h=c.clientY-r;v=Math.max(0,Math.min(v,window.innerWidth-t.offsetWidth)),h=Math.max(0,Math.min(h,window.innerHeight-t.offsetHeight)),t.style.left=`${v}px`,t.style.top=`${h}px`},d=c=>{n&&(n=!1,t.classList.remove("dragging"),e.releasePointerCapture(c.pointerId),e.removeEventListener("pointermove",o),e.removeEventListener("pointerup",d),i&&i())};return e.addEventListener("pointerdown",c=>{c.target.closest("button")||(F(t),n=!0,a=c.clientX-t.offsetLeft,r=c.clientY-t.offsetTop,t.classList.add("dragging"),e.setPointerCapture(c.pointerId),e.addEventListener("pointermove",o),e.addEventListener("pointerup",d))}),s&&e.addEventListener("dblclick",c=>{c.target.closest("button")||s()}),()=>{}}function F(e){e&&(document.querySelectorAll(".window").forEach(t=>{t.classList.remove("active")}),e.classList.add("active"),e.style.zIndex=K())}function N(){return`
    <!-- Resize handles -->
    <div class="window-resize-top absolute top-0 left-2.5 right-2.5 h-[5px] cursor-ns-resize z-10"></div>
    <div class="window-resize-left absolute left-0 top-2.5 bottom-2.5 w-[5px] cursor-ew-resize z-10"></div>
    <div class="window-resize-right absolute right-0 top-2.5 bottom-2.5 w-[5px] cursor-ew-resize z-10"></div>
    <div class="window-resize-bottom absolute bottom-0 left-2.5 right-2.5 h-[5px] cursor-ns-resize z-10"></div>
    <div class="window-resize-corner-bl absolute bottom-0 left-0 w-2.5 h-2.5 cursor-nesw-resize z-10"></div>
    <div class="window-resize-corner-br absolute bottom-0 right-0 w-2.5 h-2.5 cursor-nwse-resize z-10"></div>
    <div class="window-resize-corner-tl absolute top-0 left-0 w-2.5 h-2.5 cursor-nwse-resize z-10"></div>
    <div class="window-resize-corner-tr absolute top-0 right-0 w-2.5 h-2.5 cursor-nesw-resize z-10"></div>
  `}function j(e,t="window-chrome"){return`
    <div data-${t} class="h-10 bg-gray-800 border-b-2 border-gray-600 flex items-center justify-between pl-4 pr-2 cursor-grab select-none flex-shrink-0 active:cursor-grabbing">
      <span data-title class="font-mono text-sm text-gray-200 font-medium">${e}</span>
      <div class="flex items-center gap-2">
        <button data-maximize class="w-6 h-6 rounded bg-gray-700 text-gray-300 hover:bg-green-600 hover:text-white flex items-center justify-center cursor-pointer transition-all text-base leading-none p-0 border-none" title="Maximize">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" class="size-4"><path d="M200-200v-240h80v160h160v80H200Zm480-320v-160H520v-80h240v240h-80Z"/></svg>
        </button>
        <button data-close class="w-6 h-6 rounded bg-gray-700 text-gray-300 hover:bg-red-600 hover:text-white flex items-center justify-center cursor-pointer transition-all text-base leading-none p-0 border-none" title="Close">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  `}class U{constructor(t,i,s){this.windowEl=t,this.windowId=i,this.parentElement=s,this.isMaximized=!1,this.previousState=null}close(){this.windowEl&&this.parentElement&&(O(this.windowId,this.windowEl),this.parentElement.remove(),window.dispatchEvent(new CustomEvent("windowClosed",{detail:{windowId:this.windowId}})))}savePosition(){this.isMaximized||O(this.windowId,this.windowEl)}toggleMaximize(){if(this.windowEl)if(this.isMaximized){const t=this.previousState;this.windowEl.style.width=t.width,this.windowEl.style.height=t.height,this.windowEl.style.left=t.left,this.windowEl.style.top=t.top,this.windowEl.classList.remove("maximized"),this.isMaximized=!1}else this.previousState={width:this.windowEl.style.width,height:this.windowEl.style.height,left:this.windowEl.style.left,top:this.windowEl.style.top},this.windowEl.style.width="100%",this.windowEl.style.height="100vh",this.windowEl.style.left="0",this.windowEl.style.top="0",this.windowEl.classList.add("maximized"),this.isMaximized=!0}focus(){F(this.windowEl)}}class nt extends HTMLElement{connectedCallback(){this.windowId=this.id||`folder-${Date.now()}`,q(this),this.render(),this.setupReferences(),this.windowState=new U(this.windowEl,this.windowId,this);const t=H(this.windowId);if(t)this.windowEl.style.width=`${t.width}px`,this.windowEl.style.height=`${t.height}px`,this.windowEl.style.left=`${t.x}px`,this.windowEl.style.top=`${t.y}px`;else{const{x:i,y:s}=I(this.windowWidth,this.windowHeight);this.windowEl.style.left=`${i}px`,this.windowEl.style.top=`${s}px`}this.setupEventListeners(),this.setupDraggable(),this.setupResizable(),this.renderIcons()}disconnectedCallback(){this.cleanupDraggable&&this.cleanupDraggable(),this.cleanupResizable&&this.cleanupResizable()}render(){const t=this.getAttribute("title")||"Folder",i=this.getAttribute("width")||"500px",s=this.getAttribute("height")||"340px";this.innerHTML=`
      <div class="window" style="width: ${i}; height: ${s}; display: none;">
        ${j(t,"folder-chrome")}
        <div data-folder-content class="folder-content flex-1 overflow-auto p-4">
          <div data-icon-grid class="flex flex-wrap gap-4"></div>
        </div>
        ${N()}
      </div>
    `}setupReferences(){this.windowEl=this.querySelector(".window"),this.closeBtn=this.querySelector("[data-close]"),this.maximizeBtn=this.querySelector("[data-maximize]"),this.chrome=this.querySelector("[data-folder-chrome]"),this.contentArea=this.querySelector("[data-folder-content]"),this.iconGrid=this.querySelector("[data-icon-grid]"),this.windowWidth=P(this.getAttribute("width")||"500px"),this.windowHeight=P(this.getAttribute("height")||"340px")}setupEventListeners(){this.closeBtn&&this.closeBtn.addEventListener("click",()=>this.close()),this.maximizeBtn&&this.maximizeBtn.addEventListener("click",()=>this.toggleMaximize()),this.windowEl.addEventListener("mousedown",()=>this.focus())}setupDraggable(){this.cleanupDraggable=W(this.chrome,this.windowEl,()=>this.windowState.savePosition(),()=>this.toggleMaximize())}setupResizable(){this.cleanupResizable=R(this.windowEl,()=>this.windowState.savePosition())}renderIcons(){if(!this.iconGrid)return;const t=this.getAttribute("files");if(t)try{JSON.parse(t).forEach(s=>{const n=document.createElement("app-icon");n.setAttribute("file",s.path),n.setAttribute("label",s.label),n.setAttribute("draggable","false"),s.icon&&n.setAttribute("icon",s.icon),s.gradient&&n.setAttribute("gradient",s.gradient),this.iconGrid.appendChild(n)})}catch(i){console.error("Failed to parse files attribute:",i)}}open(){this.windowEl&&(this.windowEl.classList.remove("minimized"),this.windowEl.style.display="flex",this.focus())}close(){this.windowState.close()}focus(){this.windowState.focus()}toggleMaximize(){this.windowState.toggleMaximize()}}customElements.define("app-folder",nt);function V(e,t,i={}){const{shouldDrag:s=()=>!0,onDragStart:n=()=>{},onDragEnd:a=()=>{},moveThreshold:r=3,constrained:o=!1}=i;let d=0,c=0,v=!1,h,f,b=!1;const z=p=>{s(p)&&(v=!0,b=!1,h=p.clientX-d,f=p.clientY-c,e.style.cursor="grabbing",document.body.style.userSelect="none",e.setPointerCapture(p.pointerId),n(p))},_=p=>{if(!v)return;let L=p.clientX-h,m=p.clientY-f;if(o){const M=t.getBoundingClientRect(),A=M.width,T=M.height,x=M.left-d,l=M.top-c,u=-x,y=window.innerWidth-x-A,g=-l,w=window.innerHeight-l-T;L=Math.max(u,Math.min(y,L)),m=Math.max(g,Math.min(w,m))}(Math.abs(L-d)>r||Math.abs(m-c)>r)&&(b=!0),d=L,c=m,t.style.transform=`translate(${d}px, ${c}px)`},E=p=>{v&&(v=!1,e&&(e.style.cursor="",e.releasePointerCapture(p.pointerId)),document.body.style.userSelect="",a(b,p))};return e.addEventListener("pointerdown",z),document.body.addEventListener("pointermove",_),document.body.addEventListener("pointerup",E),()=>{e.removeEventListener("pointerdown",z),document.body.removeEventListener("pointermove",_),document.body.removeEventListener("pointerup",E)}}function Q(e){if(!e)return()=>{};const t=()=>{e.style.zIndex=K()};return e.addEventListener("pointerdown",t),e.addEventListener("focusin",t),()=>{e.removeEventListener("pointerdown",t),e.removeEventListener("focusin",t)}}class ot{constructor(){this.selectedIcons=new Set,this.selectionBox=null,this.desktop=null,this.isDragSelecting=!1,this.cachedIconRects=null,this.onPointerDown=this.onPointerDown.bind(this),this.onPointerMove=this.onPointerMove.bind(this),this.onPointerUp=this.onPointerUp.bind(this)}init(){this.selectionBox=document.createElement("div"),this.selectionBox.className="fixed border-2 border-blue-400 bg-blue-400/20 pointer-events-none hidden",this.selectionBox.style.zIndex="9999",document.body.appendChild(this.selectionBox),this.desktop=document.querySelector("main"),this.desktop&&this.desktop.addEventListener("pointerdown",this.onPointerDown),document.addEventListener("keydown",t=>{t.key==="Escape"&&this.clearSelection()})}onPointerDown(t){if(!(t.target.tagName==="MAIN"||t.target.classList.contains("relative")&&t.target.parentElement.tagName==="MAIN"))return;this.isDragSelecting=!0,this.startX=t.clientX,this.startY=t.clientY;const s=document.querySelectorAll("app-icon");this.cachedIconRects=Array.from(s).map(n=>({icon:n,rect:n.getBoundingClientRect()})),!t.metaKey&&!t.ctrlKey&&this.clearSelection(),this.selectionBox.style.left=`${this.startX}px`,this.selectionBox.style.top=`${this.startY}px`,this.selectionBox.style.width="0px",this.selectionBox.style.height="0px",this.selectionBox.classList.remove("hidden"),document.addEventListener("pointermove",this.onPointerMove),document.addEventListener("pointerup",this.onPointerUp)}onPointerMove(t){if(!this.isDragSelecting)return;const i=t.clientX,s=t.clientY,n=Math.min(this.startX,i),a=Math.min(this.startY,s),r=Math.abs(i-this.startX),o=Math.abs(s-this.startY);this.selectionBox.style.left=`${n}px`,this.selectionBox.style.top=`${a}px`,this.selectionBox.style.width=`${r}px`,this.selectionBox.style.height=`${o}px`,this.updateSelectionFromBox(n,a,r,o)}onPointerUp(t){this.isDragSelecting&&(this.isDragSelecting=!1,this.selectionBox.classList.add("hidden"),this.selectionBox.style.width="0",this.selectionBox.style.height="0",this.cachedIconRects=null,document.removeEventListener("pointermove",this.onPointerMove),document.removeEventListener("pointerup",this.onPointerUp))}updateSelectionFromBox(t,i,s,n){this.cachedIconRects&&this.cachedIconRects.forEach(({icon:a,rect:r})=>{!(r.right<t||r.left>t+s||r.bottom<i||r.top>i+n)&&this.selectIcon(a)})}selectIcon(t,i=!0){!i&&!this.isDragSelecting&&this.clearSelection(),this.selectedIcons.add(t),t.classList.add("icon-selected"),t.dispatchEvent(new CustomEvent("icon-selected",{detail:{selected:!0},bubbles:!0}))}deselectIcon(t){this.selectedIcons.delete(t),t.classList.remove("icon-selected"),t.dispatchEvent(new CustomEvent("icon-selected",{detail:{selected:!1},bubbles:!0}))}toggleIcon(t){this.selectedIcons.has(t)?this.deselectIcon(t):this.selectIcon(t)}clearSelection(){this.selectedIcons.forEach(t=>{t.classList.remove("icon-selected"),t.dispatchEvent(new CustomEvent("icon-selected",{detail:{selected:!1},bubbles:!0}))}),this.selectedIcons.clear()}isSelected(t){return this.selectedIcons.has(t)}getSelectedIcons(){return Array.from(this.selectedIcons)}getSelectedCount(){return this.selectedIcons.size}}const k=new ot,$=new Map;function at(e,t,i={}){if($.has(e)){const c=$.get(e);return c.open(),c}const{width:s="800px",height:n="600px"}=i,a=t,r=`preview-${Date.now()}`,o=document.createElement("app-preview");o.id=r,o.setAttribute("title",a),o.setAttribute("width",s),o.setAttribute("height",n),o.setAttribute("file",e),o.setAttribute("data-component-name",a),o.setAttribute("data-component-extra-file",e),o.setAttribute("data-component-extra-title",a),$.set(e,o);const d=c=>{c.detail.windowId===r&&($.delete(e),window.removeEventListener("windowClosed",d))};return window.addEventListener("windowClosed",d),document.body.appendChild(o),setTimeout(()=>{o.open()},0),o}class rt extends HTMLElement{connectedCallback(){this.render(),this.setupReferences(),this.setupEventListeners(),this.setupFocusable(),this.setupDraggable()}disconnectedCallback(){this.cleanupDraggable&&this.cleanupDraggable(),this.cleanupFocusable&&this.cleanupFocusable()}render(){const t=this.getAttribute("label")||"App",i=this.getAttribute("icon"),s=this.getAttribute("file");this.getAttribute("target");let n;if(i)n=`<span class="text-3xl">${i}</span>`;else if(s){const a=s.split(".").pop().toLowerCase();["png","jpg","jpeg","gif","webp","svg"].includes(a)?n=`<img src="${s}" alt="${t}" class="w-full h-full object-cover rounded-xl" />`:["mp4","webm","ogg"].includes(a)?n=`<video src="${s}" class="w-full h-full object-cover rounded-xl" muted></video>`:["mp3","wav","ogg","m4a","aac","flac","opus"].includes(a)?n="<img src='assets/icons/audio-file.webp' class='w-full h-full object-cover' />":["md","txt","json","js","css","html"].includes(a)?n="<img src='assets/icons/text-file.webp' class='w-full h-full object-cover' />":["glb","gltf","obj","fbx"].includes(a)?n="<img src='assets/icons/code-file.webp' class='w-full h-full object-cover' />":n='<span class="text-3xl">📄</span>'}else n="<img src='assets/icons/drive.webp' class='w-full h-full object-cover' />";this.innerHTML=`
      <button class="icon-button flex font-mono flex-col w-33 items-center gap-2 p-3 rounded-lg hover:bg-white/10 transition-colors user-select-none active:cursor-grabbing">
        <span class="inline-grid place-items-center w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden pointer-events-none">
          ${n}
        </span>
        <span class="text-xs text-shadow-md text-gray-200 text-center break-words max-w-full">${t}</span>
      </button>
    `}setupReferences(){this.button=this.querySelector("button"),this.targetId=this.getAttribute("target"),this.fileUrl=this.getAttribute("file")}setupEventListeners(){if(!this.button)return;let t=0,i=null;this.button.addEventListener("click",s=>{s.stopPropagation();const n=s.metaKey||s.ctrlKey;t++,t===1?i=setTimeout(()=>{t=0,n?k.toggleIcon(this):k.selectIcon(this,!1)},300):t===2&&(clearTimeout(i),t=0,this.fileUrl?this.openFile():this.targetId&&this.openWindow())}),this.button.addEventListener("pointerdown",s=>{!(s.metaKey||s.ctrlKey)&&!k.isSelected(this)&&k.selectIcon(this,!1)}),this.button.addEventListener("contextmenu",s=>{s.preventDefault(),s.stopPropagation()})}showContextMenu(t,i){const s=document.querySelector("#icon-context-menu");if(s){if(s.style.position="fixed",s.style.left=`${t}px`,s.style.top=`${i}px`,s.dataset.iconElement=this.id||this.getAttribute("label"),!s.dataset.handlersSetup){const n=s.querySelector("[data-icon-open]"),a=s.querySelector("[data-icon-get-info]");n?.addEventListener("click",()=>{k.getSelectedIcons().forEach(o=>{o.fileUrl?o.openFile():o.targetId&&o.openWindow()}),s.hidePopover()}),a?.addEventListener("click",()=>{k.getSelectedIcons().length,s.hidePopover()}),s.dataset.handlersSetup="true"}document.addEventListener("pointerup",()=>{s.showPopover()},{once:!0})}}setupFocusable(){this.cleanupFocusable=Q(this)}setupDraggable(){if(!this.button)return;if(!(this.getAttribute("draggable")!=="false")){this.button.classList.remove("cursor-grab","active:cursor-grabbing");return}this.cleanupDraggable=V(this.button,this,{onDragEnd:(i,s)=>{i&&(s.preventDefault(),s.stopPropagation())}})}openFile(){if(this.fileUrl){const t=this.getAttribute("label")||"Preview",i=this.fileUrl.split(".").pop().toLowerCase(),n=["mp3","wav","ogg","m4a","aac","flac","opus"].includes(i)?{width:"600px",height:"380px"}:{};at(this.fileUrl,t,n)}}openWindow(){let t=document.getElementById(this.targetId);t||(t=st(this.targetId)),t&&(t.tagName==="APP-WINDOW"||t.tagName==="APP-FOLDER")&&t.open()}}customElements.define("app-icon",rt);class lt extends HTMLElement{connectedCallback(){this.windowId=this.id||`preview-${Date.now()}`,q(this),this.render(),this.setupReferences(),this.windowState=new U(this.windowEl,this.windowId,this);const t=H(this.windowId);if(t)this.windowEl.style.width=`${t.width}px`,this.windowEl.style.height=`${t.height}px`,this.windowEl.style.left=`${t.x}px`,this.windowEl.style.top=`${t.y}px`;else{const{x:i,y:s}=I(this.windowWidth,this.windowHeight);this.windowEl.style.left=`${i}px`,this.windowEl.style.top=`${s}px`}this.setupEventListeners(),this.setupDraggable(),this.setupResizable(),this.loadContent()}disconnectedCallback(){this.cleanupDraggable&&this.cleanupDraggable(),this.cleanupResizable&&this.cleanupResizable()}render(){const t=this.getAttribute("title")||"Preview",i=this.getAttribute("width")||"800px",s=this.getAttribute("height")||"600px";this.innerHTML=`
      <div class="window" style="width: ${i}; height: ${s}; display: none;">
        ${j(t,"preview-chrome")}
        <div data-preview-content class="preview-content">
          <div class="text-center text-gray-400">
            <p class="text-sm">Loading...</p>
          </div>
        </div>
        ${N()}
      </div>
    `}setupReferences(){this.windowEl=this.querySelector(".window"),this.closeBtn=this.querySelector("[data-close]"),this.maximizeBtn=this.querySelector("[data-maximize]"),this.chrome=this.querySelector("[data-preview-chrome]"),this.content=this.querySelector("[data-preview-content]"),this.windowWidth=P(this.getAttribute("width")||"800px"),this.windowHeight=P(this.getAttribute("height")||"600px")}setupEventListeners(){this.closeBtn&&this.closeBtn.addEventListener("click",()=>this.close()),this.maximizeBtn&&this.maximizeBtn.addEventListener("click",()=>this.toggleMaximize()),this.windowEl.addEventListener("mousedown",()=>this.focus())}setupDraggable(){this.cleanupDraggable=W(this.chrome,this.windowEl,()=>this.windowState.savePosition(),()=>this.toggleMaximize())}setupResizable(){this.cleanupResizable=R(this.windowEl,()=>this.windowState.savePosition())}loadContent(){const t=this.getAttribute("file");if(!t){this.content.innerHTML=`
        <div class="text-center text-gray-400">
          <p class="text-lg mb-2">No file specified</p>
          <p class="text-sm">Add file attribute to preview a file</p>
        </div>
      `;return}const i=t.split(".").pop().toLowerCase(),s=["png","jpg","jpeg","gif","webp","svg"],n=["mp4","webm","ogg"],a=["mp3","wav","ogg","m4a","aac","flac","opus"],r=["glb","gltf"];if(s.includes(i))this.content.innerHTML=`
        <img
          src="${t}"
          alt="Preview"
          class="max-w-full max-h-full object-contain w-full h-full"
        />
      `;else if(n.includes(i))this.content.innerHTML=`
        <video
          src="${t}"
          controls
          class="max-w-full max-h-full object-contain w-full h-full"
        >
          Your browser does not support the video tag.
        </video>
      `;else if(a.includes(i))this.content.innerHTML=`
        <audio-visualizer>
          <audio
            src="${t}"
            controls
            class="w-full"
          >
            Your browser does not support the audio tag.
          </audio>
        </audio-visualizer>
      `;else if(r.includes(i)){if(!customElements.get("model-viewer")){const o=document.createElement("script");o.type="module",o.src="https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js",document.head.appendChild(o)}this.content.innerHTML=`
        <model-viewer
          src="${t}"
          alt="3D Model Preview"
          camera-controls
          touch-action="pan-y"
          class="w-full h-full"
          style="--poster-color: transparent"
        >
        </model-viewer>
      `}else this.content.innerHTML=`
        <div class="w-full h-full flex items-center justify-center bg-gray-900">
          <p class="text-gray-400">Loading...</p>
        </div>
      `,fetch(t).then(o=>{if(!o.ok)throw new Error(`Failed to load file: ${o.statusText}`);return o.text()}).then(o=>{const d=c=>c.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;");this.content.innerHTML=`
            <pre class="[scrollbar-color:#fff_#0000] w-full h-full overflow-auto p-4 m-0 text-white font-mono text-sm whitespace-pre-wrap break-words">${d(o)}</pre>
          `}).catch(o=>{this.content.innerHTML=`
            <div class="w-full h-full flex items-center justify-center">
              <div class="text-center text-red-400">
                <p class="text-lg mb-2">Error loading file</p>
                <p class="text-sm">${o.message}</p>
              </div>
            </div>
          `})}open(){this.windowEl&&(this.windowEl.classList.remove("minimized"),this.windowEl.style.display="flex",this.focus())}close(){this.windowState.close()}focus(){this.windowState.focus()}toggleMaximize(){this.windowState.toggleMaximize()}}customElements.define("app-preview",lt);const tt="desktop-apps";let D=null;function B(e,t={}){const{intervalMs:i=1e3,delayMs:s=0,immediate:n=!0}=t;D||(D=new BroadcastChannel(tt),console.info("📡 BroadcastChannel opened"));const a=()=>{if(D){const d=e();D.postMessage({...d,timestamp:Date.now()})}},r=()=>(n&&a(),setInterval(a,i));let o;if(s>0){const d=setTimeout(()=>{o=r()},s);return()=>{clearTimeout(d),o&&clearInterval(o)}}else return o=r(),()=>{o&&clearInterval(o)}}function ct(){D&&(D.close(),D=null,console.info("📡 Broadcasting stopped"))}function dt(e){const t=new BroadcastChannel(tt);return t.onmessage=i=>{e(i.data)},()=>{t.close(),console.info("📻 Unsubscribed from broadcasts")}}function ht(){return window===window.top}function ut(){if(ht()){console.info("🔧 Dev mode detected - starting mock broadcaster");const e={webhooks:2e7+Math.floor(Math.random()*1e4)-5e3,nexaRpc:35e5+Math.floor(Math.random()*1e4)-5e3,database:19e8+Math.floor(Math.random()*1e4)-5e3},t={requests:254785264+Math.floor(Math.random()*1e4)-5e3,megabytes:11839866+Math.floor(Math.random()*1e4)-5e3,cdn:117273885+Math.floor(Math.random()*1e4)-5e3},i={log:53811979+Math.floor(Math.random()*1e4)-5e3,kafka:6508323+Math.floor(Math.random()*1e4)-5e3},s=2e3,n=B(()=>({type:"STATS_UPDATE",data:{message:"Hello from Dev Mode!",score:Math.floor(Math.random()*1e4)}}),{intervalMs:1e4,delayMs:s}),a=B(()=>(t.requests+=Math.floor(Math.random()*1e4)-5e3,t.megabytes+=Math.floor(Math.random()*1e4)-5e3,t.cdn+=Math.floor(Math.random()*1e4)-5e3,{type:"FRONTEND_UPDATE",data:{requests:t.requests,megabytes:t.megabytes,cdn:t.cdn}}),{intervalMs:5e3,delayMs:s}),r=B(()=>(e.webhooks+=Math.floor(Math.random()*1e4)-5e3,e.nexaRpc+=Math.floor(Math.random()*1e4)-5e3,e.database+=Math.floor(Math.random()*1e4)-5e3,{type:"BACKEND_UPDATE",data:{webhooks:e.webhooks,nexaRpc:e.nexaRpc,database:e.database}}),{intervalMs:1e4,delayMs:s}),o=B(()=>(i.log+=Math.floor(Math.random()*1e4)-5e3,i.kafka+=Math.floor(Math.random()*1e4)-5e3,{type:"OTHER_UPDATE",data:{log:i.log,kafka:i.kafka}}),{intervalMs:15e3,delayMs:s});return()=>{n(),a(),r(),o()}}}const X=()=>Math.floor(Math.random()*10),Y=(e,t,i={})=>{const{stagger:s=65,progressive:n=!0,scrambleDelay:a=100,growthDelay:r=40}=i;let o,d,c=[];return function v(){const h=t.toString(),f=h.replace(/[^0-9]/g,"");if(!d){e.dataset.scrambling="true",d=Date.now(),e.innerText,c=e.innerText.replace(/[^0-9]/g,"").split("");const l=e.innerText.length===f.length?0:Math.abs(f.length-e.innerText.replace(/[^0-9]/g,"").length);o=f.length*s*2+l*r}const b=Date.now()-d,z=Math.min(1,b/o);let _;c.length===f.length?_=f.length:_=Math.round(c.length+(f.length-c.length)*z);const E=o-f.length*s,p=Math.max(0,Math.floor((b-E)/s));let L=_;n&&(L=Math.min(_,Math.max(0,Math.floor(b/a))));const m=[];for(let l=0;l<_;l++)l<p&&l<f.length?m.push(f[l]):l<L||!n?m.push(X()):l<c.length?m.push(c[l]):m.push(X());const M=m.join(""),A=h.includes(","),T=h.includes(":");let x;if(T){let l=0;x="";for(let u=0;u<h.length;u++){const y=h[u];y.match(/[0-9]/)?l<m.length&&(x+=m[l],l++):x+=y}}else if(A){x="";const l=M.length;for(let u=0;u<l;u++)u>0&&(l-u)%3===0&&(x+=","),x+=M[u]}else x=M;e.innerText=x,Date.now()-d<=o?requestAnimationFrame(v):(e.innerText=t,d=void 0,e.dataset.scrambling="false",c=[])}};class pt extends HTMLElement{connectedCallback(){const t=this.firstElementChild;this.scrambleDelay=Math.random()*1e3,this.render(),this.setupReferences(),this.setupFocusable(),this.setupDraggable(),this.setupBroadcast(),t&&this.animationContainer&&this.animationContainer.appendChild(t)}disconnectedCallback(){this.cleanupDraggable?.(),this.cleanupFocusable?.(),this.unsubscribe?.()}render(){const t=this.getAttribute("title")||"Widget",i=this.getAttribute("type")||"edge",s=this.getAttribute("width")||"280px";this.style.width=s;const n={edge:[{label:"Edge requests / minute",id:"requests"},{label:"Edge gigabytes / minute",id:"megabytes"}],backend:[{label:"Commerce RPCs / minute",id:"nexaRpc"},{label:"Database queries / minute",id:"database"}],cdn:[{label:"CDN requests / minute",id:"cdn"},{label:"Webhooks / minute",id:"webhooks"}],logs:[{label:"Log megabytes / minute",id:"log"},{label:"Kafka messages / second",id:"kafka"}]},r=(n[i]||n.edge).map(o=>`
        <div class="grid gap-y-1">
          <div id="${o.id}" class="widget-metric-value text-3xl font-bold h-8"></div>
          <div class="widget-metric-label text-xs text-gray-400">${o.label}</div>
        </div>
    `).join("");this.innerHTML=`
      <div class="window w-full h-full">
        <div data-widget-chrome class="font-mono h-8 border-b border-gray-500 text-gray-200 flex items-center px-3 cursor-grab text-sm">
          <span data-title> ${t}</span>
        </div>
        <div data-widget-content class="p-4 grid place-items-center gap-4">
          <!-- Animation container -->
          <div class="w-full h-[140px] grid place-items-center" data-animation-container></div>

          <!-- Metrics grid -->
          <div class="grid w-full font-mono uppercase gap-y-2">
            ${r}
          </div>
        </div>
      </div>
    `}setupReferences(){this.chrome=this.querySelector("[data-widget-chrome]"),this.animationContainer=this.querySelector("[data-animation-container]")}setupFocusable(){this.cleanupFocusable=Q(this)}setupDraggable(){this.chrome&&(this.cleanupDraggable=V(this.chrome,this,{constrained:!0}))}setupBroadcast(){const t=this.getAttribute("type")||"edge",s={edge:["FRONTEND_UPDATE"],backend:["BACKEND_UPDATE"],cdn:["FRONTEND_UPDATE","BACKEND_UPDATE"],logs:["OTHER_UPDATE"]}[t]||["FRONTEND_UPDATE"];this.unsubscribe=dt(n=>{if(s.includes(n.type)){Object.keys(n.data).forEach(r=>{const o=this.querySelector(`#${r}`);if(o&&n.data[r]>0){if(o.dataset.scrambling==="true")return;o.dataset.scrambling="true",setTimeout(()=>{Y(o,n.data[r].toLocaleString("en-US"))()},this.scrambleDelay)}});const a=document.querySelector("[data-updated]");if(a&&a.dataset.scrambling!=="true"){const r=new Date().toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h12"});a.dataset.scrambling="true",Y(a,r)()}}})}}customElements.define("app-widget",pt);class gt extends HTMLElement{connectedCallback(){this.windowId=this.id||`window-${Date.now()}`,q(this),this.render(),this.setupReferences(),this.windowState=new U(this.windowEl,this.windowId,this);const t=H(this.windowId);if(t)this.windowEl.style.width=`${t.width}px`,this.windowEl.style.height=`${t.height}px`,this.windowEl.style.left=`${t.x}px`,this.windowEl.style.top=`${t.y}px`;else{const{x:i,y:s}=I(this.windowWidth,this.windowHeight);this.windowEl.style.left=`${i}px`,this.windowEl.style.top=`${s}px`}this.setupEventListeners(),this.setupDraggable(),this.setupResizable(),this.loadIframe()}disconnectedCallback(){this.cleanupDraggable&&this.cleanupDraggable(),this.cleanupResizable&&this.cleanupResizable()}render(){const t=this.getAttribute("title")||"Window",i=this.getAttribute("width")||"800px",s=this.getAttribute("height")||"600px";this.innerHTML=`
      <div class="window" style="width: ${i}; height: ${s}; display: none;">
        ${j(t)}
        <div data-window-content class="window-content"></div>
        ${N()}
      </div>
    `}setupReferences(){this.windowEl=this.querySelector(".window"),this.closeBtn=this.querySelector("[data-close]"),this.maximizeBtn=this.querySelector("[data-maximize]"),this.chrome=this.querySelector("[data-window-chrome]"),this.contentArea=this.querySelector("[data-window-content]"),this.windowWidth=P(this.getAttribute("width")||"800px"),this.windowHeight=P(this.getAttribute("height")||"600px")}setupEventListeners(){this.closeBtn&&this.closeBtn.addEventListener("click",()=>this.close()),this.maximizeBtn&&this.maximizeBtn.addEventListener("click",()=>this.toggleMaximize()),this.windowEl.addEventListener("mousedown",()=>this.focus())}setupDraggable(){this.cleanupDraggable=W(this.chrome,this.windowEl,()=>this.windowState.savePosition(),()=>this.toggleMaximize())}setupResizable(){this.cleanupResizable=R(this.windowEl,()=>this.windowState.savePosition())}loadIframe(){const t=this.getAttribute("src");if(t&&this.contentArea){this.contentArea.style.backgroundColor="#060b10";const i=document.createElement("iframe");i.src=t,i.className="w-full h-full border-0",i.style.backgroundColor="#060b10",i.setAttribute("loading","eager"),i.setAttribute("allow","autoplay; fullscreen; gamepad"),i.allow="autoplay; fullscreen; gamepad",this.contentArea.appendChild(i)}}open(){this.windowEl&&(this.windowEl.classList.remove("minimized"),this.windowEl.style.display="flex",this.focus())}close(){this.windowState.close()}focus(){this.windowState.focus()}toggleMaximize(){this.windowState.toggleMaximize()}}customElements.define("app-window",gt);class wt extends HTMLElement{
  connectedCallback(){
    this.render();
    this.setupReferences();
    this.updateDateTime();
    this.interval = setInterval(() => this.updateDateTime(), 1000);
  }
  disconnectedCallback(){
    if (this.interval) clearInterval(this.interval);
  }
  render(){
    this.className = "menu-bar font-mono fixed top-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-xs z-50 select-none bg-[#090d16]/95 border-b border-cyan-500/30 backdrop-blur";
    this.innerHTML = `
      <div class="flex items-center gap-2 text-cyan-400 shrink-0 whitespace-nowrap">
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        <span class="font-bold tracking-wider text-cyan-300 whitespace-nowrap">NEXA // RETRO OS</span>
      </div>
      <div class="flex items-center gap-3 font-mono text-xs">
        <span class="text-cyan-500/60 hidden sm:inline">SYS_CLOCK</span>
        <span data-date class="text-gray-300 font-medium"></span>
        <span class="text-cyan-500/50">|</span>
        <span data-time class="text-cyan-300 font-bold tracking-wider"></span>
        <button type="button" data-exit-os class="ml-4 px-2.5 py-0.5 whitespace-nowrap rounded bg-cyan-950/80 hover:bg-red-500/30 text-cyan-300 hover:text-red-300 border border-cyan-500/40 hover:border-red-500/40 transition-colors cursor-pointer text-[11px] font-mono flex items-center gap-1" title="Exit to Workshop (Esc)">
          <span>✕</span> Exit
        </button>
      </div>
    `;
  }
  setupReferences(){
    this.dateElement = this.querySelector("[data-date]");
    this.timeElement = this.querySelector("[data-time]");
    this.querySelector("[data-exit-os]")?.addEventListener("click", () => {
      window.parent.postMessage({ type: "EXIT_COMPUTER_MODE" }, "*");
    });
  }
  updateDateTime(){
    const t = new Date();
    if (this.dateElement) {
      this.dateElement.textContent = t.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
      });
    }
    if (this.timeElement) {
      this.timeElement.textContent = t.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      });
    }
  }
}customElements.define("desktop-status",wt);class ft extends HTMLElement{connectedCallback(){this.barCount=8,this.audioElement=this.querySelector("audio"),this.render(),this.setupAudio()}disconnectedCallback(){this.cleanup()}render(){this.className="w-full h-full flex flex-col relative items-center justify-center gap-4 p-8 scheme-only-dark",this.dataset.playing="false",this.innerHTML="";const t=document.createElement("div");t.className="visualization-container",t.dataset.visualizer="",this.renderBars(t),this.appendChild(t),this.audioElement&&(this.audioElement.className="w-full mt-4",this.appendChild(this.audioElement))}renderBars(t){t.innerHTML=`
      <svg viewBox="0 0 996 605" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="100" height="605" rx="12" fill="#299900"/>
        <rect x="128" width="100" height="605" rx="12" fill="#299900"/>
        <rect x="256" width="100" height="605" rx="12" fill="#299900"/>
        <rect x="384" width="100" height="605" rx="12" fill="#299900"/>
        <rect x="512" width="100" height="605" rx="12" fill="#299900"/>
        <rect x="640" width="100" height="605" rx="12" fill="#299900"/>
        <rect x="768" width="100" height="605" rx="12" fill="#299900"/>
        <rect x="896" width="100" height="605" rx="12" fill="#299900"/>
      </svg>
    `}setupAudio(){if(!this.audioElement){console.warn("No audio element found in audio-visualizer");return}try{this.audioContext=new(window.AudioContext||window.webkitAudioContext),this.analyser=this.audioContext.createAnalyser();const t=Math.pow(2,Math.ceil(Math.log2(this.barCount*4)));this.analyser.fftSize=Math.min(2048,Math.max(128,t)),this.analyser.smoothingTimeConstant=.75,this.source=this.audioContext.createMediaElementSource(this.audioElement),this.source.connect(this.analyser),this.analyser.connect(this.audioContext.destination),this.dataArray=new Uint8Array(this.analyser.frequencyBinCount),this.cachedBars=null,this.isPlaying=!1;const i=async()=>{this.audioContext.state==="suspended"&&await this.audioContext.resume(),this.isPlaying=!0,this.dataset.playing="true",this.visualize()},s=()=>{this.isPlaying=!1,this.dataset.playing="false"};this.audioElement.addEventListener("play",i),this.audioElement.addEventListener("pause",s),this.audioElement.addEventListener("ended",s),this.playHandler=i,this.pauseHandler=s}catch(t){console.error("Error setting up audio visualizer:",t)}}visualize(){if(!this.isPlaying)return;this.analyser.getByteFrequencyData(this.dataArray);const t=this.getBarData();this.updateBars(t),this.rafId=requestAnimationFrame(this.visualize.bind(this))}getBarData(){const t=[],i=Math.floor(this.dataArray.length/this.barCount);for(let s=0;s<this.barCount;s++){let n=0;const a=s*i,r=a+i;for(let d=a;d<r;d++)n+=this.dataArray[d];const o=n/i/255;t.push(o)}return t}updateBars(t){this.cachedBars||(this.cachedBars=this.querySelectorAll("svg rect"));for(let i=0;i<this.cachedBars.length;i++){const s=t[i]||0;this.cachedBars[i].style.setProperty("--audio-value",s.toFixed(3))}}cleanup(){this.isPlaying=!1,this.rafId&&(cancelAnimationFrame(this.rafId),this.rafId=null),this.audioElement&&this.playHandler&&this.pauseHandler&&(this.audioElement.removeEventListener("play",this.playHandler),this.audioElement.removeEventListener("pause",this.pauseHandler),this.audioElement.removeEventListener("ended",this.pauseHandler)),this.source&&this.source.disconnect(),this.analyser&&this.analyser.disconnect(),this.audioContext&&this.audioContext.state!=="closed"&&this.audioContext.close(),this.cachedBars=null}}customElements.define("audio-visualizer",ft);class mt extends HTMLElement{connectedCallback(){this.innerHTML=`
      <svg class="db w-full h-full" viewBox="0 0 1202 605" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="134" height="134" rx="29" />
        <rect y="157" width="134" height="134" rx="29" />
        <rect y="314" width="134" height="134" rx="29" />
        <rect y="471" width="134" height="134" rx="29" />
        <rect x="157" width="134" height="134" rx="29" />
        <rect x="157" y="157" width="134" height="134" rx="29" />
        <rect x="157" y="471" width="134" height="134" rx="29" />
        <rect x="157" y="314" width="134" height="134" rx="29" />
        <rect x="314" width="134" height="134" rx="29" />
        <rect x="314" y="157" width="134" height="134" rx="29" />
        <rect x="314" y="471" width="134" height="134" rx="29" />
        <rect x="314" y="314" width="134" height="134" rx="29" />
        <rect x="466" width="134" height="134" rx="29" />
        <rect x="466" y="157" width="134" height="134" rx="29" />
        <rect x="466" y="471" width="134" height="134" rx="29" />
        <rect x="466" y="314" width="134" height="134" rx="29" />
        <rect x="615" width="134" height="134" rx="29" />
        <rect x="615" y="157" width="134" height="134" rx="29" />
        <rect x="615" y="471" width="134" height="134" rx="29" />
        <rect x="615" y="314" width="134" height="134" rx="29" />
        <rect x="767" width="134" height="134" rx="29" />
        <rect x="767" y="157" width="134" height="134" rx="29" />
        <rect x="767" y="471" width="134" height="134" rx="29" />
        <rect x="767" y="314" width="134" height="134" rx="29" />
        <rect x="916" width="134" height="134" rx="29" />
        <rect x="916" y="157" width="134" height="134" rx="29" />
        <rect x="916" y="471" width="134" height="134" rx="29" />
        <rect x="916" y="314" width="134" height="134" rx="29" />
        <rect x="1068" width="134" height="134" rx="29" />
        <rect x="1068" y="157" width="134" height="134" rx="29" />
        <rect x="1068" y="471" width="134" height="134" rx="29" />
        <rect x="1068" y="314" width="134" height="134" rx="29" />
      </svg>
    `,this.querySelectorAll("rect").forEach((i,s)=>{const n=.8+Math.random()*1.7,a=-Math.random()*n,r=130+Math.floor(Math.random()*30);i.style.setProperty("--duration",`${n}s`),i.style.setProperty("--delay",`${a}s`),i.style.setProperty("--intensity","1"),i.style.setProperty("--hue",r)})}}customElements.define("backend-animation",mt);class xt extends HTMLElement{connectedCallback(){this.innerHTML=`
      <svg class="network w-full h-full" viewBox="200 0 1153 619" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path pathLength="1" class="network__backdrop" d="M-4.71175e-05 30.0001L1353 30.0003M1353 30.0003L998.5 30.0005M1353 30.0003L997.5 30M998.5 30.0005L676.501 309L355.501 589M998.5 30.0005L838 168.999L-5.06043e-05 169L1353 169H838M998.5 30.0005L1353.5 30.0003L997.5 30M-0.5 589L355.501 589M355.501 589L515.999 449H1356.5M355.501 589L677 309M355.501 589L838 169M677 309L-4.88758e-05 309.001H1353L677 309ZM677 309L838 169M677 309L-2.96831e-05 309M677 309L997.5 30M677 309L516.5 449M677 309L1353.5 309M838 169L1354 169M838 169L516.5 449M-4.35114e-05 589L1353 589M997.5 30L516.5 449M1353 449.001L-5.05745e-05 449.001L516.5 449M516.5 449L-1.28448e-05 449" />
        <line pathLength="1" class="network__line" x1="1.74846e-06" y1="30" x2="1353" y2="30.0001" />
        <path pathLength="1" class="network__line" d="M-0.499951 589L355.501 589L676.501 309L998.5 30.0004L1353 30.0004" />
        <path pathLength="1" class="network__line" d="M-0.499988 589L355.501 589L516 449L945.5 449L1356.5 449" />
        <path pathLength="1" class="network__line" d="M-0.499976 589L355.501 589L677 309L1060.5 309L1353.5 309" />
        <path pathLength="1" class="network__line" d="M-0.499963 589L355.501 589L838 169L1127 169L1353 169" />
        <line pathLength="1" class="network__line" x1="5.37271e-06" y1="589" x2="1353" y2="589" />
        <line pathLength="1" class="network__line" x1="-1.74846e-06" y1="169" x2="1353" y2="169" />
        <path pathLength="1" class="network__line" d="M1.21517e-05 168.999L838 168.999L998.5 29.9999L1353.5 29.9999" />
        <line pathLength="1" class="network__line" x1="-1.71925e-06" y1="449" x2="1353" y2="449" />
        <path pathLength="1" class="network__line" d="M1.20347e-05 449L516.5 449L677 309L1353 309" />
        <path pathLength="1" class="network__line" d="M3.60183e-05 448.999L516.5 448.999L997.5 30L1353 30" />
        <path pathLength="1" class="network__line" d="M2.40696e-05 449L516.5 449L838 169L1353 169" />
        <path pathLength="1" class="network__line" d="M0 309.001L1353 309.001" />
        <path pathLength="1" class="network__line" d="M1.22392e-05 309L677 309L838 169L1354 169" />
        <path pathLength="1" class="network__line" d="M2.43909e-05 309L677 309L997.5 29.9999L1353.5 29.9999" />
      </svg>
    `,this.querySelectorAll(".network__line").forEach(i=>{const s=2+Math.random()*2,n=Math.random()*3,a=20+Math.floor(Math.random()*40),r=(10+Math.floor(Math.random()*10))/100;i.style.setProperty("--duration",s.toFixed(2)),i.style.setProperty("--delay",n.toFixed(2)),i.style.setProperty("--stroke-dash",r),i.style.setProperty("--hue",a)})}}customElements.define("cdn-animation",xt);class yt extends HTMLElement{connectedCallback(){this.innerHTML=`
      <svg class="edge w-full h-full" viewBox="0 0 1353 700" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g class="edge__request" style="transform-origin: 50% 715px;">
      <path d="M529.888 60.0883C628.126 39.5805 729.58 39.9824 827.652 61.2679L737.496 476.659C697.727 468.027 656.587 467.864 616.751 476.18L529.888 60.0883Z" />
      <path d="M529.888 60.0883C628.126 39.5805 729.58 39.9824 827.652 61.2679L817.064 110.055C725.839 90.2554 631.469 89.8816 540.09 108.957L529.888 60.0883Z" />
      </g>
      <g class="edge__request" style="transform-origin: 50% 618px;">
      <path d="M549.248 155.138C634.304 137.314 722.163 137.629 807.089 156.063L738.499 472.064C698.009 463.276 656.121 463.125 615.569 471.623L549.248 155.138Z" />
      <path d="M549.749 155.033C634.745 137.296 722.524 137.667 807.367 156.123L796.808 204.659C718.785 187.686 638.06 187.344 559.896 203.656L549.749 155.033Z" />
      </g>
      <g class="edge__request" style="transform-origin: 50% 524px;">
      <path d="M568.527 247.14C640.646 232.027 715.141 232.294 787.15 247.924L738.534 471.904C698.021 463.11 656.11 462.96 615.535 471.463L568.527 247.14Z" />
      <path d="M568.952 247.051C641.02 232.011 715.448 232.326 787.385 247.975L776.247 299.178C711.503 285.093 644.518 284.81 579.657 298.346L568.952 247.051Z" />
      </g>
      <g class="edge__request" style="transform-origin: 50% 418px;">
      <path d="M588.627 343.056C647.258 330.77 707.821 330.987 766.362 343.694L738.605 471.573C698.046 462.769 656.087 462.619 615.466 471.131L588.627 343.056Z" />
      <path d="M588.973 342.984C647.562 330.757 708.07 331.013 766.554 343.736L757.498 385.362C704.863 373.912 650.406 373.681 597.675 384.686L588.973 342.984Z" />
      </g>
      <path class="edge__arc" d="M997 760C997 933.417 856.417 1074 683 1074C509.583 1074 369 933.417 369 760C369 586.583 509.583 446 683 446C856.417 446 997 586.583 997 760ZM400.4 760C400.4 916.076 526.924 1042.6 683 1042.6C839.076 1042.6 965.6 916.076 965.6 760C965.6 603.924 839.076 477.4 683 477.4C526.924 477.4 400.4 603.924 400.4 760Z" />
      </svg>
      `,this.innerHTML=`
      <svg class="edge w-full h-full" viewBox="10 0 1333 760" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g class="edge__arcs">
          <circle cx="676" cy="760" r="325" />
          <circle cx="676" cy="760" r="453" />
          <circle cx="676" cy="760" r="576" />
          <circle cx="676" cy="760" r="701" />
        </g>
        <g class="edge__request">
          <path class="edge__scan" d="M591.884 446.074C646.989 431.309 705.011 431.309 760.116 446.074L676 760L591.884 446.074Z" />
          <circle class="edge__beam" cx="676" cy="760" r="325" pathLength="1" stroke-dasharray="0.08 0.925" stroke-dashoffset="-0.7105"/>
        </g>
        <g class="edge__request">
          <path class="edge__scan" d="M558.755 322.436C635.564 301.855 716.436 301.855 793.245 322.436L676 760L558.755 322.436Z" />
          <circle class="edge__beam" cx="676" cy="760" r="453" pathLength="1" stroke-dasharray="0.08 0.925" stroke-dashoffset="-0.7105"/>
        </g>
        <g class="edge__request">
          <path class="edge__scan" d="M526.92 203.627C624.584 177.458 727.416 177.458 825.08 203.627L676 760L526.92 203.627Z" />
          <circle class="edge__beam" cx="676" cy="760" r="576" pathLength="1" stroke-dasharray="0.08 0.925" stroke-dashoffset="-0.7105"/>
        </g>
        <g class="edge__request">
          <path class="edge__scan" d="M494.568 82.886C613.426 51.038 738.574 51.038 857.432 82.886L676 760L494.568 82.886Z" />
          <circle class="edge__beam" cx="676" cy="760" r="701" pathLength="1" stroke-dasharray="0.08 0.925" stroke-dashoffset="-0.7105"/>
        </g>
        <circle class="edge__center"cx="676" cy="760" r="180" />
      </svg>
    `,this.querySelectorAll(".edge__request").forEach(i=>{const s=2+Math.random()*2,n=Math.random()*3,a=Math.random()*75,r=Math.random()*75,o=Math.random()*75,d=Math.random()*75;i.style.setProperty("--duration",s.toFixed(2)),i.style.setProperty("--delay",n.toFixed(2)),i.style.setProperty("--target-one",a.toFixed(0)),i.style.setProperty("--target-two",r.toFixed(0)),i.style.setProperty("--target-three",o.toFixed(0)),i.style.setProperty("--target-four",d.toFixed(0))})}}customElements.define("edge-animation",yt);class vt extends HTMLElement{connectedCallback(){const i=Array.from({length:12},(s,n)=>{const a=1+Math.floor(Math.random()*3),r=Array.from({length:a},(o,d)=>{const c=d===0?0:Math.random()*1353,v=1353*(.1+Math.random()*.5),h=200+Math.floor(Math.random()*100);return`<rect rx="20" ry="20" x="${c}" y="650" width="${v}" height="90" style="--hue: ${h}"/>`}).join("");return`<g class="logs__line" style="--i: ${n}">${r}</g>`}).join("");this.innerHTML=`
      <svg class="logs w-full h-full" viewBox="0 0 1353 760" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${i}
      </svg>
    `}}customElements.define("logs-animation",vt);function bt(){const e=document.querySelector("#desktop-context-menu"),t=e.querySelector("[data-exit-computer-mode]"),i=e.querySelector("[data-show-screensaver]"),s=document.querySelector(".shop-x"),n=document.querySelector("main");if(!n)return;n.addEventListener("contextmenu",r=>{(r.target===n||r.target.closest("[data-desktop-area]"))&&(r.preventDefault(),e.style.position="fixed",e.style.left=`${r.clientX}px`,e.style.top=`${r.clientY}px`,document.addEventListener("pointerup",()=>{e.showPopover()},{once:!0}))});const a=document.querySelector("#desktop-screensaver");i.addEventListener("click",()=>{a.showPopover(),e.hidePopover()}),a.addEventListener("beforetoggle",r=>{r.newState==="open"&&s.style.setProperty("animation-delay",`${Math.random()*-25}s`)}),t.addEventListener("click",()=>{window.parent.postMessage({type:"EXIT_COMPUTER_MODE"},"*"),e.hidePopover()})}function Mt(){const e=t=>{t.key==="Escape"&&window.parent.postMessage({type:"EXIT_COMPUTER_MODE"},"*")};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)}Mt();const Z=ut();bt();k.init();window.addEventListener("beforeunload",()=>{Z&&Z(),ct()});window.addEventListener("message",e=>{if(e.data&&e.data.type==="EXIT_COMPUTER_MODE"&&window.parent&&window.parent!==window){window.parent.postMessage({type:"EXIT_COMPUTER_MODE"},"*")}});
