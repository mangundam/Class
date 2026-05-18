import os
from bs4 import BeautifulSoup

input_file = "丙檢工作項目04.html"
output_file = "列印版_工作項目04.html"


def convert_to_compact_format():
    if not os.path.exists(input_file):
        print(f"找不到檔案：{input_file}")
        return

    with open(input_file, "r", encoding="utf-8") as f:
        soup = BeautifulSoup(f, "html.parser")

    rows = soup.find_all("tr")[1:]

    html_template = """
    <!DOCTYPE html>
    <html lang="zh-Hant">
    <head>
        <meta charset="UTF-8">
        <style>
            /* 設定基礎字體與極窄行距 */
            body { 
                font-family: "Microsoft JhengHei", sans-serif; 
                font-size: 12px; 
                line-height: 1.2; 
                margin: 0;
                padding: 0;
            }
            
            /* 列印邊界設定為 0.5cm */
            @media print {
                @page { 
                    margin: 0.5cm; 
                }
                button { display: none; }
            }

            h2 { text-align: center; font-size: 16px; margin: 5px 0; }
            
            /* 雙欄排版，欄間距縮小 */
            .container { 
                column-count: 2; 
                column-gap: 20px; 
                column-rule: 0.5px solid #eee; 
            }

            /* 題目區塊：緊湊排列 */
            .q-block { 
                break-inside: avoid; 
                margin-bottom: 6px; 
                padding-bottom: 4px; 
                border-bottom: 0.5px solid #f0f0f0; 
            }

            .q-header { font-weight: bold; }
            .ans { color: #d32f2f; font-weight: bold; }
            
            /* 選項與解析緊貼題目 */
            .options { margin-left: 10px; color: #333; }
            
            /* 針對選項中的圖片進行縮放，避免破壞排版 */
            .options img {
                max-height: 16px;    /* 限制圖片高度，使其與文字差不多高 */
                width: auto;         /* 依比例自動調整寬度 */
                vertical-align: middle; /* 讓圖片與文字對齊 */
                margin: 0 2px;       /* 圖片左右留一點點空隙 */
            }
            
            .note { 
                font-size: 11px; 
                color: #777; 
                display: block; 
                margin-top: 1px;
            }
        </style>
    </head>
    <body>
        <h2>電腦軟體應用 丙級 項目04</h2>
        <div style="text-align:center;"><button onclick="window.print()">直接列印</button></div>
        <div class="container">
    """

    for row in rows:
        cols = row.find_all("td")
        if len(cols) < 5:
            continue

        num = cols[0].get_text(strip=True)
        ans = cols[2].get_text(strip=True).replace("(", "").replace(")", "")

        question_td = cols[3]

        # 1. 為了安全分離題目與選項，我們先把 <p> 標籤（選項）抽出來
        p_tag = question_td.find("p")

        if p_tag:
            # 取得題目本文（不含選項）
            question_main = question_td.get_text(strip=True)
            # 因為 get_text() 會把 p 的文字也抓到，我們把 p 的純文字扣除，就是真正的題目本文
            p_text = p_tag.get_text(strip=True)
            if question_main.endswith(p_text):
                question_main = question_main[: -len(p_text)].strip()

            # 關鍵修改：使用 decode_contents() 保留 <p> 標籤內部的 HTML（包含 <img>）
            options_part = p_tag.decode_contents().strip()
        else:
            # 如果沒有 <p> 標籤，就照舊處理
            question_main = question_td.get_text(strip=True)
            options_part = ""

        analysis = cols[4].get_text(strip=True)

        item_html = f"""
            <div class="q-block">
                <span class="q-header">{num}.【{ans}】</span>{question_main}
                <div class="options">{options_part}</div>
                <span class="note">解：{analysis}</span>
            </div>
        """
        html_template += item_html

    html_template += "</div></body></html>"

    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html_template)

    print(f"極致省紙版轉換完成！輸出檔案：{output_file}")


if __name__ == "__main__":
    convert_to_compact_format()