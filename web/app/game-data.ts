export type TileKind =
  | "corner"
  | "factory"
  | "technology"
  | "industrial"
  | "realestate"
  | "finance"
  | "international"
  | "event"
  | "regulation"
  | "labor";

export type Tile = {
  id: number;
  name: string;
  kind: TileKind;
  price?: number;
  rent?: number;
  hint: string;
};

export const tiles: Tile[] = [
  { id: 0, name: "Khởi nghiệp", kind: "corner", hint: "Qua ô +2V" },
  { id: 1, name: "Nhà máy Dệt may", kind: "factory", price: 10, rent: 2, hint: "Sản xuất" },
  { id: 2, name: "Cơ hội kinh doanh", kind: "event", hint: "Rút thẻ T2" },
  { id: 3, name: "Công ty Phần mềm", kind: "technology", price: 8, rent: 2, hint: "Công nghệ" },
  { id: 4, name: "Thuế Nhà nước", kind: "regulation", hint: "Nộp 2V" },
  { id: 5, name: "KCN Bắc Ninh", kind: "industrial", price: 8, rent: 2, hint: "Khu công nghiệp" },
  { id: 6, name: "Ngân hàng thương mại", kind: "finance", hint: "Vay hoặc gửi vốn" },
  { id: 7, name: "Quản trị nhân sự", kind: "event", hint: "Rút thẻ T2" },
  { id: 8, name: "Khu dân cư công nhân", kind: "realestate", price: 6, rent: 1, hint: "Nhà đất" },
  { id: 9, name: "Thị trường ASEAN", kind: "international", price: 12, rent: 3, hint: "Hội nhập" },
  { id: 10, name: "Khủng hoảng kinh tế", kind: "corner", hint: "Rút thẻ khủng hoảng" },
  { id: 11, name: "Nhà máy Chế biến", kind: "factory", price: 12, rent: 2, hint: "Sản xuất" },
  { id: 12, name: "Công ty Tự động hóa", kind: "technology", price: 10, rent: 2, hint: "Công nghệ" },
  { id: 13, name: "Cạnh tranh thị trường", kind: "event", hint: "Rút thẻ T4" },
  { id: 14, name: "Khu đô thị mới", kind: "realestate", price: 8, rent: 2, hint: "Nhà đất" },
  { id: 15, name: "Cảng Cát Lái", kind: "international", price: 10, rent: 2, hint: "Xuất khẩu" },
  { id: 16, name: "Họp công đoàn", kind: "labor", hint: "Hài lòng hoặc lương" },
  { id: 17, name: "KCN Đà Nẵng", kind: "industrial", price: 10, rent: 2, hint: "Khu công nghiệp" },
  { id: 18, name: "Trung tâm tài chính", kind: "finance", price: 12, rent: 3, hint: "Thị trường Vốn" },
  { id: 19, name: "Toàn cầu hóa", kind: "event", hint: "Rút thẻ T6" },
  { id: 20, name: "Công đoàn đình công", kind: "corner", hint: "Kiểm tra hài lòng" },
  { id: 21, name: "Nhà máy Điện tử", kind: "factory", price: 14, rent: 3, hint: "Sản xuất" },
  { id: 22, name: "Cách mạng công nghiệp", kind: "technology", hint: "+1 công nghệ" },
  { id: 23, name: "Công ty AI", kind: "technology", price: 12, rent: 3, hint: "Công nghệ" },
  { id: 24, name: "Tối ưu hóa sản xuất", kind: "event", hint: "Rút thẻ T2" },
  { id: 25, name: "Đất trung tâm đô thị", kind: "realestate", price: 10, rent: 2, hint: "Nhà đất" },
  { id: 26, name: "Lợi tức ngân hàng", kind: "finance", hint: "Đầu tư 4V" },
  { id: 27, name: "Cảng Hải Phòng", kind: "international", price: 12, rent: 3, hint: "Xuất khẩu" },
  { id: 28, name: "Khu công nghệ cao", kind: "industrial", price: 12, rent: 3, hint: "R&D" },
  { id: 29, name: "Thị trường Đông Á", kind: "international", price: 14, rent: 3, hint: "Hội nhập" },
  { id: 30, name: "Thanh tra thị phần", kind: "corner", hint: "Thị phần cao bị phạt" },
  { id: 31, name: "Nhà máy Bán dẫn", kind: "factory", price: 16, rent: 4, hint: "Sản xuất" },
  { id: 32, name: "Tập đoàn Nền tảng số", kind: "technology", price: 14, rent: 4, hint: "Kiểm soát thị phần" },
  { id: 33, name: "Kinh tế vĩ mô", kind: "event", hint: "Rút thẻ T6" },
  { id: 34, name: "Đặc khu bất động sản", kind: "realestate", price: 12, rent: 3, hint: "Đầu cơ" },
  { id: 35, name: "Kiểm soát thị phần", kind: "regulation", hint: "Kiểm tra thị phần" },
  { id: 36, name: "Sở giao dịch & Quỹ", kind: "finance", price: 14, rent: 4, hint: "Cổ phần" },
  { id: 37, name: "Thị trường Toàn cầu", kind: "international", price: 16, rent: 4, hint: "Hội nhập" },
  { id: 38, name: "Thuế lũy tiến", kind: "regulation", hint: "10% tiền mặt" },
  { id: 39, name: "Cảng trung chuyển", kind: "international", price: 14, rent: 4, hint: "Đầu tư quốc tế" },
];

export type Delta = Partial<{
  cash: number;
  workers: number;
  factories: number;
  surplus: number;
  tech: number;
  society: number;
  happiness: number;
  integration: number;
  monopoly: number;
}>;
const eventTitles = {
  T2: [
    ["Ca làm kéo dài", "Đơn hàng gấp cần thêm thời gian lao động.", "Tăng thời gian làm việc để tạo thêm lợi nhuận (Lãi gộp tuyệt đối)."],
    ["Dây chuyền tự động", "Đối thủ đưa máy mới vào sản xuất.", "Công nghệ giúp giảm chi phí nhân sự trên mỗi sản phẩm, tăng lãi gộp."],
    ["Lương tối thiểu tăng", "Mức lương tối thiểu tăng một bậc.", "Lương là chi phí duy trì nhân sự (Giá cả sức lao động)."],
    ["Khan hiếm nhân sự", "Thiếu nhân sự lành nghề trên thị trường.", "Chi phí tuyển dụng và đào tạo làm tăng Quỹ lương."],
    ["Giá nguyên liệu tăng", "Đầu vào của ngành tăng giá.", "Nguyên liệu là Chi phí cố định, được chuyển dần vào giá bán."],
    ["Quỹ lương minh bạch", "Nhân sự yêu cầu công khai thang lương.", "Có thể trả lương theo thời gian hoặc khoán theo sản phẩm."],
    ["Đình công đòi lương", "Công đoàn yêu cầu chia sẻ thành quả.", "Mâu thuẫn phân chia lợi nhuận giữa Quỹ lương và Lãi gộp."],
    ["Cầu thị trường giảm", "Hàng hóa khó tiêu thụ.", "Lãi gộp chỉ thực sự trở thành Lãi ròng khi bán được hàng."],
    ["Khấu hao máy móc", "Thiết bị đến kỳ đại tu.", "Chi phí cố định (máy móc) giảm dần giá trị qua mỗi chu kỳ."],
    ["Tăng cường độ làm việc", "Có thể nâng định mức sản lượng.", "Cường độ cao giúp tiết kiệm thời gian, nhưng dễ gây kiệt sức."],
    ["Tai nạn lao động", "Một sự cố xảy ra trong xưởng.", "Đầu tư an toàn lao động là chi phí bắt buộc."],
    ["Biến động nhân sự", "Lao động có tay nghề muốn nghỉ.", "Nhân sự là nguồn gốc chính tạo ra giá trị mới."],
    ["Lựa chọn đầu tư", "Mua máy mới hay tuyển thêm người?", "Tăng máy móc làm tăng Chi phí cố định, ảnh hưởng Biên lợi nhuận ngắn hạn."],
  ],
  T3: [
    ["Tái đầu tư", "Bạn quyết định dùng phần Lãi ròng.", "Dùng một phần Lãi ròng để mở rộng quy mô kinh doanh."],
    ["Vay vốn mở rộng", "Ngân hàng đề nghị tài trợ.", "Lãi suất ngân hàng là khoản trích từ Lãi ròng để trả cho người cho vay."],
    ["Lãi suất tăng", "Chi phí tín dụng tăng đột ngột.", "Lãi suất thay đổi theo cung cầu trên thị trường vốn."],
    ["Đất gần metro", "Kỳ vọng hạ tầng đẩy giá đất.", "Vị trí tốt giúp tài sản tạo ra lợi nhuận ổn định."],
    ["Bong bóng nhà đất", "Giá đất tăng nóng.", "Đầu cơ dựa trên chênh lệch giá, không tạo ra giá trị cốt lõi."],
    ["Chuyển dịch ngành", "Ngành công nghệ đang có biên lợi nhuận cao.", "Vốn luôn chảy về nơi có Biên lợi nhuận cao nhất."],
    ["Đáo hạn nợ", "Khoản tín dụng đáo hạn.", "Tín dụng giúp xoay vòng vốn nhanh nhưng mang theo rủi ro."],
    ["Nợ xấu lan rộng", "Cú sốc tín dụng lan qua hệ thống.", "Hiệu ứng domino trong hệ thống tài chính khi nợ xấu tăng."],
    ["Thuế đất bỏ hoang", "Nhà nước đánh thuế đất không sử dụng.", "Chính sách này khuyến khích đưa đất vào sử dụng thay vì đầu cơ."],
    ["Lợi thế vị trí", "Một khu đất có vị trí vượt trội.", "Vị trí đắc địa tạo ra nguồn thu ổn định."],
    ["Phân bổ Lợi nhuận", "Chọn cách phân phối Lãi ròng năm nay.", "Cân bằng giữa Tái đầu tư và Phúc lợi xã hội."],
    ["Thâu tóm nhà máy", "Một nhà máy phá sản được rao bán.", "Mua lại đối thủ để mở rộng quy mô nhanh chóng."],
    ["Lạm phát tài sản", "Sức mua tiền giảm, giá tài sản tăng.", "Giá tài sản tăng ảo không đồng nghĩa với giá trị thực tăng."],
  ],
  T4: [
    ["Cuộc chiến giá", "Đối thủ giảm giá để giành khách.", "Giảm giá có thể tăng thị phần nhưng cũng làm lợi nhuận mỏng hơn."],
    ["Mua lại đối thủ", "Một doanh nghiệp cùng ngành chào bán.", "Mua lại giúp mở rộng nhanh, nhưng cần nhiều tiền mặt."],
    ["Công nghệ mới", "Đối thủ vừa nâng cấp dây chuyền.", "Đổi mới đúng lúc giúp doanh nghiệp giữ lợi thế."],
    ["Dẫn đầu thị trường", "Bạn đang có vị trí rất mạnh.", "Vị trí dẫn đầu tạo lợi nhuận tốt nhưng dễ bị cơ quan quản lý chú ý."],
  ],
  T6: [
    ["Hiệp định thương mại", "Thuế nhập khẩu giảm, thị trường mở rộng.", "Thị trường mới mang tới cả khách hàng lẫn đối thủ mới."],
    ["Vốn quốc tế", "Nhà đầu tư nước ngoài đề nghị góp vốn.", "Vốn mới giúp tăng tốc nhưng bạn phải chia sẻ quyền quyết định."],
    ["Nhà máy nước ngoài", "Có cơ hội mở xưởng ở một thị trường mới.", "Đầu tư ra nước ngoài giúp tiếp cận khách hàng và nguồn lực mới."],
    ["Chiến tranh thương mại", "Hai thị trường áp thuế lẫn nhau.", "Thuế cao làm hàng hóa đắt hơn và chuỗi cung ứng khó đoán hơn."],
    ["Đứt gãy chuỗi cung ứng", "Nguồn hàng quốc tế bị gián đoạn.", "Nhiều nguồn cung giúp doanh nghiệp chống chọi tốt hơn với biến động."],
    ["Quy tắc xuất xứ", "Hàng xuất khẩu phải đạt tỷ lệ nội địa.", "Mỗi thị trường có tiêu chuẩn riêng mà doanh nghiệp phải đáp ứng."],
    ["Chuyển giao công nghệ", "Đối tác chào một dây chuyền mới.", "Mua công nghệ chỉ là bước đầu; đội ngũ còn phải học cách làm chủ nó."],
    ["Hạ tầng công nghiệp", "Bạn được mời góp vốn cho cảng và khu công nghiệp.", "Hạ tầng tốt giúp giảm thời gian và chi phí vận chuyển."],
    ["Tự động hóa", "Nâng cấp sẽ thay đổi cách đội ngũ làm việc.", "Máy móc tăng năng suất nhưng cũng cần kế hoạch đào tạo nhân sự."],
    ["Tỷ giá biến động", "Đồng nội tệ giảm giá mạnh.", "Tỷ giá thay đổi có thể giúp xuất khẩu nhưng làm nhập khẩu đắt hơn."],
    ["Chuẩn lao động quốc tế", "Thị trường mới yêu cầu điều kiện lao động cao hơn.", "Đáp ứng tiêu chuẩn tốt giúp thương hiệu bền vững hơn."],
    ["Thuế carbon", "Hàng phát thải cao phải trả thêm phí.", "Đầu tư xanh sớm có thể tạo lợi thế dài hạn."],
    ["Khủng hoảng toàn cầu", "Cú sốc lan qua tài chính và thương mại.", "Đa dạng thị trường giúp giảm rủi ro khi một nơi gặp khủng hoảng."],
  ],
} as const;

const contextualChoiceLabels: Record<keyof typeof eventTitles, readonly (readonly [string, string, string])[]> = {
  T2: [
    ["Thỏa thuận ca kíp", "Chạy đơn gấp", "Tự động hóa công đoạn"],
    ["Nâng cấp dây chuyền", "Thuê ngoài một phần", "Giữ công nghệ cũ"],
    ["Điều chỉnh thang lương", "Tối ưu lịch làm", "Tăng giá bán"],
    ["Đào tạo nhân sự", "Chào gói giữ chân", "Tự động hóa vị trí trống"],
    ["Đàm phán nhà cung cấp", "Tối ưu định mức", "Chuyển chi phí vào giá"],
    ["Công khai nguyên tắc trả lương", "Khoán theo sản lượng", "Thiết lập quỹ thưởng"],
    ["Đối thoại với công đoàn", "Chia sẻ năng suất", "Giữ mức chi hiện tại"],
    ["Kích cầu có chọn lọc", "Giảm nhịp sản xuất", "Đổi phân khúc khách hàng"],
    ["Bảo dưỡng dự phòng", "Gia hạn khai thác", "Thay thế thiết bị"],
    ["Thiết kế lại định mức", "Thưởng theo năng suất", "Giữ nhịp làm việc an toàn"],
    ["Nâng chuẩn an toàn", "Tạm dừng kiểm tra", "Lập quỹ hỗ trợ"],
    ["Phỏng vấn giữ chân", "Bổ sung lộ trình nghề nghiệp", "Tuyển gấp bên ngoài"],
    ["Mua máy mới", "Tuyển đội vận hành", "Kết hợp máy và đào tạo"],
  ],
  T3: [
    ["Mở rộng năng lực", "Tăng quỹ dự phòng", "Chia cổ tức sớm"],
    ["Vay theo dự án", "Gọi vốn đối tác", "Thu hẹp kế hoạch"],
    ["Cố định lãi suất", "Trả bớt nợ", "Tái cơ cấu dòng tiền"],
    ["Khai thác dài hạn", "Mua đón đầu", "Chờ quy hoạch rõ ràng"],
    ["Chốt lời từng phần", "Giữ tài sản sử dụng", "Không chạy theo giá"],
    ["Dịch chuyển vốn có kiểm soát", "Nâng cấp năng lực lõi", "Đa dạng danh mục"],
    ["Gia hạn khoản vay", "Bán bớt tài sản", "Tăng doanh thu vận hành"],
    ["Lập quỹ thanh khoản", "Rà soát danh mục nợ", "Hạn chế đòn bẩy"],
    ["Đưa đất vào khai thác", "Hợp tác phát triển", "Nộp thuế và giữ đất"],
    ["Phát triển dự án thực", "Cho thuê dài hạn", "Bán lại theo chênh lệch"],
    ["Tái đầu tư có mục tiêu", "Tăng phúc lợi", "Tạo quỹ chống biến động"],
    ["Mua lại có điều kiện", "Liên doanh vận hành", "Bảo toàn tiền mặt"],
    ["Bảo toàn sức mua", "Ưu tiên dòng tiền", "Đầu tư theo tin đồn"],
  ],
  T4: [
    ["Giữ giá trị sản phẩm", "Khuyến mại ngắn hạn", "Tăng khác biệt dịch vụ"],
    ["Thẩm định thương vụ", "Liên minh cạnh tranh", "Tự phát triển nội lực"],
    ["Nâng cấp đúng điểm nghẽn", "Hợp tác chuyển giao", "Theo dõi thêm thị trường"],
    ["Minh bạch thị phần", "Mở chuẩn kết nối", "Tối ưu vị thế dẫn đầu"],
  ],
  T6: [
    ["Thử nghiệm thị trường mới", "Tận dụng ưu đãi thuế", "Củng cố chuỗi trong nước"],
    ["Nhận vốn kèm điều khoản", "Đàm phán quyền quản trị", "Tự tích lũy vốn"],
    ["Lập điểm sản xuất", "Hợp tác địa phương", "Xuất khẩu qua đối tác"],
    ["Đa dạng thị trường", "Tối ưu xuất xứ", "Tạm hoãn hợp đồng rủi ro"],
    ["Kích hoạt nguồn cung dự phòng", "Chia sẻ tồn kho", "Điều chỉnh kế hoạch giao hàng"],
    ["Nội địa hóa đầu vào", "Truy xuất chuỗi cung", "Chuyển hướng thị trường"],
    ["Đào tạo đội vận hành", "Mua kèm chuyển giao", "Thử nghiệm quy mô nhỏ"],
    ["Đầu tư hạ tầng dùng chung", "Thuê năng lực logistics", "Giữ vốn cho lõi"],
    ["Đào tạo lại đội ngũ", "Tự động hóa từng phần", "Thiết kế lại công việc"],
    ["Khóa rủi ro tỷ giá", "Điều chỉnh hợp đồng", "Tăng tỷ trọng nội địa"],
    ["Nâng chuẩn lao động", "Chứng nhận chuỗi cung", "Rút khỏi phân khúc chưa phù hợp"],
    ["Giảm phát thải đầu nguồn", "Đổi công nghệ sạch", "Mua tín chỉ carbon"],
    ["Phân tán thị trường", "Bảo vệ dòng tiền", "Hỗ trợ chuỗi đối tác"],
  ],
};

function choicesFor(topic: keyof typeof eventTitles, index: number): GameEvent["choices"] {
  const variants = {
    T2: [
      { label: "Chia sẻ chi phí", effect: "−2 V • Hài lòng +8 • Uy tín +5", delta: { cash: -2, happiness: 8, society: 5 } },
      { label: "Ưu tiên lợi nhuận", effect: "Lợi nhuận +3 • Hài lòng −10 • Uy tín −5", delta: { surplus: 3, happiness: -10, society: -5 } },
      { label: "Đầu tư năng suất", effect: "−4 V • Công nghệ +1 • Lợi nhuận +1", delta: { cash: -4, tech: 1, surplus: 1 } },
    ],
    T3: [
      { label: "Tái đầu tư", effect: "−5 V • Xưởng +1", delta: { cash: -5, factories: 1 } },
      { label: "Giữ tiền dự phòng", effect: "+2 V • Uy tín +2", delta: { cash: 2, society: 2 } },
      { label: "Đầu cơ tài sản", effect: "−3 V • Lợi nhuận +2 • Uy tín −4", delta: { cash: -3, surplus: 2, society: -4 } },
    ],
    T4: [
      { label: "Mở rộng thị phần", effect: "−4 V • Thị phần +2 • Uy tín −5", delta: { cash: -4, monopoly: 2, society: -5 } },
      { label: "Dùng công nghệ", effect: "−3 V • Công nghệ +1 • Thị phần +1", delta: { cash: -3, tech: 1, monopoly: 1 } },
      { label: "Chia sẻ tiêu chuẩn", effect: "Uy tín +8 • Thị phần −1", delta: { society: 8, monopoly: -1 } },
    ],
    T6: [
      { label: "Mở rộng quốc tế", effect: "−3 V • Quốc tế +2 • Công nghệ +1", delta: { cash: -3, integration: 2, tech: 1 } },
      { label: "Tập trung trong nước", effect: "+2 V • Quốc tế −1", delta: { cash: 2, integration: -1 } },
      { label: "Đầu tư bền vững", effect: "−4 V • Quốc tế +1 • Uy tín +8", delta: { cash: -4, integration: 1, society: 8 } },
    ],
  } as const;
  const selected = [...variants[topic]] as unknown as GameEvent["choices"];
  const labels = contextualChoiceLabels[topic][index];
  return selected.map((choice, choiceIndex) => ({ ...choice, label: labels?.[choiceIndex] ?? choice.label }));
}

export const events: GameEvent[] = (Object.keys(eventTitles) as (keyof typeof eventTitles)[]).flatMap(
  (topic) => eventTitles[topic].map((entry, index) => ({
    id: `${topic}-${String(index + 1).padStart(2, "0")}`,
    topic,
    title: entry[0],
    situation: entry[1],
    concept: entry[2],
    choices: choicesFor(topic, index),
  })),
);

export const playerColors = ["#1687b1", "#d45532", "#16877e", "#8c67b8"];
export const playerSymbols = ["●", "▲", "■", "◆"];
