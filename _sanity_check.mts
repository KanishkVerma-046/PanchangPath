import { sunLongitude, moonLongitude, lahiriAyanamsha, calcLagna } from './src/lib/astro-core.ts';

function toJD(y:number,m:number,d:number,h=0){
  if(m<=2){y--;m+=12;}
  const A=Math.floor(y/100),B=2-A+Math.floor(A/4);
  return Math.floor(365.25*(y+4716))+Math.floor(30.6001*(m+1))+d+h/24+B-1524.5;
}
const n360=(a:number)=>((a%360)+360)%360;

const loc = {lat:28.6139,lng:77.209,tz:5.5};
const jd = toJD(2026,7,20,6-loc.tz);
const sunLon = sunLongitude(jd);
const moonLon = moonLongitude(jd);
const ay = lahiriAyanamsha(jd);
const sunSid = n360(sunLon-ay);
const moonSid = n360(moonLon-ay);
const RASHI=['Mesha','Vrishabha','Mithuna','Karka','Simha','Kanya','Tula','Vrishchika','Dhanu','Makara','Kumbha','Meena'];
console.log('jd', jd);
console.log('ayanamsha', ay.toFixed(4));
console.log('sunLon(tropical)', sunLon.toFixed(3), 'sunSid', sunSid.toFixed(3), 'sign', RASHI[Math.floor(sunSid/30)]);
console.log('moonLon(tropical)', moonLon.toFixed(3), 'moonSid', moonSid.toFixed(3), 'sign', RASHI[Math.floor(moonSid/30)]);

const lagTrop = calcLagna(jd, loc.lat, loc.lng);
const lagSid = n360(lagTrop - ay);
console.log('lagna tropical', lagTrop.toFixed(3), 'sidereal', lagSid.toFixed(3), 'sign', RASHI[Math.floor(lagSid/30)]);
