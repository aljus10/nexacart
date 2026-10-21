export const ENTRY_TRANSITION_MS=1180;
export const ENTRY_QUICK_TRANSITION_MS=240;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export const smooth=(v:number)=>{const t=clamp(v);return t*t*(3-2*t);};
export const easeOut=(v:number)=>1-Math.pow(1-clamp(v),3);
export const studioFraming=(width:number,height:number)=>{
 const aspect=width/Math.max(1,height);
 const zoom=aspect>=1.2?3.0:Math.min(2.2,aspect*4.6);
 const targetY=aspect>=1.2?2.15:2.25;
 return {zoom,targetY};
};
export function cartIntro(seconds:number,reduced=false){
 if(reduced)return {x:0,parcelY:.78,parcelSquash:1,wheel:0};
 const dropStart=0.02,fallDuration=0.46,impactTime=0.48;
 const fallProgress=clamp((seconds-dropStart)/fallDuration);
 const gravityFall=Math.pow(1-fallProgress,2);
 const secondsAfterImpact=Math.max(0,seconds-impactTime);
 let bounce=0;
 if(seconds>=impactTime&&secondsAfterImpact<0.35){
  bounce=Math.max(0,Math.sin(secondsAfterImpact*18))*Math.exp(-secondsAfterImpact*15)*0.045;
 }
 const parcelY=.78+gravityFall*1.35+bounce;
 const impact=(seconds>=impactTime&&secondsAfterImpact<0.25)?Math.exp(-Math.pow(secondsAfterImpact/0.055,2)):0;
 const parcelSquash=1-impact*0.035;
 return {x:0,parcelY,parcelSquash,wheel:0};
}
export function entryReveal(progress:number){const t=clamp(progress);return {camera:smooth(t),cart:easeOut(t),landScale:.075+.925*easeOut((t-.14)/.86),landOpacity:smooth((t-.12)/.5)};}
