const $ = id => document.getElementById(id);
let items = [];

function money(n){
  if(n===null || n===undefined || Number.isNaN(Number(n))) return "尚未輸入";
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
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function setStatus(msg,error=false){$("summary").textContent=msg;$("summary").style.color=error?"#ff8a8a":""}
function render(){
  items.forEach(i=>i.effectivePrice=calcEffective(i.listedPrice));
  const mode=$("sort").value;
  const sorted=[...items].sort((a,b)=>mode==="channel"?a.channel.localeCompare(b.channel,"zh-Hant"):mode==="listed"?(a.listedPrice??Infinity)-(b.listedPrice??Infinity):(a.effectivePrice??Infinity)-(b.effectivePrice??Infinity));
  const priced=sorted.filter(x=>x.effectivePrice!==null);
  const bestId=priced[0]?.id;
  setStatus(priced.length?`目前最低到手價：${money(priced[0].effectivePrice)}｜${priced[0].channel}`:"比價清單已建立。請開啟各通路查價，再填入標價。");
  $("results").className="results";
  $("results").innerHTML=sorted.map(i=>`<article class="item ${i.id===bestId?"best":""}"><div class="item-top"><div><h3>${escapeHtml(i.channel)}</h3><div class="small">${escapeHtml(i.title)}</div></div><label>通路標價<input class="priceInput" type="number" min="0" inputmode="numeric" placeholder="輸入查到的價格" data-id="${i.id}" value="${i.listedPrice??""}"></label><div><div class="small">估算到手價</div><div class="effective">${money(i.effectivePrice)}</div></div><a class="link" href="${i.url}" target="_blank" rel="noopener noreferrer">開啟通路搜尋</a></div></article>`).join("");
  document.querySelectorAll(".priceInput").forEach(inp=>inp.addEventListener("input",e=>{const item=items.find(x=>x.id===e.target.dataset.id);if(!item)return;item.listedPrice=e.target.value===""?null:Number(e.target.value);render()}));
}
async function getJSON(url,options){const r=await fetch(url,options);if(!r.ok)throw new Error(`${r.status} ${r.statusText}`);return r.json()}
window.addEventListener("DOMContentLoaded",async()=>{
  try{
    const y=new Date().getFullYear();
    $("year").innerHTML='<option value="">不限年份</option>'+Array.from({length:12},(_,i)=>`<option>${y-i}</option>`).join("");
    setStatus("正在載入通路...");
    const channels=await getJSON("/api/channels");
    $("channelBox").innerHTML=channels.map(c=>`<label class="check"><input type="checkbox" value="${c.id}" checked>${escapeHtml(c.name)}</label>`).join("");
    setStatus("輸入品牌或型號後，按「開始比價」。");

    $("searchBtn").addEventListener("click",async()=>{
      const q=[$("brand").value,$("model").value,$("year").value].map(x=>String(x||"").trim()).filter(Boolean).join(" ");
      if(!q){setStatus("請至少輸入品牌、型號或關鍵字其中一項。",true);return}
      const selected=[...document.querySelectorAll("#channelBox input:checked")].map(x=>x.value);
      if(!selected.length){setStatus("請至少勾選一個比價通路。",true);return}
      const btn=$("searchBtn"),old=btn.textContent;btn.disabled=true;btn.textContent="搜尋中...";setStatus("正在建立比價清單...");
      try{
        const data=await getJSON("/api/search",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({query:q,channels:selected,category:$("category").value})});
        items=(data.results||[]).map(x=>({...x,effectivePrice:null}));
        render();
        setTimeout(()=>document.querySelector(".result-head")?.scrollIntoView({behavior:"smooth",block:"start"}),100);
      }catch(e){
        items=[];$("results").className="results empty";$("results").textContent="搜尋失敗，請稍後再試。";setStatus("搜尋失敗："+e.message,true);
      }finally{btn.disabled=false;btn.textContent=old}
    });

    ["coupon","discountPct","cardPct","points","platformCredit","installFee","shipping","tradeIn","region","floor"].forEach(id=>$(id).addEventListener("input",render));
    $("sort").addEventListener("change",render);
  }catch(e){setStatus("系統初始化失敗："+e.message,true)}
});