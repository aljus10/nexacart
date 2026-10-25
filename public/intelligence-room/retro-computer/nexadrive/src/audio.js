export class FlightAudio{
 constructor(){this.enabled=false;this.context=null;}
 async enable(value){
  this.enabled=value;
  if(!value){
   this.master?.gain.setTargetAtTime(0,this.context?.currentTime||0,.05);
   if(this.context&&this.context.state==='running'){try{await this.context.suspend();}catch{}}
   return;
  }
  try{
   if(!this.context){
    const Audio=window.AudioContext||window.webkitAudioContext;
    this.context=new Audio();
    this.master=this.context.createGain();
    this.master.gain.value=0;
    this.master.connect(this.context.destination);
    this.engine=this.context.createOscillator();
    this.engine.type='sawtooth';
    const filter=this.context.createBiquadFilter();
    filter.type='lowpass';
    filter.frequency.value=180;
    this.engine.connect(filter);
    filter.connect(this.master);
    this.engine.start();
    this.sub=this.context.createOscillator();
    this.sub.type='sine';
    this.sub.frequency.value=48;
    this.subGain=this.context.createGain();
    this.subGain.gain.value=.16;
    this.sub.connect(this.subGain);
    this.subGain.connect(this.master);
    this.sub.start();
   }
   if(this.context.state==='suspended'){await this.context.resume();}
  }catch{this.enabled=false;}
 }
 update(state,active){if(!this.context)return;const t=this.context.currentTime;this.master.gain.setTargetAtTime(this.enabled&&active?0.045:0,t,.13);this.engine.frequency.setTargetAtTime(35+state.speed*.36+(state.boosting?25:0),t,.12);this.sub.frequency.setTargetAtTime(32+state.speed*.15,t,.15);}
 event(type){if(!this.context||!this.enabled)return;const c=this.context,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type=type==='collision'?'sawtooth':'sine';const frequencies=type==='perfect'?[880,1320]:type==='gate'?[660,990]:type==='collision'?[80,30]:type==='finish'?[660,1760]:[220,330];o.frequency.setValueAtTime(frequencies[0],t);o.frequency.exponentialRampToValueAtTime(frequencies[1],t+.17);g.gain.setValueAtTime(type==='collision'?.05:.035,t);g.gain.exponentialRampToValueAtTime(.0001,t+.3);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+.31);}
}
