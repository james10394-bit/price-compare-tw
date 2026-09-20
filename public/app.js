const $=id=>document.getElementById(id);
let items=[];
let channelMeta=[];

function money(n){
  if(n===null||n===undefined||Number.isNaN(Number(n))) return "尚未找到";
  return "NT$ "+Math.max(0,Math.round(Number(n))).toLocaleString("zh-TW");
}
function num(id){return Number($(id).value||0)}
function calcEffective(listed){
  if(listed===null||listed===undefined||listed==="") return null;
  const base=Number(listed);
  const afterDiscount=Math.max(0,base-base*num("discountPct")/100);
  const card=afterDiscount*num("cardPct")/100;
  return Math.max(0,afterDiscount-num("coupon")-num("points")-num("platformCredit")-num("tradeIn")-card+num("shipping")+num("region")+num("floor")+num("installFee"));
}
function escapeHtml(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}
function setStatus(msg,error=false){$("summary").textContent=msg;$("summary").style.color=error?"#ff8a8a":""}

function selectedIds(){
  return [...document.querySelectorAll("#channelBox input[type=checkbox]:checked")].map(x=>x.value);
}
function updatePickerText(){
  const ids=selectedIds();
  const names=ids.map(id=>channelMeta.find(c=>c.id===id)?.name).filter(Boolean);
  $("channelPickerText").textContent=ids.length===0?"尚未選擇通路":ids.length<=3?names.join("、"):`已選 ${ids.length} 個通路`;
}
function renderChannels(){
  const groups={};
  for(const c of channelMeta){
    (groups[c.group]??=[]).push(c);
  }
  $("channelBox").innerHTML=Object.entries(groups).map(([group,list])=>`
    <div class="channel-group">
      <div class="channel-group-title">${escapeHtml(group)}</div>
      <div class="channel-group-list">
        ${list.sort((a,b)=>(a.priority||99)-(b.priority||99)).map(c=>`
          <label class="channel-option">
            <input type="checkbox" value="${c.id}">
            <span>${escapeHtml(c.name)}</span>
          </label>`).join("")}
      </div>
    </div>`).join("");

  document.querySelectorAll("#channelBox input").forEach(cb=>cb.addEventListener("change",updatePickerText));
}

function autoSelectChannels(){
  const category=$("category").value;
  const checks=[...document.querySelectorAll("#channelBox input[type=checkbox]")];
  let count=0;
  for(const cb of checks){
    const meta=channelMeta.find(c=>c.id===cb.value);
    const match=Array.isArray(meta?.categories)&&meta.categories.includes(category);
    cb.checked=match;
    if(match) count++;
  }
  updatePickerText();
  setStatus(`已依「${category}」自動勾選 ${count} 個相關通路。`);
}


let smartState={productType:"",canonicalBrand:"",dynamicType:""};

async function analyzeInputs(){
  const brand=$("brand").value.trim();
  const model=$("model").value.trim();
  const category=$("category").value;

  try{
    const data=await getJSON("/api/analyze",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({brand,model,category})
    });

    smartState={
      productType:data.productType||"",
      canonicalBrand:data.canonicalBrand||"",
      dynamicType:data.dynamic?.type||""
    };

    $("brandAnalysis").textContent=data.canonicalBrand
      ? `辨識品牌：${data.canonicalBrand}`
      : "";

    const wrap=$("dynamicParamWrap");
    const select=$("dynamicParam");

    if(data.dynamic?.options?.length){
      $("dynamicParamLabel").textContent=data.dynamic.label||"智慧條件";
      select.innerHTML=data.dynamic.options.map(x=>`<option value="${x}">${x==="不限"?"不限":x}</option>`).join("");
      wrap.style.display="";
    }else{
      wrap.style.display="none";
      select.innerHTML="";
    }
  }catch{
    // 分析失敗不影響基本搜尋
  }
}

let analyzeTimer=null;
function scheduleAnalyze(){
  clearTimeout(analyzeTimer);
  analyzeTimer=setTimeout(analyzeInputs,250);
}

function confidenceText(c){
  if(c==="high") return "🟢 型號高度符合";
  if(c==="medium") return "🟡 可能同系列，建議確認規格";
  if(c==="low") return "🔴 規格符合度偏低";
  return "⚪ 尚未判定";
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
    ?`找到 ${priced.length} 個參考價格｜最低參考到手價：${money(priced[0].effectivePrice)}｜${priced[0].channel}`
    :"目前沒有抓到可辨識價格，可直接開啟通路確認。");

  $("results").className="results";
  $("results").innerHTML=sorted.map(i=>`
    <article class="item ${i.id===bestId?"best":""}">
      <div class="item-top">
        <div>
          <h3>${escapeHtml(i.channel)}</h3>
          <div class="small">${escapeHtml(i.title)}</div>
          <div class="small">${i.sourceMode==="google-shopping"?"Google Shopping 搜尋參考價":"通路搜尋連結"}</div>
          <div class="small">${confidenceText(i.confidence)}</div>
        </div>
        <label>${escapeHtml(i.priceLabel||"通路標價")}
          <input class="priceInput" type="number" min="0" inputmode="numeric"
            placeholder="可手動修正實際售價" data-id="${i.id}" value="${i.listedPrice??""}">
        </label>
        <div>
          <div class="small">估算到手價</div>
          <div class="effective">${money(i.effectivePrice)}</div>
        </div>
        <a class="link" href="${i.url}" target="_blank" rel="noopener noreferrer">前往確認售價</a>
      </div>
    </article>`).join("");

  document.querySelectorAll(".priceInput").forEach(inp=>inp.addEventListener("input",e=>{
    const item=items.find(x=>x.id===e.target.dataset.id);
    if(!item)return;
    item.listedPrice=e.target.value===""?null:Number(e.target.value);
    item.priceLabel="手動確認價";
    item.confidence="high";
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

    channelMeta=await getJSON("/api/channels");
    renderChannels();
    autoSelectChannels();

    $("channelPickerBtn").addEventListener("click",()=>{
      $("channelPickerPanel").classList.toggle("open");
    });
    document.addEventListener("click",e=>{
      if(!e.target.closest(".channel-picker")) $("channelPickerPanel").classList.remove("open");
    });
    $("recommendedBtn").addEventListener("click",autoSelectChannels);
    $("selectAllBtn").addEventListener("click",()=>{
      document.querySelectorAll("#channelBox input").forEach(x=>x.checked=true);
      updatePickerText();
    });
    $("clearAllBtn").addEventListener("click",()=>{
      document.querySelectorAll("#channelBox input").forEach(x=>x.checked=false);
      updatePickerText();
    });

    $("category").addEventListener("change",()=>{
      autoSelectChannels();
      scheduleAnalyze();
    });
    $("brand").addEventListener("input",scheduleAnalyze);
    $("model").addEventListener("input",scheduleAnalyze);
    analyzeInputs();

    $("searchBtn").addEventListener("click",async()=>{
      const q=[$("brand").value,$("model").value,$("year").value]
        .map(x=>String(x||"").trim()).filter(Boolean).join(" ");
      if(!q){setStatus("請至少輸入品牌、型號或關鍵字。",true);return}

      const selected=selectedIds();
      if(!selected.length){setStatus("請至少勾選一個通路。",true);return}

      const btn=$("searchBtn"),old=btn.textContent;
      btn.disabled=true;btn.textContent="正在搜尋全網價格...";
      setStatus("正在搜尋所選通路，並比對型號規格...");

      try{
        const data=await getJSON("/api/search",{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({
            query:q,
            brand:$("brand").value,
            model:$("model").value,
            year:$("year").value,
            channels:selected,
            category:$("category").value,
            roomSize:smartState.dynamicType==="roomSize"?$("dynamicParam").value:"",
            storage:smartState.dynamicType==="storage"?$("dynamicParam").value:""
          })
        });
        items=(data.results||[]).map(x=>({...x,effectivePrice:null}));
        if(data.setupRequired) render("⚠️ 尚未設定 SERPER_API_KEY，目前只能建立通路搜尋連結。");
        else render(`搜尋完成：官網直接取得 ${data.officialFound||0} 個｜總共取得 ${data.found||0} 個價格。其餘才使用 Google 補查。`);
        setTimeout(()=>document.querySelector(".result-head")?.scrollIntoView({behavior:"smooth",block:"start"}),100);
      }catch(e){
        items=[];$("results").className="results empty";$("results").textContent="價格搜尋失敗。";
        setStatus("價格搜尋失敗："+e.message,true);
      }finally{btn.disabled=false;btn.textContent=old}
    });

    ["coupon","discountPct","cardPct","points","platformCredit","installFee","shipping","tradeIn","region","floor"]
      .forEach(id=>$(id).addEventListener("input",()=>render()));
    $("sort").addEventListener("change",()=>render());
  }catch(e){
    setStatus("系統初始化失敗："+e.message,true);
  }
});