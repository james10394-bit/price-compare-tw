# 全通路比價戰情室 v1.6.0

## 搜尋順序重新設計
1. 官網優先
   - 先直接開各通路官方搜尋網址
   - 嘗試從 HTML / JSON-LD / product price meta 取得價格
2. 官網抓不到才用 Google Shopping
3. 再針對個別通路做 Google Shopping 補查
4. 最後才用一般 Google 指定網站搜尋

## 智慧品牌分析
輸入常見中文品牌，自動辨識英文品牌：
- 國際牌 / 松下 → Panasonic
- 大金 → Daikin
- 日立 → Hitachi
- 三星 → Samsung
- 蘋果 → Apple
- 小米 → Xiaomi
- 華碩 → ASUS
- 宏碁 → Acer
- 戴森 → Dyson
- 飛利浦 → Philips
- 夏普 → Sharp
- 東芝 → Toshiba

## 動態商品條件
### 冷氣
輸入「國際牌冷氣」「Panasonic 冷氣」等字樣後，自動顯示：
適用坪數下拉選單：
不限、2-3、3-5、4-6、5-7、6-8、7-9、8-10、9-12、10-13、12-15、15-18、18-22、22以上。

選擇後會把「Panasonic + 冷氣 + 坪數」一起拿去比價。

### 手機
輸入 iPhone / Galaxy / 手機等關鍵字，自動顯示容量：
64GB、128GB、256GB、512GB、1TB、2TB。

## 注意
官網有些會反爬蟲、價格由 JavaScript 動態載入、或登入後才顯示。
這些情況官網直抓會失敗，系統才會依序退到 Google 補查，不會跳過官網直接 Google。

Render：
Build Command：npm install
Start Command：npm start
Environment：SERPER_API_KEY
