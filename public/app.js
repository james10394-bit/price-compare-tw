const $ = id => document.getElementById(id);
let items = [];
let channelMeta = [];

function money(n){
  if(n===null || n===undefined || Number.isNaN(Number(n))) return "尚未找到";
  return "NT$ " + Math.max(0,Math.round(Number(n))).toLocaleString("zh-TW");
}
function num(id){return Number($(id).value||0)}
function calcEffective(listed){
  if(listed===null || listed===undefined || listed==="") return null;
  const base=Number(listed);
  const afterDiscount=Math.max(0,base-base*num("discountPct")/100);
  const card=afterDiscount*num("cardPct")/100;
  return Math.max(0,afterDiscount-num("coupon")-num("points")-num("platformCredit")-num("tradeIn")-card+num("shipping")+num("region")+num("floor")+num("installFee"));
}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function setStatus(msg,error=false){$("summary").textContent=msg;$("summary").style.color=error?"#ff8a8a":""}

function renderChannels(){
  $("channelBox").innerHTML = channelMeta.map(c=>`
    <label class="check" data-channel="${c.id}">
      <input type="checkbox" value="${c.id}">${escapeHtml(c.name)}
    </label>`).join("");
}

function autoSelectChannels(){
  const category = $("category").value;
  const checks = [...document.querySelectorAll("#channelBox input[type=checkbox]")];

  let selectedCount = 0;
  for(const cb of checks){
    const meta = channelMeta.find(c=>c.id===cb.value);
    const match = Array.isArray(meta?.categories) && meta.categories.includes(category);
    cb.checked = match;
    cb.closest(".check")?.classList.toggle("selected-by-category", match);
    if(match) selectedCount++;
  }

  if(selectedCount===0){
    checks.forEach(cb=>cb.checked=true);
    setStatus(`「${category}」目前沒有專屬通路分類，已先全選。`);
  }else{
    setStatus(`已依「${category}」自動勾選 ${selectedCount} 個相關通路。`);
  }
}

function render(extraMessage=""){
  items.forEach(i=>i.effectivePrice=calcEffective(i.listedPrice));
  const mode=$("sort").value;
  const sorted=[...items].sort((a,b)=>{
    if(mode==="channel") return a.channel.localeCompare(b.channel,"zh-Hant");
    if(mode==="listed") return (a.listedPrice??Infinity)-(b.listedPrice??Infinity);
    return (a.effectivePrice??Infinity)-(b.effectivePrice??Infinity);
  });
  const priced=sorted.filter(x=>x.effectivePrice!==null);
  const bestId=priced[0]?.id;

  if(extraMessage) setStatus(extraMessage);
  else setStatus(priced.length
    ? `已找到 ${priced.length} 個通路價格｜目前最低到手價：${money(priced[0].effectivePrice)}｜${priced[0].channel}`
    : "目前沒有抓到可辨識價格，可開啟通路搜尋。");

  $("results").className="results";
  $("results").innerHTML=sorted.map(i=>`
    <article class="item ${i.id===bestId?"best":""}">
      <div class="item-top">
        <div>
          <h3>${escapeHtml(i.channel)}</h3>
          <div class="small">${escapeHtml(i.title)}</div>
          <div class="small">${i.sourceMode==="automatic"?"✅ 自動取得價格":"⚠️ 尚未自動取得"}</div>
        </div>
        <label>通路標價
          <input class="priceInput" type="number" min="0" inputmode="numeric"
            placeholder="找不到時可手動輸入" data-id="${i.id}" value="${i.listedPrice??""}">
        </label>
        <div>
          <div class="small">估算到手價</div>
          <div class="effective">${money(i.effectivePrice)}</div>
        </div>
        <a class="link" href="${i.url}" target="_blank" rel="noopener noreferrer">查看商品</a>
      </div>
    </article>`).join("");

  document.querySelectorAll(".priceInput").forEach(inp=>inp.addEventListener("input",e=>{
    const item=items.find(x=>x.id===e.target.dataset.id);
    if(!item)return;
    item.listedPrice=e.target.value===""?null:Number(e.target.value);
    render();
  }));
}

async function getJSON(url,options){
  const r=await fetch(url,options);
  const data=await r.json().catch(()=>({}));
  if(!r.ok) throw new Error(data.message||`${r.status} ${r.statusText}`);
  return data;
}

window.addEventListener("DOMContentLoaded",async()=>{
  try{
    const y=new Date().getFullYear();
    $("year").innerHTML='<option value="">不限年份</option>'+Array.from({length:12},(_,i)=>`<option>${y-i}</option>`).join("");

    setStatus("正在載入通路...");
    channelMeta=await getJSON("/api/channels");
    renderChannels();

    // 預設依目前分類自動勾選
    autoSelectChannels();

    // 分類一變更，立即重新勾選適合的通路
    $("category").addEventListener("change",()=>{
      autoSelectChannels();
    });

    $("searchBtn").addEventListener("click",async()=>{
      const q=[$("brand").value,$("model").value,$("year").value]
        .map(x=>String(x||"").trim()).filter(Boolean).join(" ");

      if(!q){
        setStatus("請至少輸入品牌、型號或關鍵字。",true);
        return;
      }

      const selected=[...document.querySelectorAll("#channelBox input:checked")].map(x=>x.value);
      if(!selected.length){
        setStatus("請至少勾選一個通路。",true);
        return;
      }

      const btn=$("searchBtn"),old=btn.textContent;
      btn.disabled=true;
      btn.textContent="正在搜尋全網價格...";
      setStatus("正在搜尋所選通路價格，請稍候...");

      try{
        const data=await getJSON("/api/search",{
          method:"POST",
          headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            query:q,
            channels:selected,
            category:$("category").value
          })
        });

        items=(data.results||[]).map(x=>({...x,effectivePrice:null}));

        if(data.setupRequired){
          render("⚠️ 尚未設定價格搜尋金鑰 SERPER_API_KEY，目前只能建立通路搜尋連結。");
        }else{
          render(`自動搜尋完成：找到 ${data.found||0} 個通路價格。`);
        }

        setTimeout(()=>document.querySelector(".result-head")?.scrollIntoView({behavior:"smooth",block:"start"}),100);
      }catch(e){
        items=[];
        $("results").className="results empty";
        $("results").textContent="價格搜尋失敗。";
        setStatus("價格搜尋失敗："+e.message,true);
      }finally{
        btn.disabled=false;
        btn.textContent=old;
      }
    });

    ["coupon","discountPct","cardPct","points","platformCredit","installFee","shipping","tradeIn","region","floor"]
      .forEach(id=>$(id).addEventListener("input",()=>render()));
    $("sort").addEventListener("change",()=>render());

  }catch(e){
    setStatus("系統初始化失敗："+e.message,true);
  }
});