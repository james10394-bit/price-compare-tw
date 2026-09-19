# 全通路比價中心 v1.1.0

## 這版才是真正的「自動價格搜尋」

v1.0.x 只會建立各通路搜尋連結，所以價格欄會一直顯示「尚未輸入」。

v1.1.0 加入 Google Shopping 即時價格搜尋（Serper API）。

### 支援通路
PChome、momo、Yahoo購物中心、蝦皮、燦坤3C、全國電子、Costco、順發3C、NOVA、欣亞、良興、原價屋、AUTOBUY、三井3C、日本橋等。

### Render 必須增加一個環境變數

1. 到 https://serper.dev 建立帳號並取得 API Key
2. Render → price-compare-tw → Environment
3. Add Environment Variable
4. Key：`SERPER_API_KEY`
5. Value：貼上 Serper API Key
6. Save Changes / Redeploy

沒有 SERPER_API_KEY 時，系統會退回舊版「通路搜尋連結」模式，不會假裝有抓到價格。

### Render
Build Command：`npm install`
Start Command：`npm start`

### 健康檢查
開啟：
`/api/health`

若顯示：
`"automaticPriceSearch": true`
代表自動價格搜尋已經啟用。
