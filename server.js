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
  etag:false,
  maxAge:0,
  setHeaders:res=>res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, proxy-revalidate")
}));

const CHANNELS = [
  // 綜合大型電商
  { id:"shopee", name:"蝦皮購物", group:"大型電商", priority:1, categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品","寵物用品","家具寢具"], domains:["shopee.tw"], search:q=>`https://shopee.tw/search?keyword=${encodeURIComponent(q)}` },
  { id:"momo", name:"momo購物網", group:"大型電商", priority:2, categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品","寵物用品"], domains:["momoshop.com.tw"], search:q=>`https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}` },
  { id:"pchome", name:"PChome 24h", group:"大型電商", priority:3, categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品"], domains:["pchome.com.tw","24h.pchome.com.tw"], search:q=>`https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}` },
  { id:"yahoo", name:"Yahoo購物中心", group:"大型電商", priority:4, categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用"], domains:["tw.buy.yahoo.com"], search:q=>`https://tw.buy.yahoo.com/search/product?p=${encodeURIComponent(q)}` },
  { id:"ruten", name:"露天市集", group:"大型電商", priority:5, categories:["3C","手機平板","生活用品"], domains:["ruten.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:ruten.com.tw "+q)}` },

  // 手機品牌官方
  { id:"apple", name:"Apple 官方商店", group:"手機品牌官方", priority:1, categories:["手機平板","3C"], domains:["apple.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:apple.com/tw/shop "+q)}` },
  { id:"samsung", name:"Samsung 官方商城", group:"手機品牌官方", priority:2, categories:["手機平板","3C"], domains:["samsung.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:samsung.com/tw "+q)}` },
  { id:"xiaomi", name:"小米台灣官方", group:"手機品牌官方", priority:3, categories:["手機平板","3C","生活家電"], domains:["mi.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:mi.com/tw "+q)}` },

  // 三大電信
  { id:"cht", name:"中華電信網路門市", group:"三大電信", priority:1, categories:["手機平板"], domains:["cht.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:cht.com.tw "+q)}` },
  { id:"myfone", name:"台灣大哥大 myfone", group:"三大電信", priority:2, categories:["手機平板","3C"], domains:["myfone.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:myfone.com.tw "+q)}` },
  { id:"fet", name:"遠傳網路門市", group:"三大電信", priority:3, categories:["手機平板"], domains:["fetnet.net"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:fetnet.net "+q)}` },

  // 手機零售通路
  { id:"landtop", name:"地標網通", group:"手機零售", priority:1, categories:["手機平板"], domains:["landtop.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("地標網通 "+q)}` },
  { id:"senao", name:"神腦國際", group:"手機零售", priority:2, categories:["手機平板","3C"], domains:["senao.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:senao.com.tw "+q)}` },

  // 3C / 電腦通路
  { id:"tk3c", name:"燦坤3C", group:"3C賣場", priority:1, categories:["3C","手機平板","大家電","廚房家電","生活家電"], domains:["tk3c.com"], search:q=>`https://www.tk3c.com/search.aspx?q=${encodeURIComponent(q)}` },
  { id:"sunfar", name:"順發3C", group:"3C賣場", priority:2, categories:["3C","手機平板"], domains:["sunfar.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:sunfar.com.tw "+q)}` },
  { id:"nova", name:"NOVA資訊廣場", group:"3C賣場", priority:3, categories:["3C","手機平板"], domains:["nova.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:nova.com.tw "+q)}` },
  { id:"elifemall", name:"全國電子", group:"3C賣場", priority:4, categories:["3C","手機平板","大家電","廚房家電","生活家電"], domains:["elifemall.com.tw"], search:q=>`https://www.elifemall.com.tw/search?keyword=${encodeURIComponent(q)}` },
  { id:"sinya", name:"欣亞數位", group:"3C賣場", priority:5, categories:["3C"], domains:["sinya.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:sinya.com.tw "+q)}` },
  { id:"eclife", name:"EcLife良興", group:"3C賣場", priority:6, categories:["3C","生活家電"], domains:["ec-life.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:ec-life.com "+q)}` },
  { id:"coolpc", name:"原價屋", group:"3C賣場", priority:7, categories:["3C"], domains:["coolpc.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:coolpc.com.tw "+q)}` },
  { id:"autobuy", name:"AUTOBUY", group:"3C賣場", priority:8, categories:["3C"], domains:["autobuy.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:autobuy.tw "+q)}` },

  // 美妝 / 藥妝
  { id:"poya", name:"寶雅 POYA", group:"美妝藥妝", priority:1, categories:["美妝日用","生活用品","清潔用品"], domains:["poya.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:poya.com.tw "+q)}` },
  { id:"cosmed", name:"康是美 COSMED", group:"美妝藥妝", priority:2, categories:["美妝日用","生活用品"], domains:["cosmed.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:cosmed.com.tw "+q)}` },
  { id:"watsons", name:"屈臣氏 Watsons", group:"美妝藥妝", priority:3, categories:["美妝日用","生活用品"], domains:["watsons.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:watsons.com.tw "+q)}` },
  { id:"tomods", name:"Tomod's", group:"美妝藥妝", priority:4, categories:["美妝日用","生活用品"], domains:["tomods.com.tw"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("site:tomods.com.tw "+q)}` },
  { id:"matsumoto", name:"松本清", group:"美妝藥妝", priority:5, categories:["美妝日用","生活用品"], domains:["matsumotokiyoshi-tw.com"], search:q=>`https://www.google.com/search?q=${encodeURIComponent("松本清 台灣 "+q)}` },

  // 綜合量販
  { id:"costco", name:"Costco", group:"量販", priority:1, categories:["3C","手機平板","大家電","廚房家電","生活家電","生活用品","美妝日用","清潔用品"], domains:["costco.com.tw"], search:q=>`https://www.costco.com.tw/search?text=${encodeURIComponent(q)}` }
];

const channelById = Object.fromEntries(CHANNELS.map(c=>[c.id,c]));

function parsePrice(v){
  if(v == null) return null;
  if(typeof v === "number") return Number.isFinite(v) ? v : null;
  const s=String(v).replace(/NT\$|TWD|NTD|元/gi,"").replace(/[,\s]/g,"");
  const m=s.match(/(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function normalizeText(s){
  return String(s||"").toLowerCase().replace(/[\s_\-\/\\()[\]{}]+/g,"");
}

function tokenizeQuery(q){
  return String(q||"").split(/\s+/).map(x=>normalizeText(x)).filter(x=>x.length>=2);
}

function modelMatch(title,query){
  const t=normalizeText(title);
  const tokens=tokenizeQuery(query);
  if(!tokens.length) return {score:0,confidence:"low"};
  let hits=0;
  for(const token of tokens) if(t.includes(token)) hits++;
  const ratio=hits/tokens.length;
  const exact=t.includes(normalizeText(query));
  const score=exact?100:Math.round(ratio*90);
  const confidence=score>=80?"high":score>=50?"medium":"low";
  return {score,confidence};
}

function identifyChannel(item){
  const source=String(item.source||"").toLowerCase();
  const link=String(item.link||"").toLowerCase();
  for(const c of CHANNELS){
    if(source.includes(c.name.toLowerCase())) return c;
    if(c.domains.some(d=>link.includes(d)||source.includes(d))) return c;
  }
  return null;
}

async function serperShopping(query){
  const resp=await fetch("https://google.serper.dev/shopping",{
    method:"POST",
    headers:{"X-API-KEY":SERPER_API_KEY,"Content-Type":"application/json"},
    body:JSON.stringify({q:query,gl:"tw",hl:"zh-tw",num:100})
  });
  if(!resp.ok){
    const body=await resp.text().catch(()=>"");
    throw new Error(`Serper ${resp.status}: ${body.slice(0,160)}`);
  }
  return resp.json();
}

app.get("/api/health",(req,res)=>res.json({
  ok:true,
  version:"1.3.0",
  automaticPriceSearch:Boolean(SERPER_API_KEY)
}));

app.get("/api/channels",(req,res)=>res.json(
  CHANNELS.map(({search,domains,...c})=>c)
));

app.post("/api/search",async(req,res)=>{
  const {query="",channels=[]}=req.body||{};
  const cleanQuery=String(query).trim();
  if(!cleanQuery) return res.status(400).json({error:"query_required"});

  const selectedIds=channels.length?channels:CHANNELS.map(c=>c.id);
  const selected=selectedIds.map(id=>channelById[id]).filter(Boolean);

  if(!SERPER_API_KEY){
    return res.json({
      query:cleanQuery,version:"1.3.0",setupRequired:true,
      message:"尚未設定 SERPER_API_KEY。",
      results:selected.map((c,i)=>({
        id:`${c.id}-${Date.now()}-${i}`,channel:c.name,channelId:c.id,
        title:cleanQuery,listedPrice:null,url:c.search(cleanQuery),
        sourceMode:"manual",confidence:"unknown"
      }))
    });
  }

  try{
    const data=await serperShopping(cleanQuery);
    const shopping=Array.isArray(data.shopping)?data.shopping:[];
    const byChannel=new Map();

    for(const item of shopping){
      const c=identifyChannel(item);
      if(!c||!selectedIds.includes(c.id)) continue;

      const price=parsePrice(item.price);
      if(price==null||price<=0) continue;

      const match=modelMatch(item.title,cleanQuery);

      // 精準度太低的不直接拿來當最低價
      if(match.score<45) continue;

      const candidate={
        id:`${c.id}-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
        channel:c.name,channelId:c.id,title:item.title||cleanQuery,
        listedPrice:price,delivery:item.delivery||null,rating:item.rating||null,
        reviews:item.ratingCount||item.reviews||null,url:item.link||c.search(cleanQuery),
        source:item.source||c.name,score:match.score,confidence:match.confidence,
        sourceMode:"google-shopping",priceLabel:"搜尋參考價"
      };

      const old=byChannel.get(c.id);
      if(!old || candidate.score>old.score || (candidate.score===old.score && candidate.listedPrice<old.listedPrice)){
        byChannel.set(c.id,candidate);
      }
    }

    const results=selected.map((c,i)=>byChannel.get(c.id)||({
      id:`${c.id}-manual-${Date.now()}-${i}`,channel:c.name,channelId:c.id,
      title:cleanQuery,listedPrice:null,url:c.search(cleanQuery),
      sourceMode:"manual",confidence:"unknown",priceLabel:"尚未取得"
    }));

    res.json({
      query:cleanQuery,version:"1.3.0",setupRequired:false,automatic:true,
      found:results.filter(r=>r.listedPrice!=null).length,results
    });
  }catch(err){
    console.error(err);
    res.status(502).json({error:"price_search_failed",message:err.message});
  }
});

app.listen(PORT,"0.0.0.0",()=>console.log(`Price Compare TW v1.3.0 running on port ${PORT}`));
