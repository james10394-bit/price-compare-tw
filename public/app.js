
const $ = id => document.getElementById(id);
let items = [];

function money(n){
  if (n === null || n === undefined || Number.isNaN(Number(n))) return "尚未輸入";
  return "NT$ " + Math.max(0, Math.round(Number(n))).toLocaleString("zh-TW");
}

function number(id){ return Number($(id).value || 0); }

function calcEffective(listed){
  if (listed === null || listed === undefined || listed === "") return null;
  const base = Number(listed);
  const discount = base * number("discountPct") / 100;
  const afterDiscount = Math.max(0, base - discount);
  const card = afterDiscount * number("cardPct") / 100;
  const region = number("region");
  const floor = number("floor");

  return Math.max(0,
    afterDiscount
    - number("coupon")
    - number("points")
    - number("platformCredit")
    - number("tradeIn")
    - card
    + number("shipping")
    + region
    + floor
    + number("installFee")
  );
}

function rerender(){
  items.forEach(i => i.effectivePrice = calcEffective(i.listedPrice));
  const mode = $("sort").value;
  const sorted = [...items].sort((a,b)=>{
    if(mode==="channel") return a.channel.localeCompare(b.channel,"zh-Hant");
    if(mode==="listed") return (a.listedPrice ?? Infinity) - (b.listedPrice ?? Infinity);
    return (a.effectivePrice ?? Infinity) - (b.effectivePrice ?? Infinity);
  });

  const priced = sorted.filter(x=>x.effectivePrice!==null);
  const bestId = priced[0]?.id;
  $("summary").textContent = priced.length
    ? `目前最低到手價：${money(priced[0].effectivePrice)}｜${priced[0].channel}`
    : "請把各通路看到的售價填入，系統會自動算真正到手價。";

  if(!sorted.length){
    $("results").className = "results empty";
    $("results").textContent = "目前沒有結果。";
    return;
  }
  $("results").className = "results";
  $("results").innerHTML = sorted.map(i=>`
    <article class="item ${i.id===bestId?'best':''}">
      <div class="item-top">
        <div>
          <h3>${i.channel}</h3>
          <div class="small">${escapeHtml(i.title)}</div>
        </div>
        <label>通路標價
          <input class="priceInput" type="number" min="0" placeholder="輸入查到的價格"
            data-id="${i.id}" value="${i.listedPrice ?? ''}">
        </label>
        <div>
          <div class="small">估算到手價</div>
          <div class="effective">${money(i.effectivePrice)}</div>
        </div>
        <a class="link" href="${i.url}" target="_blank" rel="noopener">開啟通路搜尋</a>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".priceInput").forEach(inp=>{
    inp.addEventListener("input", e=>{
      const item = items.find(x=>x.id===e.target.dataset.id);
      item.listedPrice = e.target.value === "" ? null : Number(e.target.value);
      rerender();
    });
  });
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]));
}

async function init(){
  const y = new Date().getFullYear();
  $("year").innerHTML = `<option value="">不限年份</option>` +
    Array.from({length:12},(_,i)=>`<option>${y-i}</option>`).join("");

  const channels = await fetch("/api/channels").then(r=>r.json());
  $("channelBox").innerHTML = channels.map(c=>`
    <label class="check"><input type="checkbox" value="${c.id}" checked>${c.name}</label>
  `).join("");

  $("searchBtn").addEventListener("click", async ()=>{
    const q = [$("brand").value, $("model").value, $("year").value].filter(Boolean).join(" ").trim();
    if(!q){
      alert("至少輸入品牌、型號或關鍵字其中一項。");
      return;
    }
    const selected = [...document.querySelectorAll("#channelBox input:checked")].map(x=>x.value);
    const data = await fetch("/api/search",{
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({query:q, channels:selected, category:$("category").value})
    }).then(r=>r.json());
    items = data.results.map(x=>({...x,effectivePrice:null}));
    rerender();
  });

  ["coupon","discountPct","cardPct","points","platformCredit","installFee","shipping","tradeIn","region","floor"]
    .forEach(id=>$(id).addEventListener("input",rerender));
  $("sort").addEventListener("change",rerender);
}
init();
