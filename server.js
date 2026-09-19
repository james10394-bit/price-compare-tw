import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;
const SERPER_API_KEY = process.env.SERPER_API_KEY || "";

app.use(express.json({limit:"1mb"}));
app.use(express.static(path.join(__dirname, "public"), {
  etag: false,
  maxAge: 0,
  setHeaders: res => res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
}));

const CHANNELS = [
  { id:"pchome", name:"PChome 24h", categories:["3C","大家電","廚房家電","生活家電","手機平板","生活用品"], domains:["pchome.com.tw","24h.pchome.com.tw"], search:q=>`https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}` },
  { id:"momo", name:"momo購物網", categories:["3C","大家電","廚房家電","生活家電","手機平板","生活用品","美妝日用","清潔用品","寵物用品"], domains:["momoshop.com.tw"], search:q=>`https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}` },
  { id:"yahoo", name:"Yahoo購物中心", categories:["3C","大家電","廚房家電","生活家電","手機平板","生活用品","美妝日用"], domains:["tw.buy.yahoo.com"], search:q=>`https://tw.buy.yahoo.com/search/product?p=${encodeURIComponent(q)}` },
  { id:"shopee", name:"蝦皮購物", categories:["3C","大家電","廚房家電","生活家電","手機平板","生活用品","美妝日用","清潔用品","寵物用品","家具寢具"], domains:["shopee.tw"], search:q=>`https://shopee.tw/search?keyword=${encodeURIComponent(q)}` },
  { id:"tk3c", name:"燦坤3C", categories:["3C","大家電","廚房家電","生活家電","手機平板"], domains:["tk3c.com"], search:q=>`https://www.tk3c.com/search.aspx?q=${encodeURIComponent(q)}` },
  { id:"elifemall", name:"全國電子", categories:["3C","大家電","廚房家電","生活家電","手機平板"], domains:["elifemall.com.tw"], search:q=>`https://www.elifemall.com.tw/search?keyword=${encodeURIComponent(q)}` },
  { id:"costco", name:"Costco", categories:["3C","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品"], domains:["costco.com.tw"], search:q=>`https://www.costco.com.tw/search?text=${encodeURIComponent(q)}` },

  // 3C / 電腦通路
  { id:"sunfar", name:"順發3C", categories:["3C","手機平板"], domains:["sunfar.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:sunfar.com.tw "+q)}` },
  { id:"nova", name:"NOVA資訊廣場", categories:["3C","手機平板"], domains:["nova.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:nova.com.tw "+q)}` },
  { id:"sinya", name:"欣亞數位", categories:["3C"], domains:["sinya.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:sinya.com.tw "+q)}` },
  { id:"eclife", name:"EcLife良興", categories:["3C","生活家電"], domains:["ec-life.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:ec-life.com "+q)}` },
  { id:"coolpc", name:"原價屋", categories:["3C"], domains:["coolpc.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:coolpc.com.tw "+q)}` },
  { id:"autobuy", name:"AUTOBUY", categories:["3C"], domains:["autobuy.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:autobuy.tw "+q)}` },
  { id:"sanwell", name:"三井3C", categories:["3C","手機平板"], domains:[], search:q=>`https://www.google.com/search?q=${encodeURIComponent("三井3C "+q)}` },
  { id:"nipponbashi", name:"日本橋資訊廣場", categories:["3C"], domains:[], search:q=>`https://www.google.com/search?q=${encodeURIComponent("日本橋資訊廣場 "+q)}` },

  // 美妝 / 藥妝 / 日用品通路
  { id:"poya", name:"寶雅 POYA", categories:["美妝日用","生活用品","清潔用品"], domains:["poya.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:poya.com.tw "+q)}` },
  { id:"cosmed", name:"康是美 COSMED", categories:["美妝日用","生活用品"], domains:["cosmed.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:cosmed.com.tw "+q)}` },
  { id:"watsons", name:"屈臣氏 Watsons", categories:["美妝日用","生活用品"], domains:["watsons.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:watsons.com.tw "+q)}` },
  { id:"tomods", name:"Tomod's", categories:["美妝日用","生活用品"], domains:["tomods.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:tomods.com.tw "+q)}` },
  { id:"matsumoto", name:"松本清", categories:["美妝日用","生活用品"], domains:["matsumotokiyoshi-tw.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("松本清 台灣 "+q)}` },
  { id:"sasa", name:"莎莎 SaSa", categories:["美妝日用"], domains:["sasa.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("莎莎 SaSa 台灣 "+q)}` }
];

const channelById = Object.fromEntries(CHANNELS.map(c=>[c.id,c]));

function parsePrice(v){
  if(v == null) return null;
  if(typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(/NT\$|TWD|NTD|元/gi,"").replace(/[,\s]/g,"");
  const m = s.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function normalizeText(s){
  return String(s||"").toLowerCase().replace(/[\s_\-\/\\()[\]{}]+/g,"");
}

function modelScore(title, query){
  const t=normalizeText(title), q=normalizeText(query);
  if(!q) return 0;
  if(t.includes(q)) return 100;
  const parts=String(query).split(/\s+/).filter(x=>x.length>=3);
  let score=0;
  for(const p of parts) if(t.includes(normalizeText(p))) score+=20;
  return score;
}

function identifyChannel(item){
  const source = String(item.source||"").toLowerCase();
  const link = String(item.link||"").toLowerCase();
  for(const c of CHANNELS){
    if(source.includes(c.name.toLowerCase())) return c;
    if(c.domains.some(d=>link.includes(d) || source.includes(d))) return c;
  }
  return null;
}

async function serperShopping(query){
  const resp = await fetch("https://google.serper.dev/shopping",{
    method:"POST",
    headers:{
      "X-API-KEY":SERPER_API_KEY,
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      q:query,
      gl:"tw",
      hl:"zh-tw",
      num:100
    })
  });
  if(!resp.ok){
    const body = await resp.text().catch(()=>"");
    throw new Error(`Serper ${resp.status}: ${body.slice(0,160)}`);
  }
  return resp.json();
}

app.get("/api/health",(req,res)=>res.json({
  ok:true,
  version:"1.2.0",
  automaticPriceSearch:Boolean(SERPER_API_KEY)
}));

app.get("/api/channels",(req,res)=>res.json(
  CHANNELS.map(({search,domains,...c})=>c)
));

app.post("/api/search", async (req,res)=>{
  const {query="", channels=[]} = req.body || {};
  const cleanQuery=String(query).trim();
  if(!cleanQuery) return res.status(400).json({error:"query_required"});

  const selectedIds = channels.length ? channels : CHANNELS.map(c=>c.id);
  const selected = selectedIds.map(id=>channelById[id]).filter(Boolean);

  if(!SERPER_API_KEY){
    return res.json({
      query:cleanQuery,
      version:"1.2.0",
      setupRequired:true,
      message:"尚未設定 SERPER_API_KEY，因此只能建立通路搜尋連結。",
      results:selected.map((c,i)=>({
        id:`${c.id}-${Date.now()}-${i}`,
        channel:c.name,
        channelId:c.id,
        title:cleanQuery,
        listedPrice:null,
        url:c.search(cleanQuery),
        sourceMode:"manual"
      }))
    });
  }

  try{
    const data = await serperShopping(cleanQuery);
    const shopping = Array.isArray(data.shopping) ? data.shopping : [];
    const byChannel = new Map();

    for(const item of shopping){
      const c = identifyChannel(item);
      if(!c || !selectedIds.includes(c.id)) continue;

      const price = parsePrice(item.price);
      if(price == null || price <= 0) continue;

      const candidate = {
        id:`${c.id}-${byChannel.size}-${Date.now()}`,
        channel:c.name,
        channelId:c.id,
        title:item.title || cleanQuery,
        listedPrice:price,
        delivery:item.delivery || null,
        rating:item.rating || null,
        reviews:item.ratingCount || item.reviews || null,
        url:item.link || c.search(cleanQuery),
        source:item.source || c.name,
        score:modelScore(item.title,cleanQuery),
        sourceMode:"automatic"
      };

      const old = byChannel.get(c.id);
      if(!old || candidate.score > old.score || (candidate.score===old.score && candidate.listedPrice < old.listedPrice)){
        byChannel.set(c.id,candidate);
      }
    }

    const results = selected.map((c,i)=>{
      const hit = byChannel.get(c.id);
      if(hit) return hit;
      return {
        id:`${c.id}-manual-${Date.now()}-${i}`,
        channel:c.name,
        channelId:c.id,
        title:cleanQuery,
        listedPrice:null,
        url:c.search(cleanQuery),
        sourceMode:"manual",
        note:"Google Shopping 此次沒有找到此通路的可辨識價格。"
      };
    });

    res.json({
      query:cleanQuery,
      version:"1.2.0",
      setupRequired:false,
      automatic:true,
      found:results.filter(r=>r.listedPrice!=null).length,
      results
    });
  }catch(err){
    console.error(err);
    res.status(502).json({error:"price_search_failed",message:err.message});
  }
});

app.listen(PORT,"0.0.0.0",()=>console.log(`Price Compare TW v1.2.0 running on port ${PORT}`));
