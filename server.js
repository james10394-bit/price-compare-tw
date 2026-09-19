
import express from "express";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const CHANNELS = [
  { id: "pchome", name: "PChome 24h", search: q => `https://24h.pchome.com.tw/search/?q=${encodeURIComponent(q)}` },
  { id: "momo", name: "momo購物網", search: q => `https://www.momoshop.com.tw/search/searchShop.jsp?keyword=${encodeURIComponent(q)}` },
  { id: "yahoo", name: "Yahoo購物中心", search: q => `https://tw.buy.yahoo.com/search/product?p=${encodeURIComponent(q)}` },
  { id: "shopee", name: "蝦皮購物", search: q => `https://shopee.tw/search?keyword=${encodeURIComponent(q)}` },
  { id: "tk3c", name: "燦坤", search: q => `https://www.tk3c.com/search.aspx?q=${encodeURIComponent(q)}` },
  { id: "elifemall", name: "全國電子", search: q => `https://www.elifemall.com.tw/search?keyword=${encodeURIComponent(q)}` },
  { id: "costco", name: "Costco", search: q => `https://www.costco.com.tw/search?text=${encodeURIComponent(q)}` }
];

app.get("/api/channels", (req, res) => res.json(CHANNELS.map(({search, ...c}) => c)));

app.post("/api/search", async (req, res) => {
  const { query = "", channels = [] } = req.body || {};
  const selected = CHANNELS.filter(c => !channels.length || channels.includes(c.id));

  // v1.0.0 採「搜尋入口 + 到手價引擎」模式。
  // 若要自動抓即時價格，可在此接官方 API、Google Shopping/SerpAPI/Serper 等合法資料來源。
  const results = selected.map((c, i) => ({
    id: `${c.id}-${Date.now()}-${i}`,
    channel: c.name,
    channelId: c.id,
    title: query || "未輸入商品",
    listedPrice: null,
    url: c.search(query),
    mode: "search-link",
    note: "點擊開啟該通路搜尋；可手動輸入標價後由系統計算到手價。"
  }));
  res.json({ query, results });
});

app.listen(PORT, () => {
  console.log(`Price Compare TW v1.0.0 running at http://localhost:${PORT}`);
});
