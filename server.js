import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public"), {
  etag: false,
  maxAge: 0,
  setHeaders: res => res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
}));

const CHANNELS = [
  { id: "pchome", name: "PChome 24h", search: q => `https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}` },
  { id: "momo", name: "momo購物網", search: q => `https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}` },
  { id: "yahoo", name: "Yahoo購物中心", search: q => `https://tw.buy.yahoo.com/search/product?p=${encodeURIComponent(q)}` },
  { id: "shopee", name: "蝦皮購物", search: q => `https://shopee.tw/search?keyword=${encodeURIComponent(q)}` },
  { id: "tk3c", name: "燦坤3C", search: q => `https://www.tk3c.com/search.aspx?q=${encodeURIComponent(q)}` },
  { id: "elifemall", name: "全國電子", search: q => `https://www.elifemall.com.tw/search?keyword=${encodeURIComponent(q)}` },
  { id: "costco", name: "Costco", search: q => `https://www.costco.com.tw/search?text=${encodeURIComponent(q)}` },

  // 新增 3C 賣場 / 電腦通路
  { id: "sunfar", name: "順發3C", search: q => `https://www.google.com/search?q=${encodeURIComponent("site:sunfar.com.tw " + q)}` },
  { id: "nova", name: "NOVA資訊廣場", search: q => `https://www.google.com/search?q=${encodeURIComponent("site:nova.com.tw " + q)}` },
  { id: "sinya", name: "欣亞數位", search: q => `https://www.google.com/search?q=${encodeURIComponent("site:sinya.com.tw " + q)}` },
  { id: "ecLife", name: "EcLife良興", search: q => `https://www.google.com/search?q=${encodeURIComponent("site:ec-life.com " + q)}` },
  { id: "coolpc", name: "原價屋", search: q => `https://www.google.com/search?q=${encodeURIComponent("site:coolpc.com.tw " + q)}` },
  { id: "autobuy", name: "AUTOBUY欣亞/電腦通路", search: q => `https://www.google.com/search?q=${encodeURIComponent("site:autobuy.tw " + q)}` },
  { id: "sanwell", name: "三井3C", search: q => `https://www.google.com/search?q=${encodeURIComponent("三井3C " + q)}` },
  { id: "nipponbashi", name: "日本橋資訊廣場", search: q => `https://www.google.com/search?q=${encodeURIComponent("日本橋資訊廣場 " + q)}` }
];

app.get("/api/health", (req,res)=>res.json({ok:true, version:"1.0.4"}));
app.get("/api/channels", (req,res)=>res.json(CHANNELS.map(({search,...c})=>c)));

app.post("/api/search", (req,res)=>{
  const {query="", channels=[]} = req.body || {};
  const cleanQuery = String(query).trim();
  if(!cleanQuery) return res.status(400).json({error:"query_required"});

  const selected = CHANNELS.filter(c => !channels.length || channels.includes(c.id));
  const results = selected.map((c,i)=>({
    id:`${c.id}-${Date.now()}-${i}`,
    channel:c.name,
    channelId:c.id,
    title:cleanQuery,
    listedPrice:null,
    url:c.search(cleanQuery),
    mode:"search-link"
  }));
  res.json({query:cleanQuery, results, version:"1.0.4"});
});

app.listen(PORT, "0.0.0.0", ()=>{
  console.log(`Price Compare TW v1.0.4 running on port ${PORT}`);
});
