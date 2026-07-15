# ÔNG TRÙM TƯ BẢN — bộ print-and-play

Bộ board game giáo dục dành cho 2–5 sinh viên, mô phỏng cạnh tranh, tích lũy,
lao động, độc quyền và hội nhập quốc tế qua các khái niệm Kinh tế chính trị
Mác–Lênin.

## Tệp sẵn sàng in

Các PDF được tạo trong `output/pdf/`:

- `ong-trum-tu-ban_board_A1.pdf` — bàn cờ 40 ô, khổ A1 ngang.
- `ong-trum-tu-ban_rulebook_A4.pdf` — luật chơi và phụ lục học thuật.
- `ong-trum-tu-ban_event-cards_A4.pdf` — 52 thẻ quyết định, 8 thẻ/tờ.
- `ong-trum-tu-ban_asset-tech-cards_A4.pdf` — thẻ tài sản và công nghệ.
- `ong-trum-tu-ban_dashboards_A4.pdf` — bảng doanh nghiệp và tờ tra cứu.
- `ong-trum-tu-ban_money-tokens-pawns_A4.pdf` — tiền, token và quân đứng.

## Quy ước nhanh

- 1V = 500.000 đồng; vốn ban đầu 20V = 10.000.000 đồng.
- In PDF ở 100%, không chọn “fit to page”.
- Bàn cờ: in A1, giấy dày hoặc bồi greyboard.
- Thẻ: giấy 200–250 gsm, cắt theo dấu; bọc sleeve poker 63 × 88 mm nếu muốn.
- Dashboard: nên ép plastic và dùng bút lông bảng.

## Tạo lại PDF

Chạy:

```powershell
& 'C:\Users\NgnHung\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe' .\src\generate_print_and_play.py
```

Nguồn dùng ReportLab và font Arial Unicode của Windows. Nội dung trò chơi nằm trong
`src/game_data.py`, thuận tiện để hiệu chỉnh sau playtest.

