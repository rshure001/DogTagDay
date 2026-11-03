import fs from 'node:fs/promises';
const OUT='everythinghub-index';
const MAX=Number(process.env.MAX_PAGES||50);
const UA='EverythingHubResearchBot/1.0 (+https://everythinghub-expansion.vercel.app/)';
const SEEDS=[
'https://www.wikipedia.org/','https://www.nasa.gov/','https://www.loc.gov/','https://www.si.edu/','https://www.noaa.gov/',
'https://www.nps.gov/','https://www.usa.gov/','https://www.nih.gov/','https://www.cdc.gov/','https://www.energy.gov/',
'https://www.usgs.gov/','https://www.census.gov/','https://www.congress.gov/','https://www.weather.gov/','https://www.fda.gov/',
'https://www.un.org/','https://www.who.int/','https://www.unesco.org/','https://www.worldbank.org/','https://www.imf.org/',
'https://www.archive.org/','https://commons.wikimedia.org/','https://www.openstreetmap.org/','https://developer.mozilla.org/',
'https://www.python.org/','https://nodejs.org/','https://www.metmuseum.org/','https://www.nist.gov/','https://www.nature.com/',
'https://arxiv.org/','https://www.ed.gov/','https://www.dol.gov/','https://www.irs.gov/'
];
const hosts=new Set(SEEDS.map(s=>new URL(s).hostname));
const canon=s=>{const u=new URL(s);u.hash='';for(const k of [...u.searchParams.keys()])if(/^(utm_|fbclid|gclid)/i.test(k))u.searchParams.delete(k);return u.href;};
const text=s=>(s||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/\s+/g,' ').trim();
const robots=new Map();
async function allowed(url){
 const u=new URL(url);
 if(!robots.has(u.origin)){
  let dis=[];try{const r=await fetch(u.origin+'/robots.txt',{headers:{'User-Agent':UA},signal:AbortSignal.timeout(8000)});
   if(r.ok){let active=false;for(const line of (await r.text()).split(/\r?\n/)){const [k,...v]=line.split(':');if(!k)continue;
    if(k.trim().toLowerCase()==='user-agent')active=v.join(':').trim()==='*';
    else if(active&&k.trim().toLowerCase()==='disallow'&&v.join(':').trim())dis.push(v.join(':').trim());
   }}
  }catch{}robots.set(u.origin,dis);
 }
 return !robots.get(u.origin).some(p=>u.pathname.startsWith(p));
}
await fs.mkdir(OUT,{recursive:true});
let old=[];try{old=JSON.parse(await fs.readFile(OUT+'/pages.json','utf8'));}catch{}
let frontier=[];try{frontier=JSON.parse(await fs.readFile(OUT+'/frontier.json','utf8'));}catch{}
const records=new Map(old.map(p=>[p.url,p]));
const known=new Set([...records.keys(),...frontier]);
if(frontier.length===0)frontier=SEEDS.map(canon);
let queue=[...new Set(frontier.map(canon))],seen=new Set(),count=0;
while(queue.length&&count<MAX){
 const url=queue.shift();if(seen.has(url))continue;seen.add(url);
 let parsed;try{parsed=new URL(url);}catch{continue;}
 if(!hosts.has(parsed.hostname)||!(await allowed(url)))continue;
 try{
  const r=await fetch(url,{headers:{'User-Agent':UA,Accept:'text/html'},redirect:'follow',signal:AbortSignal.timeout(10000)});
  if(!r.ok||!(r.headers.get('content-type')||'').includes('text/html'))continue;
  const finalUrl=canon(r.url);if(!hosts.has(new URL(finalUrl).hostname)||!(await allowed(finalUrl)))continue;
  const html=await r.text();if(html.length>1500000)continue;
  const title=text(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]||'')||new URL(finalUrl).hostname;
  const desc=text(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)?.[1]||'').slice(0,350);
  records.set(finalUrl,{url:finalUrl,title,description:desc,excerpt:text(html).slice(0,1200),fetchedAt:new Date().toISOString()});count++;
  for(const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["']/gi)){
   try{const link=canon(new URL(m[1],finalUrl).href);if(hosts.has(new URL(link).hostname)&&!seen.has(link)&&!known.has(link)){queue.push(link);known.add(link);}}catch{}
  }
  await new Promise(resolve=>setTimeout(resolve,700));
 }catch(e){console.log('Skipped',url,String(e).slice(0,100));}
}
const pages=[...records.values()];
await fs.writeFile(OUT+'/pages.json',JSON.stringify(pages,null,2)+'\n');
await fs.writeFile(OUT+'/frontier.json',JSON.stringify([...new Set(queue)],null,2)+'\n');
const xml='<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+pages.map(p=>'  <url><loc>'+p.url.replace(/&/g,'&amp;')+'</loc></url>').join('\n')+'\n</urlset>\n';
await fs.writeFile(OUT+'/sitemap.xml',xml);
console.log(JSON.stringify({newPagesThisRun:count,totalUniquePages:pages.length,queuedForNextRun:queue.length,approvedHosts:hosts.size},null,2));
