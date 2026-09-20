# 全通路比價戰情室 v1.5.0

## 本版修正
- 正式更名為「全通路比價戰情室」
- 個位數、幾十元等明顯不合理價格直接排除
- 手機平板低於 NT$1,000 直接排除
- 3C / 家電 / 美妝依分類設定最低合理價
- 同批搜尋價格用中位數再排除明顯異常高低價
- Google Shopping 找不到的通路，會再做指定網站搜尋補抓
- 補抓最多 10 個高優先通路，兼顧成功率與 Serper 額度
- 搜尋字串支援常見容量格式與「愛瘋 → iPhone」等模糊正規化
- 找不到價格的通路仍保留通路搜尋連結，方便人工確認

Render：
Build Command：npm install
Start Command：npm start
Environment：SERPER_API_KEY
