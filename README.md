# 全通路比價中心 v1.4.0

## 搜尋架構
1. **官網直查**：優先連線至蝦皮、momo、PChome、Apple、三大電信、3C、美妝等官方網站搜尋頁並解析價格。
2. **Google 備援**：官方網站若被阻擋、逾時、改版或無法辨識價格，才使用 Serper Google Search，並限制在該通路網域內搜尋。
3. **比價網補查**：仍找不到時，再嘗試 FindPrice、飛比價格、Price.com.tw；比價網本身若阻擋，才以 Google 搜尋該比價網作最後補查。

## 其他改善
- 搜尋結果會標示：🟢 官網直查 / 🟡 Google 備援 / 🔵 比價網補查 / ⚪ 尚未取得。
- 容量關鍵字（128GB、256GB、512GB、1TB、2TB）會做相容性檢查。
- 手機類會排除明顯的 1 元、訂金、月租、門號、配件等異常低價。
- 結果按鈕始終前往原通路自己的搜尋頁，不會跳去 Google Shopping。

## Render 部署
- Build Command：`npm install`
- Start Command：`npm start`
- 建議環境變數：`SERPER_API_KEY`
  - 沒設定也能執行「官網直查」與「比價網直查」。
  - 設定後才會啟用 Google 第二順位備援與比價網的 Google 最後補查。

## 版本
v1.4.0
