from pathlib import Path
import math
from datetime import date

from reportlab.lib import colors
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4, A1, landscape
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, HRFlowable
)

from game_data import TILES, EVENTS, TECHS

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf"
TMP = ROOT / "tmp" / "pdfs"
OUT.mkdir(parents=True, exist_ok=True)
TMP.mkdir(parents=True, exist_ok=True)

FONT_REG = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
pdfmetrics.registerFont(TTFont("OT-Regular", str(FONT_REG)))
pdfmetrics.registerFont(TTFont("OT-Bold", str(FONT_BOLD)))

INK = HexColor("#17202A")
PAPER = HexColor("#F4EBDD")
WHITE = HexColor("#FFFDF7")
MUTED = HexColor("#D8D1C5")
RUST = HexColor("#C94F32")
BLUE = HexColor("#1976A3")
OCHRE = HexColor("#D49A16")
VIOLET = HexColor("#6B5AA6")
TEAL = HexColor("#16877E")
RED = HexColor("#A93F4D")
NAVY = HexColor("#314256")
GREEN = HexColor("#4A7C59")

CATEGORY_COLORS = {
    "SẢN XUẤT": RUST, "CÔNG NGHỆ": BLUE, "KHU CN": OCHRE,
    "BẤT ĐỘNG SẢN": OCHRE, "TÀI CHÍNH": VIOLET, "QUỐC TẾ": TEAL,
    "LAO ĐỘNG": RED, "ĐIỀU TIẾT": NAVY, "ĐỘC QUYỀN": VIOLET,
    "THẺ T2": RUST, "THẺ T3": OCHRE, "THẺ T4": VIOLET,
    "THẺ T6": TEAL, "GÓC": NAVY,
}
TOPIC_COLORS = {"T2": RUST, "T3": OCHRE, "T4": VIOLET, "T6": TEAL}


def meta(c, title):
    c.setTitle(title)
    c.setAuthor("Bộ thiết kế Ông Trùm Tư Bản")
    c.setSubject("Board game giáo dục Kinh tế chính trị Mác–Lênin")
    c.setKeywords("board game, kinh tế chính trị, Marx, print and play")


def rounded_label(c, x, y, w, h, text, fill, size=7, text_color=colors.white):
    c.setFillColor(fill)
    c.roundRect(x, y, w, h, h / 2, stroke=0, fill=1)
    c.setFillColor(text_color)
    c.setFont("OT-Bold", size)
    c.drawCentredString(x + w / 2, y + (h - size) / 2 + 1, text)


def wrap_lines(text, font, size, max_width, max_lines=None):
    words = text.split()
    lines, line = [], ""
    for word in words:
        test = word if not line else f"{line} {word}"
        if pdfmetrics.stringWidth(test, font, size) <= max_width:
            line = test
        else:
            if line:
                lines.append(line)
            line = word
    if line:
        lines.append(line)
    if max_lines and len(lines) > max_lines:
        lines = lines[:max_lines]
        while lines[-1] and pdfmetrics.stringWidth(lines[-1] + "…", font, size) > max_width:
            lines[-1] = lines[-1][:-1]
        lines[-1] += "…"
    return lines


def draw_wrapped(c, text, x, y_top, max_width, size=8, leading=None,
                 font="OT-Regular", color=INK, max_lines=None, align="left"):
    leading = leading or size * 1.25
    lines = wrap_lines(text, font, size, max_width, max_lines)
    c.setFont(font, size)
    c.setFillColor(color)
    for i, line in enumerate(lines):
        y = y_top - i * leading
        if align == "center":
            c.drawCentredString(x + max_width / 2, y, line)
        else:
            c.drawString(x, y, line)
    return y_top - len(lines) * leading


def footer(c, page_w, label, page_num=None):
    c.setStrokeColor(MUTED)
    c.line(14 * mm, 10 * mm, page_w - 14 * mm, 10 * mm)
    c.setFont("OT-Regular", 6.5)
    c.setFillColor(NAVY)
    c.drawString(14 * mm, 6.5 * mm, f"ÔNG TRÙM TƯ BẢN • PRINT-AND-PLAY • {date.today().isoformat()}")
    c.drawRightString(page_w - 14 * mm, 6.5 * mm, f"{label}" + (f" • {page_num}" if page_num else ""))


def board_positions(origin_x, origin_y, side, corner, regular):
    """Clockwise: 0 bottom-left, 10 bottom-right, 20 top-right, 30 top-left."""
    pos = {}
    pos[0] = (origin_x, origin_y, corner, corner, 0)
    for i in range(1, 10):
        pos[i] = (origin_x + corner + (i - 1) * regular, origin_y, regular, corner, 0)
    pos[10] = (origin_x + side - corner, origin_y, corner, corner, 0)
    for i in range(11, 20):
        pos[i] = (origin_x + side - corner, origin_y + corner + (i - 11) * regular, corner, regular, 90)
    pos[20] = (origin_x + side - corner, origin_y + side - corner, corner, corner, 180)
    for i in range(21, 30):
        x = origin_x + side - corner - (i - 20) * regular
        pos[i] = (x, origin_y + side - corner, regular, corner, 180)
    pos[30] = (origin_x, origin_y + side - corner, corner, corner, 180)
    for i in range(31, 40):
        y = origin_y + side - corner - (i - 30) * regular
        pos[i] = (origin_x, y, corner, regular, -90)
    return pos


def draw_tile(c, tile, geom):
    idx, title, cat, action, price = tile
    x, y, w, h, rot = geom
    c.saveState()
    c.translate(x + w / 2, y + h / 2)
    c.rotate(rot)
    if abs(rot) == 90:
        w, h = h, w
    x0, y0 = -w / 2, -h / 2
    fill = WHITE if idx % 2 else PAPER
    c.setFillColor(fill)
    c.setStrokeColor(INK)
    c.setLineWidth(0.65)
    c.rect(x0, y0, w, h, fill=1, stroke=1)
    band_h = 11 * mm if cat != "GÓC" else 15 * mm
    col = CATEGORY_COLORS.get(cat, NAVY)
    c.setFillColor(col)
    c.rect(x0, y0 + h - band_h, w, band_h, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("OT-Bold", 5.6 if cat != "GÓC" else 7)
    c.drawCentredString(0, y0 + h - band_h + 3.8 * mm, cat)
    title_size = 7.2 if cat != "GÓC" else 8.5
    title_lines = wrap_lines(title, "OT-Bold", title_size, w - 5 * mm, 3)
    c.setFont("OT-Bold", title_size)
    c.setFillColor(INK)
    ty = y0 + h - band_h - 5 * mm
    for line in title_lines:
        c.drawCentredString(0, ty, line)
        ty -= title_size * 1.18
    action_lines = wrap_lines(action, "OT-Regular", 5.7, w - 5 * mm, 3)
    c.setFont("OT-Regular", 5.7)
    c.setFillColor(NAVY)
    ay = y0 + 6.2 * mm + (len(action_lines) - 1) * 2.2 * mm
    for line in action_lines:
        c.drawCentredString(0, ay, line)
        ay -= 7
    c.setFillColor(col)
    c.circle(x0 + 4.5 * mm, y0 + 4.5 * mm, 3.2 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("OT-Bold", 5.5)
    c.drawCentredString(x0 + 4.5 * mm, y0 + 3.7 * mm, f"{idx:02}")
    c.restoreState()


def generate_board():
    path = OUT / "ong-trum-tu-ban_board_A1.pdf"
    page_w, page_h = landscape(A1)
    c = canvas.Canvas(str(path), pagesize=(page_w, page_h), pageCompression=1)
    meta(c, "Ông Trùm Tư Bản — Bàn cờ A1")
    c.setFillColor(PAPER)
    c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
    side = 540 * mm
    ox, oy = 18 * mm, (page_h - side) / 2
    corner, regular = 72 * mm, (side - 2 * 72 * mm) / 9
    c.setFillColor(WHITE)
    c.setStrokeColor(INK)
    c.setLineWidth(1.2)
    c.rect(ox, oy, side, side, fill=1, stroke=1)
    for tile in TILES:
        draw_tile(c, tile, board_positions(ox, oy, side, corner, regular)[tile[0]])

    inner_x, inner_y = ox + corner, oy + corner
    inner = side - 2 * corner
    c.setFillColor(PAPER)
    c.rect(inner_x, inner_y, inner, inner, fill=1, stroke=0)
    c.setFillColor(INK)
    c.setFont("OT-Bold", 31)
    c.drawCentredString(inner_x + inner / 2, inner_y + inner * .62, "ÔNG TRÙM")
    c.setFillColor(RUST)
    c.setFont("OT-Bold", 40)
    c.drawCentredString(inner_x + inner / 2, inner_y + inner * .52, "TƯ BẢN")
    c.setFillColor(NAVY)
    c.setFont("OT-Regular", 10)
    c.drawCentredString(inner_x + inner / 2, inner_y + inner * .47,
                       "CẠNH TRANH • TÍCH LŨY • ĐỘC QUYỀN • HỘI NHẬP")

    # Hai khu đặt bộ bài, đúng cỡ thẻ poker + khoảng nhấc bài.
    well_w, well_h = 69 * mm, 94 * mm
    for wx, label, col in [
        (inner_x + 14 * mm, "SỰ KIỆN / QUYẾT ĐỊNH", VIOLET),
        (inner_x + inner - well_w - 14 * mm, "CÔNG NGHỆ", BLUE),
    ]:
        wy = inner_y + 15 * mm
        c.setStrokeColor(col)
        c.setLineWidth(1.2)
        c.setDash(5, 3)
        c.roundRect(wx, wy, well_w, well_h, 4 * mm, fill=0, stroke=1)
        c.setDash()
        c.setFillColor(col)
        c.setFont("OT-Bold", 7.5)
        c.drawCentredString(wx + well_w / 2, wy + well_h / 2, label)

    # Vòng và ba chỉ số thị trường.
    track_x, track_y = inner_x + inner * .24, inner_y + inner * .35
    c.setFillColor(INK)
    c.setFont("OT-Bold", 8)
    c.drawString(track_x, track_y + 10 * mm, "VÒNG")
    for i in range(1, 21):
        xx = track_x + ((i - 1) % 10) * 10.2 * mm
        yy = track_y + (1 - ((i - 1) // 10)) * 8 * mm
        c.setFillColor(WHITE)
        c.setStrokeColor(NAVY)
        c.circle(xx, yy, 3.4 * mm, fill=1, stroke=1)
        c.setFillColor(INK)
        c.setFont("OT-Bold", 5.5)
        c.drawCentredString(xx, yy - 1.8, str(i))
    for j, (lab, col) in enumerate([("CẦU", RUST), ("LÃI SUẤT", VIOLET), ("ỔN ĐỊNH XH", TEAL)]):
        yy = inner_y + inner * .27 - j * 10 * mm
        c.setFont("OT-Bold", 7)
        c.setFillColor(col)
        c.drawString(track_x, yy, lab)
        for k, t in enumerate(["THẤP", "TB", "CAO"]):
            rounded_label(c, track_x + 31 * mm + k * 25 * mm, yy - 3.5 * mm, 21 * mm, 6 * mm,
                          t, col if k == 1 else MUTED, 5.5, colors.white if k == 1 else INK)

    # Panel phải.
    px = ox + side + 15 * mm
    pw = page_w - px - 15 * mm
    c.setFillColor(INK)
    c.setFont("OT-Bold", 18)
    c.drawString(px, page_h - 28 * mm, "BẢNG ĐIỀU HÀNH")
    c.setFont("OT-Regular", 8)
    c.setFillColor(NAVY)
    c.drawString(px, page_h - 35 * mm, "2–5 người • 100–150 phút • 20 vòng")
    sections = [
        ("MỖI LƯỢT", ["1  Thanh toán bắt buộc", "2  Tung 2 xúc xắc & di chuyển", "3  Giải quyết ô đến", "4  Chọn 1 hành động quản trị", "5  Hạch toán c, v, m, π, p′"]),
        ("SẢN XUẤT", ["c = 2V × số LĐ", "Giá trị mới = 4V × số LĐ", "m = giá trị mới − v", "π = m + điều chỉnh cầu", "p′ = π / (c + v) × 100%"]),
        ("CẦU", ["Thấp: −1V/LĐ", "Bình thường: 0", "Cao: +1V/LĐ"]),
        ("NGƯỠNG", ["Độc quyền: ≥60% ngành + ≥2 tài sản", "Đình công: HL <25 tự động", "Thanh tra 6: phạt + bán đấu giá CP", "Xuất khẩu mở ở HN 2"]),
        ("THẮNG", ["40% tài sản • 20% m", "15% p′ • 15% XH • 10% HN", "Mọi chỉ số chuẩn hóa 0–100"]),
    ]
    y = page_h - 53 * mm
    for title, lines in sections:
        c.setFillColor(NAVY)
        c.roundRect(px, y - 5 * mm, pw, 8 * mm, 2 * mm, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("OT-Bold", 8)
        c.drawString(px + 3 * mm, y - 2.2 * mm, title)
        y -= 12 * mm
        for line in lines:
            c.setFillColor(INK)
            c.setFont("OT-Regular", 7.2)
            c.drawString(px + 2 * mm, y, "• " + line)
            y -= 5.2 * mm
        y -= 4 * mm
    c.setFillColor(RUST)
    c.roundRect(px, 18 * mm, pw, 24 * mm, 3 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("OT-Bold", 9)
    c.drawCentredString(px + pw / 2, 32 * mm, "1V = 500.000 ĐỒNG")
    c.setFont("OT-Regular", 6.8)
    c.drawCentredString(px + pw / 2, 24 * mm, "Giá trị game là mô phỏng sư phạm, không phải phép đo thực tế.")
    c.showPage()
    c.save()
    return path


def draw_event_card(c, x, y, event):
    code, topic, title, situation, a, b, cc, concept = event
    w, h = 63 * mm, 88 * mm
    col = TOPIC_COLORS[topic]
    c.setFillColor(WHITE)
    c.setStrokeColor(INK)
    c.setLineWidth(.65)
    c.roundRect(x, y, w, h, 3.5 * mm, fill=1, stroke=1)
    c.setFillColor(col)
    c.roundRect(x, y + h - 15 * mm, w, 15 * mm, 3.5 * mm, fill=1, stroke=0)
    c.rect(x, y + h - 15 * mm, w, 5 * mm, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("OT-Bold", 6.5)
    c.drawString(x + 4 * mm, y + h - 5.5 * mm, f"{topic} • QUYẾT ĐỊNH")
    c.setFont("OT-Bold", 9)
    title_lines = wrap_lines(title, "OT-Bold", 9, w - 8 * mm, 2)
    ty = y + h - 10 * mm
    for line in title_lines:
        c.drawString(x + 4 * mm, ty, line)
        ty -= 9.5
    yy = y + h - 19 * mm
    yy = draw_wrapped(c, situation, x + 4 * mm, yy, w - 8 * mm, 6.5, 8, "OT-Regular", INK, 3)
    yy -= 2 * mm
    for i, choice in enumerate([a, b, cc]):
        fill = [RUST, OCHRE, TEAL][i]
        c.setFillColor(fill)
        c.circle(x + 6 * mm, yy - 1 * mm, 2.4 * mm, fill=1, stroke=0)
        c.setFillColor(colors.white)
        c.setFont("OT-Bold", 5.5)
        c.drawCentredString(x + 6 * mm, yy - 2.7, "ABC"[i])
        lines = wrap_lines(choice[2:].strip() if choice[:1] in "ABC" else choice,
                           "OT-Regular", 6.15, w - 14 * mm, 2)
        c.setFillColor(INK)
        c.setFont("OT-Regular", 6.15)
        ly = yy
        for line in lines:
            c.drawString(x + 10 * mm, ly, line)
            ly -= 7.3
        yy -= max(11 * mm, len(lines) * 7.3 + 2 * mm)
    # Ghi chú luôn neo cuối thẻ.
    c.setFillColor(PAPER)
    c.roundRect(x + 3 * mm, y + 5 * mm, w - 6 * mm, 16 * mm, 2 * mm, fill=1, stroke=0)
    c.setFillColor(col)
    c.setFont("OT-Bold", 5.5)
    c.drawString(x + 5 * mm, y + 16.7 * mm, "MỘT PHÚT LÝ LUẬN")
    draw_wrapped(c, concept, x + 5 * mm, y + 13.2 * mm, w - 10 * mm, 5.35, 6.2,
                 "OT-Regular", INK, 3)
    c.setFillColor(col)
    c.setFont("OT-Bold", 5.5)
    c.drawRightString(x + w - 4 * mm, y + 2.5 * mm, code)


def generate_event_cards():
    path = OUT / "ong-trum-tu-ban_event-cards_A4.pdf"
    page_w, page_h = landscape(A4)
    c = canvas.Canvas(str(path), pagesize=(page_w, page_h), pageCompression=1)
    meta(c, "Ông Trùm Tư Bản — 52 thẻ sự kiện")
    card_w, card_h, gap = 63 * mm, 88 * mm, 5 * mm
    start_x = (page_w - (4 * card_w + 3 * gap)) / 2
    start_y = (page_h - (2 * card_h + gap)) / 2
    for p in range(math.ceil(len(EVENTS) / 8)):
        c.setFillColor(PAPER)
        c.rect(0, 0, page_w, page_h, fill=1, stroke=0)
        for slot in range(8):
            idx = p * 8 + slot
            if idx >= len(EVENTS):
                break
            col = slot % 4
            row = 1 - slot // 4
            x = start_x + col * (card_w + gap)
            y = start_y + row * (card_h + gap)
            draw_event_card(c, x, y, EVENTS[idx])
            c.setStrokeColor(HexColor("#777777"))
            c.setLineWidth(.25)
            for xx, yy in [(x, y), (x+card_w, y), (x, y+card_h), (x+card_w, y+card_h)]:
                c.line(xx-2*mm, yy, xx+2*mm, yy)
                c.line(xx, yy-2*mm, xx, yy+2*mm)
        footer(c, page_w, "THẺ SỰ KIỆN", p + 1)
        c.showPage()
    c.save()
    return path


def rulebook_styles():
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="OTTitle", fontName="OT-Bold", fontSize=28,
                              leading=31, textColor=RUST, alignment=TA_CENTER,
                              spaceAfter=10))
    styles.add(ParagraphStyle(name="OTSub", fontName="OT-Regular", fontSize=11,
                              leading=15, textColor=NAVY, alignment=TA_CENTER,
                              spaceAfter=12))
    styles.add(ParagraphStyle(name="OTH1", fontName="OT-Bold", fontSize=17,
                              leading=21, textColor=NAVY, spaceBefore=10, spaceAfter=7))
    styles.add(ParagraphStyle(name="OTH2", fontName="OT-Bold", fontSize=11.5,
                              leading=14, textColor=RUST, spaceBefore=8, spaceAfter=4))
    styles.add(ParagraphStyle(name="OTBody", fontName="OT-Regular", fontSize=8.7,
                              leading=12.2, textColor=INK, spaceAfter=5))
    styles.add(ParagraphStyle(name="OTSmall", fontName="OT-Regular", fontSize=7.2,
                              leading=9.2, textColor=NAVY, spaceAfter=3))
    styles.add(ParagraphStyle(name="OTCallout", fontName="OT-Bold", fontSize=9,
                              leading=12, textColor=colors.white, backColor=NAVY,
                              borderPadding=7, spaceBefore=5, spaceAfter=7))
    return styles


def bullets(items, style):
    return [Paragraph("• " + item, style) for item in items]


def generate_rulebook():
    path = OUT / "ong-trum-tu-ban_rulebook_A4.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4, leftMargin=16*mm,
                            rightMargin=16*mm, topMargin=16*mm, bottomMargin=16*mm,
                            title="Ông Trùm Tư Bản — Luật chơi")
    s = rulebook_styles()
    story = []
    story += [Spacer(1, 25*mm), Paragraph("ÔNG TRÙM TƯ BẢN", s["OTTitle"]),
              Paragraph("BOARD GAME NHẬP VAI KINH TẾ CHÍNH TRỊ MÁC–LÊNIN", s["OTSub"]),
              Spacer(1, 8*mm),
              Paragraph("2–5 người &nbsp;&nbsp;•&nbsp;&nbsp; 100–150 phút &nbsp;&nbsp;•&nbsp;&nbsp; 20 vòng &nbsp;&nbsp;•&nbsp;&nbsp; 1V = 500.000 đồng", s["OTCallout"]),
              Spacer(1, 12*mm),
              Paragraph("Mục tiêu", s["OTH1"]),
              Paragraph("Xây dựng một đế chế kinh tế có năng lực sản xuất, công nghệ, thị trường và hội nhập. Người thắng không chỉ giàu nhất: điểm số còn phản ánh giá trị thặng dư, hiệu quả vốn và công bằng xã hội.", s["OTBody"]),
              Paragraph("Lưu ý sư phạm", s["OTH2"]),
              Paragraph("Đây là mô hình trò chơi để thảo luận khái niệm, không phải phép đo định lượng hoàn chỉnh của nền kinh tế. Các token m, XH, HL chỉ là chỉ số mô phỏng.", s["OTBody"]),
              PageBreak()]

    story += [Paragraph("1. THÀNH PHẦN", s["OTH1"])]
    components = [
        "1 bàn cờ A1 gồm 40 ô; 2 xúc xắc sáu mặt; 1 marker vòng.",
        "5 bảng doanh nghiệp, 5 quân đứng và marker cho tiền, m, p′, XH, HL, HN, ĐQ, thanh tra.",
        "52 thẻ quyết định: 13 thẻ mỗi Chủ đề 2, 3, 4 và 6.",
        "23 thẻ quyền sở hữu tài sản; 12 thẻ công nghệ; thẻ tiền 1V, 2V, 5V, 10V và 20V.",
        "Ít nhất 50 phiếu hợp đồng lao động, 30 máy, 20 nhà máy, 20 BĐS, 40 cổ phần và 20 token dự phòng/nguyên liệu.",
    ]
    story += bullets(components, s["OTBody"])
    story += [Paragraph("Ngôn ngữ tôn trọng", s["OTH2"]),
              Paragraph("Token người lao động được gọi là <b>phiếu hợp đồng lao động</b>. Người chơi thuê sức lao động và trả tiền công; họ không “sở hữu công nhân”.", s["OTBody"]),
              Paragraph("2. CHUẨN BỊ", s["OTH1"])]
    setup = [
        "Mỗi người nhận 20V, 5 hợp đồng lao động, 1 nhà máy nhỏ, 2 máy và ba công nghệ khởi đầu: Quản trị số, Tiết kiệm năng lượng, Thương mại điện tử.",
        "Đặt XH = 50, HL = 60, HN = 0, ĐQ = 0, Thanh tra = 0 và m tích lũy = 0.",
        "Đặt mọi quân ở Khởi nghiệp. Trộn 52 thẻ theo bốn chủ đề; để bốn chồng hoặc trộn chung.",
        "Đặt cầu các ngành ở mức Bình thường. Tung xúc xắc chọn người đầu; sau mỗi vòng, chuyển quyền đi đầu sang trái.",
    ]
    story += bullets(setup, s["OTBody"])
    story += [Paragraph("3. MỘT VÒNG VÀ MỘT LƯỢT", s["OTH1"]),
              Paragraph("Đầu vòng, lật một thẻ vĩ mô nếu kịch bản yêu cầu, cập nhật cầu/lãi suất/ổn định và tăng marker vòng. Một vòng kết thúc khi mọi người đã đi một lượt.", s["OTBody"])]
    turn_rows = [
        ["1", "Thanh toán", "Trả lãi/nợ đến hạn; nhận địa tô, lợi tức và hiệu ứng định kỳ."],
        ["2", "Di chuyển", "Tung 2 xúc xắc. Không có lượt phụ khi ra đôi. Đi qua Khởi nghiệp nhận 2V."],
        ["3", "Ô đến", "Mua, trả phí, rút thẻ hoặc làm hành động ghi trên ô."],
        ["4", "Quản trị", "Chọn 1: sản xuất; lao động; máy/nhà máy; R&D; ngân hàng; giao dịch; xuất khẩu."],
        ["5", "Hạch toán", "Ghi c, v, giá trị mới, m, doanh thu R, lợi nhuận π và p′."],
    ]
    table = Table(turn_rows, colWidths=[10*mm, 30*mm, 125*mm])
    table.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'OT-Regular'),('FONTSIZE',(0,0),(-1,-1),7.7),
                               ('LEADING',(0,0),(-1,-1),10),('VALIGN',(0,0),(-1,-1),'TOP'),
                               ('BACKGROUND',(0,0),(1,-1),PAPER),('TEXTCOLOR',(0,0),(0,-1),RUST),
                               ('FONTNAME',(0,0),(1,-1),'OT-Bold'),('GRID',(0,0),(-1,-1),.3,MUTED),
                               ('BOX',(0,0),(-1,-1),.7,NAVY),('LEFTPADDING',(0,0),(-1,-1),5),
                               ('RIGHTPADDING',(0,0),(-1,-1),5),('TOPPADDING',(0,0),(-1,-1),5),
                               ('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [table, PageBreak()]

    story += [Paragraph("4. LÕI SẢN XUẤT", s["OTH1"]),
              Paragraph("Mỗi hành động sản xuất kích hoạt một nhà máy, tối đa một lần mỗi vòng. Mỗi lao động được kích hoạt cần một máy.", s["OTBody"])]
    cap_rows = [["Nhà máy","Sức chứa","Giá","Máy tối đa"], ["Nhỏ","2 LĐ","8V","2"],
                ["Vừa","3 LĐ","nâng 6V","3"], ["Lớn","4 LĐ","nâng 8V","4"]]
    t = Table(cap_rows, colWidths=[42*mm]*4)
    t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'OT-Regular'),('FONTNAME',(0,0),(-1,0),'OT-Bold'),
                           ('BACKGROUND',(0,0),(-1,0),RUST),('TEXTCOLOR',(0,0),(-1,0),colors.white),
                           ('ALIGN',(1,1),(-1,-1),'CENTER'),('GRID',(0,0),(-1,-1),.4,MUTED),
                           ('FONTSIZE',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [t, Paragraph("Ba chính sách tiền công", s["OTH2"])]
    wage_rows = [["Chính sách","v / LĐ","m / LĐ","Hệ quả"],
                 ["Thấp","1V","3V","HL −10/LĐ; XH −5/lô"],
                 ["Chuẩn","2V","2V","Không đổi"],
                 ["Công bằng","3V","1V","HL +5/LĐ; XH +5/lô"]]
    t = Table(wage_rows, colWidths=[36*mm,25*mm,25*mm,82*mm])
    t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'OT-Regular'),('FONTNAME',(0,0),(-1,0),'OT-Bold'),
                           ('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),
                           ('ALIGN',(1,1),(2,-1),'CENTER'),('GRID',(0,0),(-1,-1),.4,MUTED),('FONTSIZE',(0,0),(-1,-1),8),
                           ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [t, Spacer(1,3*mm),
              Paragraph("Với n lao động: <b>c = 2n</b>; <b>giá trị mới = 4n</b>; <b>m = 4n − v</b>; <b>W = c + v + m</b>.", s["OTCallout"]),
              Paragraph("Điều chỉnh cầu D cho mỗi lao động: thấp −1V, bình thường 0, cao +1V. Doanh thu thực hiện <b>R = c + 4n + Dn</b>; lợi nhuận <b>π = R − c − v = m + Dn</b>; tỷ suất lợi nhuận <b>p′ = π/(c+v) × 100%</b>.", s["OTBody"]),
              Paragraph("Ví dụ", s["OTH2"]),
              Paragraph("2 LĐ, lương chuẩn, cầu bình thường: c=4V; v=4V; giá trị mới=8V; m=4V; R=12V; π=4V; p′=50%.", s["OTBody"]),
              Paragraph("Phân biệt học thuật", s["OTH2"]),
              Paragraph("m phát sinh trong sản xuất; π là hình thức chuyển hóa và được thực hiện qua thị trường. m′=m/v phản ánh mức độ giá trị hóa tư bản khả biến; p′=π/(c+v) phản ánh hiệu quả toàn bộ tư bản ứng trước. Máy móc làm tăng năng suất nhưng không được mô tả là tự tạo giá trị mới.", s["OTBody"]),
              PageBreak()]

    story += [Paragraph("5. LAO ĐỘNG, ĐÌNH CÔNG, XÃ HỘI", s["OTH1"])]
    story += bullets([
        "Thuê 1 LĐ: phí tuyển 1V. Chấm dứt hợp đồng đã kích hoạt: HL −10 và XH −5/LĐ.",
        "HL ≥40: không kiểm tra. HL 25–39: gieo 1–2 xảy ra đình công. HL <25: đình công tự động.",
        "Đàm phán: trả 1V/LĐ, HL +10. Trấn áp/sa thải: mất 1 sản xuất, XH −8, Thanh tra +1. Chấp nhận yêu sách: lương tối thiểu doanh nghiệp +1 bậc, HL +15, XH +5.",
        "HL đo quan hệ trong doanh nghiệp; XH đo hệ quả phân phối rộng hơn. Không gộp hai chỉ số.",
    ], s["OTBody"])
    story += [Paragraph("6. TÀI SẢN, ĐẤT ĐAI VÀ ĐỊA TÔ", s["OTH1"])]
    story += bullets([
        "Tài sản chưa có chủ được mua theo giá niêm yết. Nếu người đến từ chối, đấu giá với giá mở 50%.",
        "Người đến tài sản có chủ trả phí cho cổ đông. Kiểm soát trọn nhóm: phí nhóm +1V và nhận thưởng nhóm ghi trên tờ tra cứu.",
        "BĐS trả địa tô 1V/vòng. Có thể trả 2V để tăng bong bóng một bậc (0–3), mỗi bậc tăng giá sổ sách 2V; mức 3 cho địa tô nhóm +1V.",
        "Khi vỡ bong bóng, giá sổ sách mất 2V × mức bong bóng rồi bong bóng về 0. Thanh lý ngân hàng nhận 60% giá sau điều chỉnh.",
    ], s["OTBody"])
    story += [Paragraph("7. NGÂN HÀNG VÀ TƯ BẢN TÀI CHÍNH", s["OTH1"])]
    story += bullets([
        "Hạn mức nợ tối đa 40% giá trị tài sản không thế chấp. Mỗi 10V nợ trả 1V lãi sau hai vòng; gốc đáo hạn sau bốn vòng.",
        "Gửi 4V, sau hai vòng nhận 5V. Phần 1V là lợi tức, không phải giá trị thặng dư trực tiếp của doanh nghiệp gửi vốn.",
        "Tài sản thế chấp không thu phí và chỉ tính 50% giá sổ sách.",
        "Có Trung tâm tài chính và 25% cổ phần trong hai doanh nghiệp khác: Tư bản tài chính, nhận tối đa +2V cổ tức/vòng; Thanh tra +1 mỗi hai vòng.",
    ], s["OTBody"])
    story += [PageBreak(), Paragraph("8. CỔ PHẦN, ĐỘC QUYỀN, THANH TRA", s["OTH1"])]
    story += bullets([
        "Mỗi tài sản có 4 cổ phần, mỗi token 25%. Có 75% trở lên là kiểm soát; 50% là đồng kiểm soát. Thu nhập chia theo tỷ lệ, phần lẻ cho bên kiểm soát.",
        "Giá giao dịch tối thiểu 50% giá sổ sách. Chào mua công khai ở ô Độc quyền tối thiểu 125% giá trị phần cổ phần.",
        "Độc quyền ngành khi có ≥60% năng lực và ít nhất 2 tài sản trong ngành: phí +1V; cầu sản xuất cao hơn một bậc; Thanh tra +1 đầu lượt.",
        "Thanh tra đạt 6: phạt 10% tài sản ròng (tối thiểu 4V), đấu giá 1 CP ngành độc quyền, mất trạng thái, XH −5; Thanh tra về 2.",
    ], s["OTBody"])
    story += [Paragraph("9. HỘI NHẬP VÀ XUẤT KHẨU TƯ BẢN", s["OTH1"])]
    hn_rows = [["HN","Mở khóa"],["2","Xuất khẩu hàng hóa: cần cảng; logistics 1V/lô"],
               ["4","Chi nhánh quốc tế: trả 8V; +1 năng lực; HN +1"],
               ["6","Xuất khẩu tư bản: đầu tư 6V; nhận 8–10V sau 3 vòng"],
               ["8","Chuỗi cung ứng toàn cầu"],["10","Tập đoàn xuyên quốc gia"]]
    t=Table(hn_rows,colWidths=[20*mm,145*mm])
    t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'OT-Regular'),('FONTNAME',(0,0),(-1,0),'OT-Bold'),
                           ('BACKGROUND',(0,0),(-1,0),TEAL),('TEXTCOLOR',(0,0),(-1,0),colors.white),
                           ('GRID',(0,0),(-1,-1),.4,MUTED),('FONTSIZE',(0,0),(-1,-1),8),
                           ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [t, Paragraph("10. PHÁ SẢN VÀ KẾT THÚC", s["OTH1"])]
    story += bullets([
        "Không trả được khoản bắt buộc: lần lượt bán tồn kho/tiền gửi, máy/CN, thế chấp, bán CP/tài sản, rồi xin vay. Chỉ sau đó mới xác nhận phá sản.",
        "Kết thúc cuối vòng nếu: hoàn thành vòng 20; một người phá sản; một người giữ tài sản ròng 100V đến cuối vòng; hoặc 3 ngành khủng hoảng trong 2 vòng.",
        "Kịch bản lớp học ngắn: 12 vòng, mục tiêu tài sản 70V.",
    ], s["OTBody"])
    story += [Paragraph("11. CHẤM ĐIỂM", s["OTH1"]),
              Paragraph("Chuẩn hóa mọi chỉ số về 0–100 trước khi nhân trọng số:", s["OTBody"])]
    score_rows = [["Thành phần","Chuẩn hóa","Trọng số"],
                  ["Tài sản","min(100, tài sản ròng / 100V ×100)","40%"],
                  ["Thặng dư","min(100, m tích lũy / 50V ×100)","20%"],
                  ["Lợi nhuận","min(100, p′ TB 3 lần gần nhất /80% ×100)","15%"],
                  ["Xã hội","XH hiện tại","15%"],
                  ["Hội nhập","HN /10 ×100","10%"]]
    t=Table(score_rows,colWidths=[35*mm,100*mm,30*mm])
    t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'OT-Regular'),('FONTNAME',(0,0),(-1,0),'OT-Bold'),
                           ('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),
                           ('ALIGN',(2,1),(2,-1),'CENTER'),('GRID',(0,0),(-1,-1),.4,MUTED),('FONTSIZE',(0,0),(-1,-1),8),
                           ('TOPPADDING',(0,0),(-1,-1),5),('BOTTOMPADDING',(0,0),(-1,-1),5)]))
    story += [t, Spacer(1,3*mm), Paragraph("Phạt: XH<30: −15; HL<25: −10; bị phạt độc quyền vòng cuối: −10. Thưởng Phát triển ổn định +5 nếu XH≥70 và HL≥70. Phá sản không đủ điều kiện thắng. Hòa điểm: XH → tài sản → nợ thấp → HN.", s["OTBody"]),
              PageBreak(), Paragraph("12. TRA CỨU 40 Ô", s["OTH1"])]
    tile_rows = [["#","Tên ô","Loại","Giá/hiệu ứng"]]
    for idx,title,cat,action,price in TILES:
        tile_rows.append([str(idx), title, cat, action])
    t=Table(tile_rows,colWidths=[9*mm,49*mm,28*mm,79*mm],repeatRows=1)
    t.setStyle(TableStyle([('FONTNAME',(0,0),(-1,-1),'OT-Regular'),('FONTNAME',(0,0),(-1,0),'OT-Bold'),
                           ('BACKGROUND',(0,0),(-1,0),NAVY),('TEXTCOLOR',(0,0),(-1,0),colors.white),
                           ('VALIGN',(0,0),(-1,-1),'TOP'),('GRID',(0,0),(-1,-1),.3,MUTED),
                           ('FONTSIZE',(0,0),(-1,-1),6.4),('LEADING',(0,0),(-1,-1),8),
                           ('ROWBACKGROUNDS',(0,1),(-1,-1),[WHITE,PAPER]),
                           ('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]))
    story += [t, PageBreak(), Paragraph("13. GỢI Ý GIẢNG DẠY VÀ PLAYTEST", s["OTH1"])]
    story += bullets([
        "Sau vòng 5, yêu cầu mỗi người giải thích một quyết định bằng c, v, m, m′ hoặc p′.",
        "Sau vòng 10, thảo luận: địa tô/lợi tức/lợi nhuận độc quyền có phải nguồn giá trị mới độc lập không?",
        "Cuối ván, so sánh chiến lược lương thấp, công bằng, công nghệ, đầu cơ, độc quyền và hội nhập.",
        "Playtest tối thiểu 3 nhóm × 3–4 ván. Ghi tiền mặt vòng 5/10/15, số đình công, số độc quyền, nguồn thu, vòng kết thúc và chênh điểm.",
        "Mục tiêu: không nguồn thu nào >45% tổng thu; độc quyền xuất hiện khoảng 1 lần/ván; người cuối vòng 8 vẫn có ít nhất 2 đường phục hồi.",
    ], s["OTBody"])
    story += [Paragraph("Sáu nguyên tắc học thuật", s["OTH2"])]
    story += bullets([
        "Token m chỉ là mô phỏng sư phạm, không phải phép đo giá trị thực tế.",
        "Lợi nhuận kế toán R−chi phí không đồng nhất với giá trị thặng dư.",
        "m′=m/v và p′=m/(c+v) phản ánh hai quan hệ khác nhau.",
        "Máy móc chuyển giá trị; công nghệ tăng năng suất, không tự tạo giá trị mới.",
        "Đầu cơ, tín dụng và giá độc quyền có thể phân phối lại giá trị.",
        "XH/HL thấp phải có hậu quả đủ mạnh để tối đa hóa bóc lột không thành chiến lược thắng tự động.",
    ], s["OTBody"])

    def on_page(canv, doc_obj):
        page_w, _ = A4
        footer(canv, page_w, "LUẬT CHƠI", doc_obj.page)
    doc.build(story, onFirstPage=on_page, onLaterPages=on_page)
    return path


def draw_generic_card(c, x, y, title, category, body_lines, code, col, badge=None):
    w, h = 63*mm, 88*mm
    c.setFillColor(WHITE); c.setStrokeColor(INK); c.setLineWidth(.65)
    c.roundRect(x,y,w,h,3.5*mm,fill=1,stroke=1)
    c.setFillColor(col); c.roundRect(x,y+h-17*mm,w,17*mm,3.5*mm,fill=1,stroke=0)
    c.rect(x,y+h-17*mm,w,5*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("OT-Bold",6.5)
    c.drawString(x+4*mm,y+h-5.5*mm,category)
    for i,line in enumerate(wrap_lines(title,"OT-Bold",9.2,w-8*mm,2)):
        c.setFont("OT-Bold",9.2); c.drawString(x+4*mm,y+h-11*mm-i*10,line)
    if badge:
        rounded_label(c,x+4*mm,y+h-26*mm,23*mm,7*mm,badge,col,6)
    yy=y+h-33*mm
    for head,text in body_lines:
        c.setFillColor(col); c.setFont("OT-Bold",6.2); c.drawString(x+4*mm,yy,head.upper())
        yy-=3.5*mm
        yy=draw_wrapped(c,text,x+4*mm,yy,w-8*mm,6.1,7.4,"OT-Regular",INK,3)
        yy-=2.5*mm
    c.setFillColor(PAPER); c.roundRect(x+3*mm,y+4*mm,w-6*mm,12*mm,2*mm,fill=1,stroke=0)
    c.setFillColor(NAVY); c.setFont("OT-Regular",5.7)
    c.drawString(x+5*mm,y+10.5*mm,"4 token cổ phần • mỗi token = 25%" if category!="CÔNG NGHỆ" else "Không cộng dồn nếu thẻ ghi rõ.")
    c.setFont("OT-Bold",5.7); c.drawRightString(x+w-5*mm,y+6*mm,code)


def generate_asset_tech_cards():
    path=OUT/"ong-trum-tu-ban_asset-tech-cards_A4.pdf"
    page_w,page_h=landscape(A4)
    c=canvas.Canvas(str(path),pagesize=(page_w,page_h),pageCompression=1)
    meta(c,"Ông Trùm Tư Bản — thẻ tài sản và công nghệ")
    cards=[]
    bonuses={
        "SẢN XUẤT":"Nâng cấp đầu tiên của nhóm giảm 2V.",
        "CÔNG NGHỆ":"Giới hạn công nghệ hoạt động +1.",
        "KHU CN":"Máy đầu tiên mỗi vòng giảm 1V.",
        "BẤT ĐỘNG SẢN":"Địa tô cả nhóm +1V/vòng.",
        "TÀI CHÍNH":"Lợi tức +1V mỗi hai vòng.",
        "QUỐC TẾ":"Một xuất khẩu/vòng miễn logistics.",
    }
    for idx,title,cat,action,price in TILES:
        if price is None: continue
        fee = action.split("phí ")[-1] if "phí " in action else "theo ô"
        body=[("Giá mua",f"{price}V • Giá thanh lý 60% • Phí cơ bản {fee}"),
              ("Năng lực","2 điểm ngành; kiểm soát 3/4 cổ phần để quyết định."),
              ("Thưởng nhóm",bonuses.get(cat,"Áp dụng theo luật nhóm."))]
        cards.append((title,cat,body,f"A-{idx:02}",CATEGORY_COLORS.get(cat,NAVY),f"Ô {idx:02}"))
    for i,(title,effect) in enumerate(TECHS,1):
        body=[("Triển khai",effect),("Chi phí","R&D 4V, trừ khi ô/thẻ quy định khác."),
              ("Ghi nhớ","Công nghệ tăng năng suất/quy mô; máy không tự tạo giá trị mới.")]
        cards.append((title,"CÔNG NGHỆ",body,f"CN-{i:02}",BLUE,"R&D"))
    cw,ch,gap=63*mm,88*mm,5*mm
    sx=(page_w-(4*cw+3*gap))/2; sy=(page_h-(2*ch+gap))/2
    for p in range(math.ceil(len(cards)/8)):
        c.setFillColor(PAPER); c.rect(0,0,page_w,page_h,fill=1,stroke=0)
        for slot in range(8):
            idx=p*8+slot
            if idx>=len(cards):break
            col=slot%4; row=1-slot//4
            x=sx+col*(cw+gap); y=sy+row*(ch+gap)
            draw_generic_card(c,x,y,*cards[idx])
        footer(c,page_w,"TÀI SẢN & CÔNG NGHỆ",p+1); c.showPage()
    c.save(); return path


def draw_track(c,x,y,w,label,min_v,max_v,step,col):
    c.setFillColor(col); c.setFont("OT-Bold",7.5); c.drawString(x,y+6*mm,label)
    vals=list(range(min_v,max_v+1,step))
    gap=w/(len(vals)-1)
    c.setStrokeColor(MUTED); c.setLineWidth(1); c.line(x,y,x+w,y)
    for i,v in enumerate(vals):
        xx=x+i*gap
        c.setFillColor(WHITE); c.setStrokeColor(col); c.circle(xx,y,2.3*mm,fill=1,stroke=1)
        c.setFillColor(INK); c.setFont("OT-Regular",5)
        c.drawCentredString(xx,y-5*mm,str(v))


def draw_dashboard(c,player_num,col,symbol):
    w,h=landscape(A4)
    c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
    c.setFillColor(col); c.rect(0,h-24*mm,w,24*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("OT-Bold",20)
    c.drawString(15*mm,h-15*mm,f"{symbol}  DOANH NGHIỆP {player_num}")
    c.setFont("OT-Regular",8); c.drawRightString(w-15*mm,h-14*mm,"BẢNG CÁ NHÂN • ÉP PLASTIC / BÚT XÓA ĐƯỢC")
    x0=16*mm; tw=124*mm
    tracks=[("XÃ HỘI (XH)",0,100,10),("HÀI LÒNG (HL)",0,100,10),
            ("HỘI NHẬP (HN)",0,10,1),("ĐỘC QUYỀN (ĐQ)",0,10,1),
            ("THANH TRA",0,6,1)]
    y=h-42*mm
    for lab,a,b,step in tracks:
        draw_track(c,x0,y,tw,lab,a,b,step,col); y-=24*mm
    rx=154*mm; rw=w-rx-16*mm
    c.setFillColor(WHITE); c.setStrokeColor(col); c.roundRect(rx,h-81*mm,rw,48*mm,4*mm,fill=1,stroke=1)
    c.setFillColor(col); c.setFont("OT-Bold",9); c.drawString(rx+5*mm,h-42*mm,"SỔ SẢN XUẤT — LÔ GẦN NHẤT")
    labels=["Số LĐ n","c = 2n","v = lương×n","Giá trị mới = 4n","m = 4n−v","Cầu D","R","π","p′"]
    for i,lab in enumerate(labels):
        cx=rx+5*mm+(i%3)*41*mm; cy=h-52*mm-(i//3)*10*mm
        c.setFillColor(NAVY); c.setFont("OT-Regular",6.5); c.drawString(cx,cy,lab)
        c.setStrokeColor(MUTED); c.line(cx,cy-4*mm,cx+34*mm,cy-4*mm)
    c.setFillColor(WHITE); c.setStrokeColor(col); c.roundRect(rx,h-137*mm,rw,48*mm,4*mm,fill=1,stroke=1)
    c.setFillColor(col); c.setFont("OT-Bold",9); c.drawString(rx+5*mm,h-98*mm,"TÀI NGUYÊN / TÀI SẢN")
    resources=["Tiền V","Hợp đồng LĐ","Máy","Nhà máy","Công nghệ","Sáng chế","BĐS","Cổ phần","Nợ","Tiền gửi"]
    for i,lab in enumerate(resources):
        xx=rx+5*mm+(i%5)*26*mm; yy=h-110*mm-(i//5)*17*mm
        c.setFillColor(PAPER); c.roundRect(xx,yy-8*mm,22*mm,12*mm,2*mm,fill=1,stroke=0)
        c.setFillColor(INK); c.setFont("OT-Regular",5.8); c.drawCentredString(xx+11*mm,yy+1*mm,lab)
        c.setFont("OT-Bold",11); c.drawCentredString(xx+11*mm,yy-6*mm,"___")
    c.setFillColor(NAVY); c.roundRect(rx,15*mm,rw,35*mm,4*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("OT-Bold",8); c.drawString(rx+5*mm,42*mm,"ĐIỂM CUỐI")
    draw_wrapped(c,"40% Tài sản + 20% m + 15% p′ + 15% XH + 10% HN",rx+5*mm,34*mm,rw-10*mm,8,10,"OT-Bold",colors.white,2)
    c.setFont("OT-Regular",6.5); c.drawString(rx+5*mm,19*mm,"XH<30: −15 • HL<25: −10 • XH & HL≥70: +5")
    footer(c,w,"DASHBOARD",player_num)


def generate_dashboards():
    path=OUT/"ong-trum-tu-ban_dashboards_A4.pdf"
    w,h=landscape(A4); c=canvas.Canvas(str(path),pagesize=(w,h),pageCompression=1)
    meta(c,"Ông Trùm Tư Bản — dashboards")
    player_cols=[HexColor('#0072B2'),HexColor('#D55E00'),HexColor('#009E73'),HexColor('#CC79A7'),HexColor('#E69F00')]
    symbols=['●','▲','■','D','H']
    for i,(col,sym) in enumerate(zip(player_cols,symbols),1):
        draw_dashboard(c,i,col,sym); c.showPage()
    # Tờ tra cứu riêng.
    c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
    c.setFillColor(NAVY); c.rect(0,h-24*mm,w,24*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("OT-Bold",20); c.drawString(15*mm,h-15*mm,"TỜ TRA CỨU CHUNG")
    blocks=[
        ("LƯỢT",["Thanh toán","Tung & đi","Giải quyết ô","1 quản trị","Hạch toán"]),
        ("SẢN XUẤT",["c=2n","giá trị mới=4n","m=4n−v","π=m+Dn","p′=π/(c+v)"]),
        ("CẦU",["Thấp D=−1","TB D=0","Cao D=+1"]),
        ("ĐÌNH CÔNG",["HL≥40: không","25–39: gieo 1–2","<25: tự động"]),
        ("ĐỘC QUYỀN",["≥60% + ≥2 tài sản","phí +1V","cầu +1 bậc","TT +1/lượt"]),
        ("HỘI NHẬP",["2: xuất khẩu","4: chi nhánh","6: xuất khẩu vốn","8: chuỗi QT","10: xuyên QG"]),
        ("PHÁ SẢN",["Bán tồn/gửi","Bán máy/CN","Thế chấp","Bán CP/tài sản","Xin vay"]),
        ("KẾT THÚC",["Vòng 20","Phá sản","100V cuối vòng","Khủng hoảng hệ thống"]),
    ]
    bw,bh=62*mm,66*mm
    for i,(title,lines) in enumerate(blocks):
        col=i%4; row=1-i//4; x=15*mm+col*69*mm; y=22*mm+row*76*mm
        color=[RUST,OCHRE,VIOLET,TEAL][col]
        c.setFillColor(WHITE); c.setStrokeColor(color); c.roundRect(x,y,bw,bh,4*mm,fill=1,stroke=1)
        c.setFillColor(color); c.roundRect(x,y+bh-12*mm,bw,12*mm,4*mm,fill=1,stroke=0); c.rect(x,y+bh-6*mm,bw,6*mm,fill=1,stroke=0)
        c.setFillColor(colors.white); c.setFont("OT-Bold",8); c.drawCentredString(x+bw/2,y+bh-7.5*mm,title)
        yy=y+bh-20*mm
        for line in lines:
            c.setFillColor(INK); c.setFont("OT-Regular",7.2); c.drawString(x+5*mm,yy,"• "+line); yy-=8*mm
    footer(c,w,"TRA CỨU",1); c.showPage(); c.save(); return path


def draw_bill(c,x,y,w,h,value,col):
    c.setFillColor(WHITE); c.setStrokeColor(col); c.setLineWidth(1)
    c.roundRect(x,y,w,h,3*mm,fill=1,stroke=1)
    c.setFillColor(col); c.rect(x,y+h-8*mm,w,8*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("OT-Bold",7); c.drawString(x+3*mm,y+h-5.5*mm,"PHIẾU VỐN — KHÔNG PHẢI TIỀN PHÁP ĐỊNH")
    c.setFillColor(col); c.setFont("OT-Bold",22); c.drawCentredString(x+w/2,y+h/2-4,str(value)+"V")
    c.setFont("OT-Regular",6); c.setFillColor(INK)
    c.drawCentredString(x+w/2,y+5*mm,f"{value*500_000:,.0f} đồng vốn mô phỏng".replace(',', '.'))
    for xx in [x+5*mm,x+w-5*mm]:
        c.setFillColor(col); c.circle(xx,y+6*mm,3*mm,fill=1,stroke=0)
        c.setFillColor(colors.white); c.setFont("OT-Bold",5.5); c.drawCentredString(xx,y+4.7*mm,str(value))


def generate_money_tokens_pawns():
    path=OUT/"ong-trum-tu-ban_money-tokens-pawns_A4.pdf"
    w,h=A4; c=canvas.Canvas(str(path),pagesize=A4,pageCompression=1)
    meta(c,"Ông Trùm Tư Bản — tiền, token, quân đứng")
    specs=[(1,RUST,20),(2,BLUE,20),(5,OCHRE,16),(10,VIOLET,12),(20,TEAL,8)]
    bills=[]
    for val,col,count in specs: bills += [(val,col)]*count
    bw,bh,gx,gy=58*mm,31*mm,5*mm,5*mm
    sx=(w-(3*bw+2*gx))/2; sy=18*mm
    per=15
    for p in range(math.ceil(len(bills)/per)):
        c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
        for slot in range(per):
            idx=p*per+slot
            if idx>=len(bills):break
            col=slot%3; row=4-slot//3
            x=sx+col*(bw+gx); y=sy+row*(bh+gy)
            draw_bill(c,x,y,bw,bh,*bills[idx])
        footer(c,w,"PHIẾU VỐN",p+1); c.showPage()
    # Token sheets.
    token_types=[("LĐ",RUST,"HỢP ĐỒNG",30), ("M",BLUE,"MÁY",24), ("CN",TEAL,"CÔNG NGHỆ",18),
                 ("CP",VIOLET,"CỔ PHẦN 25%",24), ("BĐS",OCHRE,"BẤT ĐỘNG SẢN",18), ("DP",NAVY,"DỰ PHÒNG",12)]
    tokens=[]
    for code,col,label,count in token_types: tokens += [(code,col,label)]*count
    per=60
    for p in range(math.ceil(len(tokens)/per)):
        c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
        for slot in range(per):
            idx=p*per+slot
            if idx>=len(tokens):break
            col=slot%10; row=5-slot//10
            x=15*mm+col*18.5*mm; y=31*mm+row*38*mm
            code,color,label=tokens[idx]
            c.setFillColor(WHITE); c.setStrokeColor(color); c.setLineWidth(.8); c.circle(x,y,8*mm,fill=1,stroke=1)
            c.setFillColor(color); c.setFont("OT-Bold",8); c.drawCentredString(x,y+1*mm,code)
            c.setFillColor(INK); c.setFont("OT-Regular",4.8); c.drawCentredString(x,y-3*mm,label)
        footer(c,w,"TOKEN",p+1); c.showPage()
    # Pawns / standees.
    c.setFillColor(PAPER); c.rect(0,0,w,h,fill=1,stroke=0)
    c.setFillColor(INK); c.setFont("OT-Bold",16); c.drawString(15*mm,h-20*mm,"QUÂN ĐỨNG — CẮT, GẤP ĐÔI, GẮN CHÂN")
    pawn_cols=[HexColor('#0072B2'),HexColor('#D55E00'),HexColor('#009E73'),HexColor('#CC79A7'),HexColor('#E69F00')]
    pawn_names=["CÔNG NGHIỆP","CÔNG NGHỆ","ĐỊA ỐC","TÀI CHÍNH","LOGISTICS"]
    sy=h-60*mm
    for i,(col,name) in enumerate(zip(pawn_cols,pawn_names)):
        x=16*mm+i*38*mm; pw,ph=32*mm,90*mm
        c.setFillColor(WHITE); c.setStrokeColor(col); c.roundRect(x,sy-ph,pw,ph,3*mm,fill=1,stroke=1)
        c.setFillColor(col); c.rect(x,sy-38*mm,pw,38*mm,fill=1,stroke=0); c.rect(x,sy-ph,pw,38*mm,fill=1,stroke=0)
        c.setFillColor(colors.white); c.setFont("OT-Bold",20); sym=['●','▲','■','D','H'][i]
        c.drawCentredString(x+pw/2,sy-24*mm,sym); c.drawCentredString(x+pw/2,sy-ph+14*mm,sym)
        c.setFont("OT-Bold",5.5); c.drawCentredString(x+pw/2,sy-32*mm,name); c.drawCentredString(x+pw/2,sy-ph+6*mm,name)
        c.setStrokeColor(NAVY); c.setDash(3,2); c.line(x,sy-45*mm,x+pw,sy-45*mm); c.setDash()
        c.setFillColor(NAVY); c.setFont("OT-Regular",5); c.drawCentredString(x+pw/2,sy-47.5*mm,"GẤP")
    c.setFillColor(NAVY); c.roundRect(20*mm,25*mm,w-40*mm,42*mm,4*mm,fill=1,stroke=0)
    c.setFillColor(colors.white); c.setFont("OT-Bold",9); c.drawString(27*mm,56*mm,"LẮP RÁP")
    draw_wrapped(c,"1. Cắt theo viền. 2. Gấp ở đường giữa. 3. Dán hai mặt. 4. Gắn vào đế nhựa hoặc kẹp giấy. Token tròn có đường kính 16 mm.",27*mm,48*mm,w-54*mm,8,11,"OT-Regular",colors.white,4)
    footer(c,w,"QUÂN ĐỨNG",1); c.showPage(); c.save(); return path


def main():
    generators=[generate_board,generate_rulebook,generate_event_cards,
                generate_asset_tech_cards,generate_dashboards,generate_money_tokens_pawns]
    created=[]
    for fn in generators:
        p=fn(); created.append(p); print(f"created {p}")
    print(f"total {len(created)} PDFs")


if __name__ == "__main__":
    main()
