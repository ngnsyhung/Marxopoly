"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

export type ExplorationTopic = {
  slide: string;
  title: string;
  question?: string;
  groups?: string;
  keywords: string[];
  outline: Array<{ title: string; items?: string[] }>;
};

export const explorationTopics: ExplorationTopic[] = [
  {
    slide: "1",
    title: "Lý luận của C. Mác về sản xuất hàng hóa, hàng hóa và thị trường, vận dụng phân tích thực tiễn chiến lược định giá thương hiệu",
    question: "Tại sao đồ hiệu lại đắt?",
    keywords: ["Phân công lao động xã hội", "Giá trị sử dụng", "Giá trị", "Lao động cụ thể", "Lao động trừu tượng", "Thời gian lao động xã hội cần thiết", "Quy luật giá trị", "Cung - cầu"],
    outline: [
      { title: "1. Sản xuất hàng hóa", items: ["Điều kiện ra đời: phân công lao động xã hội và tính chất tư nhân của sản xuất", "Mâu thuẫn cơ bản giữa lao động tư nhân và lao động xã hội"] },
      { title: "2. Hàng hóa và lao động sản xuất hàng hóa", items: ["Khái niệm, dạng hữu hình - vô hình; giá trị sử dụng và giá trị", "Lao động cụ thể và lao động trừu tượng", "Lượng giá trị; năng suất, cường độ và mức độ phức tạp của lao động"] },
      { title: "3. Tiền tệ và hàng hóa đặc biệt", items: ["Các hình thái giá trị; bản chất tiền tệ và vật ngang giá chung", "Thước đo giá trị, phương tiện lưu thông, cất trữ và thanh toán", "Dịch vụ, quyền sử dụng đất, thương hiệu và chứng khoán"] },
      { title: "4. Thị trường và nền kinh tế thị trường", items: ["Khái niệm, phân loại, vai trò và các chủ thể tham gia thị trường", "Đặc trưng, ưu thế và khuyết tật của nền kinh tế thị trường", "Quy luật giá trị, cung - cầu, lưu thông tiền tệ và cạnh tranh"] },
      { title: "5. Vận dụng: chiến lược định giá thương hiệu", items: ["Giải thích giá đồ hiệu từ giá trị sử dụng, giá trị, tính khan hiếm, thương hiệu và quan hệ cung - cầu"] },
    ],
  },
  {
    slide: "2",
    title: "Giá trị thặng dư và bản chất kinh tế của các mô hình kinh doanh nền tảng số",
    question: "Tài xế công nghệ có bị bóc lột không?",
    keywords: ["T - H - T'", "Hàng hóa sức lao động", "Giá trị thặng dư", "Tư bản bất biến (c)", "Tư bản khả biến (v)", "Tiền công", "Tuần hoàn tư bản", "m'"],
    outline: [
      { title: "1. Công thức chung của tư bản và hàng hóa sức lao động", items: ["Phân biệt H - T - H với T - H - T'", "Điều kiện để sức lao động trở thành hàng hóa; giá trị và giá trị sử dụng đặc biệt của sức lao động"] },
      { title: "2. Sự sản xuất giá trị thặng dư", items: ["Giá trị thặng dư là phần giá trị mới dôi ra ngoài giá trị sức lao động", "Tư bản bất biến (c), tư bản khả biến (v), tiền công và công thức G = c + v + m"] },
      { title: "3. Tuần hoàn và chu chuyển tư bản", items: ["T - H ... SX ... H' - T'; thời gian sản xuất và thời gian lưu thông", "Tư bản cố định, tư bản lưu động và tốc độ chu chuyển"] },
      { title: "4. Quy mô và phương pháp tạo giá trị thặng dư", items: ["Tỷ suất, khối lượng giá trị thặng dư", "Giá trị thặng dư tuyệt đối, tương đối và siêu ngạch"] },
      { title: "5. Vận dụng: nền tảng số", items: ["Phân tích thời gian lao động, tiền công, thuật toán phân phối đơn, tư liệu sản xuất và phần giá trị nền tảng chiếm giữ trong vận tải - giao hàng"] },
    ],
  },
  {
    slide: "3",
    title: "Tích lũy tư bản và hệ quả phân hóa xã hội nhìn từ thực tiễn thị trường bất động sản",
    question: "Hành vi đầu cơ trong kinh doanh BĐS có tác hại gì?",
    keywords: ["Tái sản xuất mở rộng", "Tích lũy tư bản", "Tích tụ", "Tập trung tư bản", "Chi phí sản xuất", "Lợi nhuận", "Tỷ suất lợi nhuận", "Địa tô"],
    outline: [
      { title: "1. Thực chất tích lũy tư bản", items: ["Tái sản xuất giản đơn và tái sản xuất mở rộng", "Chuyển hóa một phần giá trị thặng dư thành tư bản mới"] },
      { title: "2. Quy mô và hệ quả tích lũy", items: ["Khối lượng giá trị thặng dư; tỷ lệ chia quỹ tích lũy - quỹ tiêu dùng", "Tăng cấu tạo hữu cơ, tích tụ - tập trung tư bản và phân hóa thu nhập"] },
      { title: "3. Chi phí sản xuất và lợi nhuận", items: ["K = c + v; lợi nhuận là hình thái biến tướng của giá trị thặng dư", "Tỷ suất lợi nhuận và các nhân tố: m', c/v, tốc độ chu chuyển, tiết kiệm c"] },
      { title: "4. Các hình thái biểu hiện của giá trị thặng dư", items: ["Lợi nhuận bình quân, lợi nhuận thương nghiệp", "Lợi tức và địa tô tư bản chủ nghĩa"] },
      { title: "5. Vận dụng: đầu cơ bất động sản", items: ["Liên hệ địa tô, tín dụng, tích tụ tài sản, giá cả tách rời giá trị và hệ quả phân hóa xã hội"] },
    ],
  },
  {
    slide: "4",
    title: "Lý luận của V.I. Lênin về độc quyền và hành vi kiểm soát thị trường của các tập đoàn công nghệ toàn cầu",
    keywords: ["Độc quyền", "Độc quyền nhà nước", "Cartel", "Syndicate", "Trust", "Consortium", "Tư bản tài chính", "Xuất khẩu tư bản"],
    outline: [
      { title: "1. Độc quyền và độc quyền nhà nước", items: ["Nguyên nhân: lực lượng sản xuất, cạnh tranh, khủng hoảng và tín dụng thúc đẩy tích tụ - tập trung vốn", "Bản chất, tác động tích cực và tác động tiêu cực"] },
      { title: "2. Cạnh tranh trong trạng thái độc quyền", items: ["Trong nội bộ tổ chức, giữa doanh nghiệp độc quyền với bên ngoài, giữa các tổ chức và trên phạm vi quốc tế"] },
      { title: "3. Đặc điểm kinh tế của độc quyền theo V.I. Lênin", items: ["Cartel, syndicate, trust, consortium và conglomerate", "Tư bản tài chính - tài phiệt; xuất khẩu tư bản", "Phân chia thị trường thế giới và lãnh thổ ảnh hưởng"] },
      { title: "4. Độc quyền nhà nước", items: ["Kết hợp nhân sự giữa tổ chức độc quyền và nhà nước", "Sở hữu nhà nước và hệ thống công cụ điều tiết kinh tế"] },
      { title: "5. Biểu hiện mới và vận dụng", items: ["Công ty xuyên quốc gia, toàn cầu hóa - khu vực hóa, chiến lược biên giới mềm", "Phân tích thâu tóm, hiệu ứng mạng, dữ liệu, hệ sinh thái khép kín và hành vi kiểm soát thị trường của tập đoàn công nghệ"] },
    ],
  },
  {
    slide: "5",
    title: "Thể chế kinh tế thị trường định hướng xã hội chủ nghĩa và bài toán hài hòa các quan hệ lợi ích kinh tế ở Việt Nam",
    keywords: ["Kinh tế thị trường định hướng XHCN", "Dân giàu, nước mạnh", "Thể chế kinh tế", "Lợi ích kinh tế", "Quan hệ lợi ích", "Phân phối", "Công bằng xã hội", "Vai trò Nhà nước"],
    outline: [
      { title: "1. Khái niệm và tính tất yếu", items: ["Vận hành theo quy luật thị trường, hướng tới dân giàu, nước mạnh, dân chủ, công bằng, văn minh", "Phù hợp quy luật phát triển và nguyện vọng của nhân dân"] },
      { title: "2. Năm nhóm đặc trưng", items: ["Mục tiêu; sở hữu và thành phần kinh tế; quản lý nền kinh tế", "Phân phối; gắn tăng trưởng kinh tế với tiến bộ và công bằng xã hội"] },
      { title: "3. Hoàn thiện thể chế", items: ["Khắc phục thể chế chưa đồng bộ, chưa đầy đủ và kém hiệu lực", "Sở hữu - thành phần kinh tế; thị trường; năng lực chính trị; công bằng xã hội; hội nhập"] },
      { title: "4. Lợi ích và quan hệ lợi ích kinh tế", items: ["Bản chất, biểu hiện và vai trò động lực của lợi ích kinh tế", "Sự thống nhất - mâu thuẫn; các nhân tố ảnh hưởng và phương thức thực hiện lợi ích"] },
      { title: "5. Vai trò của Nhà nước", items: ["Bảo vệ lợi ích hợp pháp và tạo môi trường thuận lợi", "Điều hòa lợi ích cá nhân - doanh nghiệp - xã hội; kiểm soát tác động tiêu cực và giải quyết mâu thuẫn"] },
    ],
  },
  {
    slide: "6",
    title: "Công nghiệp hóa, toàn cầu hóa và hội nhập kinh tế quốc tế",
    keywords: ["Cách mạng công nghiệp", "Công nghiệp hóa", "Hiện đại hóa", "Kinh tế tri thức", "Hội nhập kinh tế quốc tế", "Toàn cầu hóa", "Năng lực cạnh tranh", "Độc lập, tự chủ"],
    outline: [
      { title: "1. Cách mạng công nghiệp và công nghiệp hóa", items: ["Bốn cuộc cách mạng: cơ giới hóa, điện khí hóa, tự động - điện tử hóa và công nghệ số", "Vai trò đối với lực lượng sản xuất, quan hệ sản xuất và phương thức quản trị", "Mô hình cổ điển, Liên Xô, Nhật Bản và các nền kinh tế công nghiệp mới"] },
      { title: "2. Công nghiệp hóa, hiện đại hóa ở Việt Nam", items: ["Tính tất yếu và đặc trưng: định hướng XHCN, kinh tế tri thức, kinh tế thị trường và hội nhập", "Ứng dụng khoa học - công nghệ; chuyển dịch cơ cấu kinh tế hiện đại"] },
      { title: "3. Hội nhập kinh tế quốc tế", items: ["Khái niệm, tính tất yếu trong bối cảnh toàn cầu hóa và các mức độ hội nhập", "Chuẩn bị điều kiện, lộ trình và hình thức hội nhập phù hợp"] },
      { title: "4. Tác động của hội nhập", items: ["Mở rộng thị trường, tiếp thu công nghệ - vốn, chuyển dịch cơ cấu và nâng chất lượng nhân lực", "Cạnh tranh, phụ thuộc, phân phối lợi ích không công bằng và thách thức chủ quyền"] },
      { title: "5. Nâng cao hiệu quả hội nhập", items: ["Chiến lược - lộ trình; thực hiện cam kết; hoàn thiện thể chế và pháp luật", "Nâng năng lực cạnh tranh và xây dựng nền kinh tế độc lập, tự chủ"] },
    ],
  },
];

export default function CourseGraphic({ guideTarget = false }: { guideTarget?: boolean }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <>
      <button className="market-infographic" data-home-guide={guideTarget ? "infographic" : undefined} onClick={() => setOpen(true)} aria-label="Mở infographic về kinh tế chính trị">
        <div className="infographic-top"><span>MARXOPOLY</span><small>THỊ TRƯỜNG • XÃ HỘI • HỘI NHẬP</small></div>
        <div className="infographic-title"><p>DÒNG CHẢY</p><h2>KINH TẾ<br /><b>TRONG CUỘC CHƠI</b></h2></div>
        <div className="infographic-flow" aria-hidden="true">
          {explorationTopics.map((topic, index) => <i key={topic.slide} style={{ "--topic-index": index } as React.CSSProperties}><span className="infographic-art" style={{ backgroundImage: "url('/art/market-scenarios.png')", backgroundPosition: `${(index % 3) * 50}% ${Math.floor(index / 3) * 100}%` }} /><b>0{topic.slide}</b><span>{topic.keywords[0]}</span></i>)}
        </div>
        <div className="infographic-stats"><span><b>06</b> VÙNG KHÁM PHÁ</span><span><b>05</b> DÒNG SLIDE</span><span><b>∞</b> TÌNH HUỐNG</span></div>
        <div className="infographic-hint"><span>↗</span><b>Chạm để xem bức tranh lớn</b><small>Infographic tương tác</small></div>
        <small className="infographic-signature">NgnHung</small>
      </button>

      {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {open && (
          <motion.div className="course-overlay" role="dialog" aria-modal="true" aria-labelledby="course-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
            <motion.section className="course-reader" initial={{ y: 30, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .98 }} onClick={(event) => event.stopPropagation()}>
              <header className="course-reader-head">
                <div><small>MARXOPOLY • INFOGRAPHIC</small><h2 id="course-title">Dòng chảy kinh tế</h2></div>
                <button onClick={() => setOpen(false)} aria-label="Đóng infographic">×</button>
              </header>
              <div className="course-reader-body">
                {explorationTopics.map((topic, index) => (
                  <article className="course-topic" key={topic.slide} style={{ "--accent-index": index } as React.CSSProperties}>
                    <div className="course-topic-meta"><b>{topic.slide}</b><span></span>{topic.groups && <small>{topic.groups}</small>}</div>
                    <figure className="course-topic-art">
                      {/* The assets are locally bundled static illustrations, sized exactly for this reader. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`/art/scenario-${index + 1}.png`} alt="" />
                    </figure>
                    <h3>{topic.title}</h3>
                    {topic.question && <blockquote>{topic.question}</blockquote>}
                    <div className="course-keywords" aria-label="Từ khóa trọng tâm">
                      {topic.keywords.map((keyword) => <mark key={keyword}>{keyword}</mark>)}
                    </div>
                    <h4>Các lớp nội dung</h4>
                    <div className="course-outline">
                      {topic.outline.map((section) => <section key={section.title}><strong>{section.title}</strong>{section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}</section>)}
                    </div>
                  </article>
                ))}
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>, document.body)}
    </>
  );
}
