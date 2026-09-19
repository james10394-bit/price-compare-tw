import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const SERPER_API_KEY = process.env.SERPER_API_KEY || "";
const VERSION = "1.4.0";

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname,"public"),{
  etag:false,maxAge:0,
  setHeaders:res=>res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate")
}));

const CHANNELS=[
{id:"shopee",name:"蝦皮購物",group:"大型電商",priority:1,categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品","寵物用品","家具寢具"],domains:["shopee.tw"],search:q=>`https://shopee.tw/search?keyword=${encodeURIComponent(q)}`},
{id:"momo",name:"momo購物網",group:"大型電商",priority:2,categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品","寵物用品"],domains:["momoshop.com.tw"],search:q=>`https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}`},
{id:"pchome",name:"PChome 24h",group:"大型電商",priority:3,categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品"],domains:["pchome.com.tw","24h.pchome.com.tw"],search:q=>`https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}`},
{id:"yahoo",name:"Yahoo購物中心",group:"大型電商",priority:4,categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用"],domains:["tw.buy.yahoo.com"],search:q=>`https://tw.buy.yahoo.com/search/product?p=${encodeURIComponent(q)}`},
{id:"ruten",name:"露天市集",group:"大型電商",priority:5,categories:["3C","手機平板","生活用品"],domains:["ruten.com.tw"],search:q=>`https://www.ruten.com.tw/find/?q=${encodeURIComponent(q)}`},
{id:"apple",name:"Apple 官方商店",group:"手機品牌官方",priority:1,categories:["手機平板","3C"],domains:["apple.com"],search:q=>`https://www.apple.com/tw/search/${encodeURIComponent(q)}?src=globalnav`},
{id:"samsung",name:"Samsung 官方商城",group:"手機品牌官方",priority:2,categories:["手機平板","3C"],domains:["samsung.com"],search:q=>`https://www.samsung.com/tw/search/?searchvalue=${encodeURIComponent(q)}`},
{id:"xiaomi",name:"小米台灣官方",group:"手機品牌官方",priority:3,categories:["手機平板","3C","生活家電"],domains:["mi.com"],search:q=>`https://www.mi.com/tw/search?keyword=${encodeURIComponent(q)}`},
{id:"cht",name:"中華電信網路門市",group:"三大電信",priority:1,categories:["手機平板"],domains:["cht.com.tw"],search:q=>`https://www.cht.com.tw/home/consumer/search?keyword=${encodeURIComponent(q)}`},
{id:"myfone",name:"台灣大哥大 myfone",group:"三大電信",priority:2,categories:["手機平板","3C"],domains:["myfone.com.tw"],search:q=>`https://www.myfone.com.tw/mfo/buy/list?keyword=${encodeURIComponent(q)}`},
{id:"fet",name:"遠傳網路門市",group:"三大電信",priority:3,categories:["手機平板"],domains:["fetnet.net"],search:q=>`https://www.fetnet.net/estore/search?keyword=${encodeURIComponent(q)}`},
{id:"landtop",name:"地標網通",group:"手機零售",priority:1,categories:["手機平板"],domains:["landtop.com.tw"],search:q=>`https://www.landtop.com.tw/search?q=${encodeURIComponent(q)}`},
{id:"senao",name:"神腦國際",group:"手機零售",priority:2,categories:["手機平板","3C"],domains:["senao.com.tw"],search:q=>`https://online.senao.com.tw/Search?keyword=${encodeURIComponent(q)}`},
{id:"tk3c",name:"燦坤3C",group:"3C賣場",priority:1,categories:["3C","手機平板","大家電","廚房家電","生活家電"],domains:["tk3c.com"],search:q=>`https://www.tk3c.com/search.aspx?q=${encodeURIComponent(q)}`},
{id:"sunfar",name:"順發3C",group:"3C賣場",priority:2,categories:["3C","手機平板"],domains:["sunfar.com.tw"],search:q=>`https://www.sunfar.com.tw/ecsfweb/search.aspx?keyword=${encodeURIComponent(q)}`},
{id:"nova",name:"NOVA資訊廣場",group:"3C賣場",priority:3,categories:["3C","手機平板"],domains:["nova.com.tw"],search:q=>`https://www.nova.com.tw/search?keyword=${encodeURIComponent(q)}`},
{id:"elifemall",name:"全國電子",group:"3C賣場",priority:4,categories:["3C","手機平板","大家電","廚房家電","生活家電"],domains:["elifemall.com.tw"],search:q=>`https://www.elifemall.com.tw/search?keyword=${encodeURIComponent(q)}`},
{id:"sinya",name:"欣亞數位",group:"3C賣場",priority:5,categories:["3C"],domains:["sinya.com.tw"],search:q=>`https://www.sinya.com.tw/search/?keyword=${encodeURIComponent(q)}`},
{id:"eclife",name:"EcLife良興",group:"3C賣場",priority:6,categories:["3C","生活家電"],domains:["ec-life.com"],search:q=>`https://www.ec-life.com/search?keyword=${encodeURIComponent(q)}`},
{id:"coolpc",name:"原價屋",group:"3C賣場",priority:7,categories:["3C"],domains:["coolpc.com.tw"],search:q=>`https://www.coolpc.com.tw/evaluate.php`},
{id:"autobuy",name:"AUTOBUY",group:"3C賣場",priority:8,categories:["3C"],domains:["autobuy.tw"],search:q=>`https://www.autobuy.tw/search?q=${encodeURIComponent(q)}`},
{id:"poya",name:"寶雅 POYA",group:"美妝藥妝",priority:1,categories:["美妝日用","生活用品","清潔用品"],domains:["poya.com.tw","poyabuy.com.tw"],search:q=>`https://www.poyabuy.com.tw/v2/Search?q=${encodeURIComponent(q)}`},
{id:"cosmed",name:"康是美 COSMED",group:"美妝藥妝",priority:2,categories:["美妝日用","生活用品"],domains:["cosmed.com.tw"],search:q=>`https://shop.cosmed.com.tw/v2/Search?q=${encodeURIComponent(q)}`},
{id:"watsons",name:"屈臣氏 Watsons",group:"美妝藥妝",priority:3,categories:["美妝日用","生活用品"],domains:["watsons.com.tw"],search:q=>`https://www.watsons.com.tw/search?text=${encodeURIComponent(q)}`},
{id:"tomods",name:"Tomod's",group:"美妝藥妝",priority:4,categories:["美妝日用","生活用品"],domains:["tomods.com.tw"],search:q=>`https://www.tomods.com.tw/search?keyword=${encodeURIComponent(q)}`},
{id:"matsumoto",name:"松本清",group:"美妝藥妝",priority:5,categories:["美妝日用","生活用品"],domains:["matsumotokiyoshi-tw.com"],search:q=>`https://www.matsumotokiyoshi-tw.com/search?q=${encodeURIComponent(q)}`},
{id:"costco",name:"Costco",group:"量販",priority:1,categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品"],domains:["costco.com.tw"],search:q=>`https://www.costco.com.tw/search?text=${encodeURIComponent(q)}`}
];

const COMPARISON_SITES=[
  {id:"findprice",name:"FindPrice 價格網",domain:"findprice.com.tw",search:q=>`https://www.findprice.com.tw/g/${encodeURIComponent(q)}`},
  {id:"feebee",name:"飛比價格",domain:"feebee.com.tw",search:q=>`https://feebee.com.tw/s/${encodeURIComponent(q)}/`},
  {id:"price",name:"Price.com.tw",domain:"price.com.tw",search:q=>`https://www.price.com.tw/search/?q=${encodeURIComponent(q)}`}
];

const channelById=Object.fromEntries(CHANNELS.map(c=>[c.id,c]));
const UA="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";

function normalizeText(s){return String(s||"").toLowerCase().replace(/&nbsp;|\s|[_\-\/\\()[\]{}：:，,。.!！?？]/g,"")}
function tokens(q){return String(q||"").split(/\s+/).map(normalizeText).filter(x=>x.length>=2)}
function modelMatch(title,q){const t=normalizeText(title),ts=tokens(q);if(!ts.length)return{score:0,confidence:"low"};let hits=0;for(const x of ts)if(t.includes(x))hits++;const ratio=hits/ts.length;const score=t.includes(normalizeText(q))?100:Math.round(ratio*90);return{score,confidence:score>=80?"high":score>=50?"medium":"low"}}
function parsePrice(v){if(v==null)return null;if(typeof v==="number")return Number.isFinite(v)?v:null;const m=String(v).replace(/NT\$|TWD|NTD|新台幣|售價|特價|優惠價|價格/gi,"").replace(/[,，\s]/g,"").match(/(?:\$)?(\d{2,7})(?:\.\d+)?/);return m?Number(m[1]):null}
function isImplausiblePrice(price,category,query,title=""){
  if(!Number.isFinite(price)||price<=0||price<100)return true;
  const all=(query+" "+title).toLowerCase();
  if(/訂金|月租|資費|門號|0元|一元|1元|保護貼|手機殼|鏡頭貼|配件|空盒/.test(all) && price<5000)return true;
  const phone=/(iphone|galaxy|pixel|手機|redmi|xiaomi|小米|oppo|vivo|zenfone|rog\s?phone)/i.test(query);
  if(category==="手機平板"&&phone&&price<3000)return true;
  return false;
}
function capacityTokens(q){return [...new Set((String(q).match(/\b(?:128|256|512)\s?g(?:b)?\b|\b[124]\s?t(?:b)?\b/ig)||[]).map(x=>x.replace(/\s/g,"").toUpperCase()))]}
function capacityCompatible(title,q){const wanted=capacityTokens(q);if(!wanted.length)return true;const have=capacityTokens(title);if(!have.length)return true;return wanted.some(x=>have.includes(x))}
function htmlText(html){return String(html||"").replace(/<script[\s\S]*?<\/script>/gi," ").replace(/<style[\s\S]*?<\/style>/gi," ").replace(/<[^>]+>/g," ").replace(/&nbsp;/g," ").replace(/&amp;/g,"&").replace(/\s+/g," ")}
function collectPriceCandidates(text,q,category){
  const out=[]; const ts=tokens(q); const lower=text.toLowerCase();
  const rx=/(?:NT\$|NTD|TWD|\$|售價|特價|優惠價|價格)\s*[:：]?\s*([0-9]{2,3}(?:[,，][0-9]{3}){0,2}|[0-9]{3,7})/gi;
  for(const m of text.matchAll(rx)){
    const price=parsePrice(m[1]); if(price==null)continue;
    const start=Math.max(0,m.index-180),end=Math.min(text.length,m.index+220); const ctx=text.slice(start,end);
    const score=modelMatch(ctx,q).score;
    if(score<35||!capacityCompatible(ctx,q)||isImplausiblePrice(price,category,q,ctx))continue;
    out.push({price,title:ctx.trim().slice(0,220),score});
  }
  // JSON-LD / embedded JSON often stores price without currency symbol.
  const jsonRx=/"(?:price|salePrice|finalPrice|discountPrice)"\s*:\s*"?([0-9]{2,7}(?:\.[0-9]+)?)"?/gi;
  for(const m of text.matchAll(jsonRx)){
    const price=parsePrice(m[1]); if(price==null||isImplausiblePrice(price,category,q,""))continue;
    const ctx=text.slice(Math.max(0,m.index-250),Math.min(text.length,m.index+250));
    const score=modelMatch(ctx,q).score;
    if(score<35||!capacityCompatible(ctx,q))continue;
    out.push({price,title:htmlText(ctx).slice(0,220),score});
  }
  return out.sort((a,b)=>b.score-a.score||a.price-b.price);
}

async function fetchWithTimeout(url,ms=6500){
  const ctrl=new AbortController(); const timer=setTimeout(()=>ctrl.abort(),ms);
  try{return await fetch(url,{redirect:"follow",signal:ctrl.signal,headers:{"User-Agent":UA,"Accept-Language":"zh-TW,zh;q=0.9,en;q=0.7","Accept":"text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8"}})}finally{clearTimeout(timer)}
}

async function directOfficial(c,q,category){
  const url=c.search(q);
  try{
    const r=await fetchWithTimeout(url);
    const ct=r.headers.get("content-type")||"";
    if(!r.ok)return{ok:false,reason:`HTTP ${r.status}`,url};
    const raw=await r.text();
    if(raw.length<200)return{ok:false,reason:"empty_response",url};
    const body=ct.includes("json")?raw:`${htmlText(raw)} ${raw}`;
    const candidates=collectPriceCandidates(body,q,category);
    if(!candidates.length)return{ok:false,reason:"no_price_detected",url};
    const best=candidates[0];
    const mm=modelMatch(best.title,q);
    return{ok:true,url,title:best.title||q,listedPrice:best.price,confidence:mm.confidence,score:best.score,sourceMode:"official-direct",priceLabel:"官網直查價"};
  }catch(e){return{ok:false,reason:e.name==="AbortError"?"timeout":e.message,url}}
}

async function serperSearch(query){
  if(!SERPER_API_KEY)return null;
  const r=await fetch("https://google.serper.dev/search",{method:"POST",headers:{"X-API-KEY":SERPER_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({q:query,gl:"tw",hl:"zh-tw",num:20})});
  if(!r.ok)return null; return r.json();
}
function candidateFromSerper(data,q,category,domains=[]){
  const organic=Array.isArray(data?.organic)?data.organic:[]; const out=[];
  for(const x of organic){
    const link=String(x.link||""); if(domains.length&&!domains.some(d=>link.includes(d)))continue;
    const text=`${x.title||""} ${x.snippet||""}`; const mm=modelMatch(text,q);
    if(mm.score<40||!capacityCompatible(text,q))continue;
    const prices=collectPriceCandidates(text,q,category); if(!prices.length)continue;
    out.push({title:x.title||q,listedPrice:prices[0].price,url:link,score:mm.score,confidence:mm.confidence});
  }
  return out.sort((a,b)=>b.score-a.score||a.listedPrice-b.listedPrice)[0]||null;
}
async function googleBackup(c,q,category){
  if(!SERPER_API_KEY)return null;
  const domainQ=c.domains.map(d=>`site:${d}`).join(" OR ");
  const data=await serperSearch(`(${domainQ}) ${q}`);
  const hit=candidateFromSerper(data,q,category,c.domains);
  return hit?{...hit,sourceMode:"google-backup",priceLabel:"Google 備援價",url:c.search(q),sourceUrl:hit.url}:null;
}
async function comparisonBackup(c,q,category){
  for(const site of COMPARISON_SITES){
    // First try the comparison site itself.
    try{
      const compareQuery=`${q} ${c.name}`;
      const r=await fetchWithTimeout(site.search(compareQuery),5000);
      if(r.ok){const raw=await r.text();const cs=collectPriceCandidates(`${htmlText(raw)} ${raw}`,compareQuery,category);if(cs.length)return{...cs[0],url:site.search(compareQuery),sourceMode:"comparison",priceLabel:`${site.name} 補查價`,comparisonSite:site.name,confidence:modelMatch(cs[0].title,compareQuery).confidence}}
    }catch{}
    // If blocked, Google only searches this comparison site as the last fallback.
    if(SERPER_API_KEY){
      const compareQuery=`${q} ${c.name}`;
      const data=await serperSearch(`site:${site.domain} ${compareQuery}`); const hit=candidateFromSerper(data,compareQuery,category,[site.domain]);
      if(hit)return{...hit,url:site.search(compareQuery),sourceMode:"comparison",priceLabel:`${site.name} 補查價`,comparisonSite:site.name,sourceUrl:hit.url};
    }
  }
  return null;
}

async function resolveChannel(c,q,category){
  const direct=await directOfficial(c,q,category);
  if(direct.ok)return direct;
  const google=await googleBackup(c,q,category);
  if(google)return google;
  const comp=await comparisonBackup(c,q,category);
  if(comp)return comp;
  return{listedPrice:null,title:q,url:c.search(q),sourceMode:"unavailable",priceLabel:"尚未取得",confidence:"unknown",failure:direct.reason||"not_found"};
}

app.get("/api/health",(req,res)=>res.json({ok:true,version:VERSION,searchOrder:["official-direct","google-backup","comparison"],googleBackup:Boolean(SERPER_API_KEY)}));
app.get("/api/channels",(req,res)=>res.json(CHANNELS.map(({search,domains,...c})=>c)));
app.post("/api/search",async(req,res)=>{
  const {query="",channels=[],category=""}=req.body||{}; const q=String(query).trim();
  if(!q)return res.status(400).json({error:"query_required",message:"請輸入商品關鍵字"});
  const ids=channels.length?channels:CHANNELS.map(c=>c.id); const selected=ids.map(id=>channelById[id]).filter(Boolean);
  const started=Date.now();
  try{
    const raw=await Promise.all(selected.map(c=>resolveChannel(c,q,category).then(x=>({c,x}))));
    const results=raw.map(({c,x},i)=>({id:`${c.id}-${Date.now()}-${i}`,channel:c.name,channelId:c.id,...x}));
    return res.json({query:q,version:VERSION,found:results.filter(x=>x.listedPrice!=null).length,durationMs:Date.now()-started,results});
  }catch(e){console.error(e);return res.status(502).json({error:"search_failed",message:e.message});}
});

app.listen(PORT,"0.0.0.0",()=>console.log(`全通路比價中心 v${VERSION} running on port ${PORT}`));
