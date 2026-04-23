import re
import json
from bs4 import BeautifulSoup

def process_content_with_imgs(element):
    """
    處理包含文字與圖片的元素，將 <img> 轉為 HTML 字串保留
    """
    if not element: return ""
    # 這裡我們直接拿 element 內部的 HTML，這樣 <img> 標籤就會被留下來
    # 但為了避免多餘的標籤，我們做一點清理
    return str(element.decode_contents()).strip()

def split_options(html_text):
    """
    針對含有 HTML 標籤的內容進行拆分
    """
    # 使用 (A), (B), (C), (D) 作為切割點，但保留標籤
    parts = re.split(r'\(A\)|\(B\)|\(C\)|\(D\)', html_text)
    # 第一段通常是題目，後面是選項內容
    labels = ['A', 'B', 'C', 'D']
    opts = {}
    
    # 尋找原始標籤出現的順序
    found_labels = re.findall(r'\(([A-D])\)', html_text)
    
    for i, label in enumerate(found_labels):
        if i + 1 < len(parts):
            opts[label] = parts[i+1].strip()
    return opts

# 讀取處理
with open("quiz.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f.read(), 'html.parser')

rows = soup.find_all('tr')[1:]
quiz_data = []

for row in rows:
    cols = row.find_all('td')
    if len(cols) < 5: continue
    
    raw_code = cols[1].get_text(strip=True)
    group_name = "-".join(raw_code.split('-')[:-1]) 
    
    # 核心修正：使用自定義函數處理第 4 欄 (題目+選項)
    full_content_html = process_content_with_imgs(cols[3])
    
    # 找出題目主幹 (第一個 (A) 之前)
    split_match = re.search(r'\(A\)', full_content_html)
    if split_match:
        question = full_content_html[:split_match.start()].strip()
        options_raw = full_content_html[split_match.start():]
    else:
        question = full_content_html
        options_raw = ""
    
    item = {
        "id": cols[0].get_text(strip=True),
        "group": group_name,
        "code": raw_code,
        "ans": cols[2].get_text(strip=True).replace('(', '').replace(')', ''),
        "question": question,
        "options_dict": split_options(options_raw),
        "analysis": process_content_with_imgs(cols[4]) # 解析也可能包含圖片
    }
    quiz_data.append(item)

with open("questions_url.json", "w", encoding="utf-8") as f:
    json.dump(quiz_data, f, ensure_ascii=False, indent=2)