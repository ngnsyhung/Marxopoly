import json
import re
import sys
from pathlib import Path

import pdfplumber


def color_is_emphasis(color):
    if color is None:
        return False
    if isinstance(color, (int, float)):
        return color < 0.72
    if not isinstance(color, (list, tuple)):
        return False
    values = [float(value) for value in color]
    if len(values) >= 3:
        spread = max(values[:3]) - min(values[:3])
        return spread > 0.12 or sum(values[:3]) / 3 < 0.52
    return bool(values and values[0] < 0.72)


def normalize(text):
    return re.sub(r"\s+", " ", text or "").strip()


def extract(path):
    pages = []
    with pdfplumber.open(path) as pdf:
        for number, page in enumerate(pdf.pages, 1):
            text = normalize(page.extract_text(x_tolerance=2, y_tolerance=3))
            words = page.extract_words(
                x_tolerance=2,
                y_tolerance=3,
                keep_blank_chars=False,
                extra_attrs=["fontname", "size", "non_stroking_color"],
            )
            emphasis = []
            for word in words:
                token = normalize(word.get("text"))
                font = str(word.get("fontname", ""))
                size = float(word.get("size") or 0)
                color = word.get("non_stroking_color")
                if len(token) > 1 and ("bold" in font.lower() or color_is_emphasis(color) or size >= 24):
                    emphasis.append(token)
            pages.append({
                "page": number,
                "text": text,
                "emphasis": list(dict.fromkeys(emphasis)),
            })
    return pages


source = Path(sys.argv[1])
target = Path(sys.argv[2])
target.write_text(json.dumps(extract(source), ensure_ascii=False, indent=2), encoding="utf-8")
