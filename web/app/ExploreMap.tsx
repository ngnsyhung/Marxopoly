"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { explorationTopics } from "./CourseGraphic";

const mapPoints = [
  { x: 17, y: 72 }, { x: 32, y: 47 }, { x: 49, y: 68 },
  { x: 62, y: 30 }, { x: 76, y: 57 }, { x: 87, y: 24 },
];

type StoryChoice = { label: string; consequence: string; score: number };
type StoryScene = { heading: string; text: string; choices: StoryChoice[] };
type StoryEnding = { title: string; text: string };
type MapStory = {
  name: string;
  opening: string;
  context: string;
  scenes: StoryScene[];
  endings: Record<"positive" | "balanced" | "difficult", StoryEnding>;
};

const stories: MapStory[] = [
  {
    name: "Phiên chợ cuối mùa",
    opening: "Lan mở tấm vải cuối cùng khi chợ đã thưa khách. Một người mua dừng lại, lướt tay trên đường dệt rồi hỏi: “Vì sao nó đắt hơn chiếc khăn ở quầy bên?”",
    context: "Mỗi mức giá ở khu chợ này là cuộc gặp giữa thời gian lao động, chất liệu, kỹ năng và niềm tin. Lan cần bán được hàng, nhưng cũng không muốn biến công sức của làng nghề thành một con số bị ép xuống.",
    scenes: [
      { heading: "Câu hỏi về giá", text: "Người khách chờ lời giải thích, còn quầy đối diện vừa treo biển giảm giá sâu.", choices: [
        { label: "Kể về người dệt, nguyên liệu và số giờ hoàn thiện", consequence: "Vị khách chưa mua ngay, nhưng bắt đầu nhìn chiếc khăn như một câu chuyện có thật.", score: 1 },
        { label: "Giảm giá ngay để giữ khách ở lại", consequence: "Giao dịch nhanh hơn, nhưng lời hứa về chất lượng bị kéo vào cuộc so sánh giá ngắn hạn.", score: 0 },
        { label: "Nói rằng đồ thủ công vốn phải đắt", consequence: "Câu trả lời làm khách lùi lại: giá trị không tự rõ ràng nếu người bán không biết cách chia sẻ nó.", score: -1 },
      ] },
      { heading: "Đơn đặt hàng bất ngờ", text: "Một cửa hàng thành phố đề nghị lấy số lượng lớn, với điều kiện giao trước mùa lễ hội.", choices: [
        { label: "Nhận đơn theo tiến độ vừa sức của nhóm thợ", consequence: "Đơn hàng nhỏ hơn, nhưng chất lượng và nhịp làm việc của mọi người vẫn được giữ.", score: 1 },
        { label: "Nhận toàn bộ và thuê gia công gấp", consequence: "Doanh thu hứa hẹn tăng, song mỗi chiếc khăn có thể mất đi phần dấu tay vốn làm nó khác biệt.", score: 0 },
        { label: "Từ chối hoàn toàn vì sợ thay đổi", consequence: "Làng nghề tránh được áp lực, nhưng bỏ lỡ cơ hội thử một cách hợp tác mới.", score: -1 },
      ] },
      { heading: "Mùa vải mới", text: "Giá sợi tăng, còn hàng tồn từ mùa trước vẫn ở trong kho. Lan phải chọn cách đi tiếp.", choices: [
        { label: "Tổ chức buổi gặp thợ dệt và khách để đặt trước mẫu mới", consequence: "Nhu cầu được lắng nghe trước khi sản xuất; rủi ro tồn kho giảm dần.", score: 1 },
        { label: "Xả toàn bộ hàng tồn bằng khuyến mãi", consequence: "Dòng tiền quay về nhanh, nhưng khách quen dần với việc chờ giảm giá.", score: 0 },
        { label: "Cắt bớt công đoạn để giữ biên lợi nhuận", consequence: "Chi phí giảm, song câu chuyện về tay nghề trở nên khó kể hơn.", score: -1 },
      ] },
    ],
    endings: {
      positive: { title: "Một thương hiệu có ký ức", text: "Lan không chọn đứng yên trước thị trường. Cô biến câu chuyện của người làm ra sản phẩm thành một phần của cuộc trao đổi; giá giữ được ý nghĩa, và khách hàng có lý do để quay lại." },
      balanced: { title: "Một mùa chợ nhiều cân nhắc", text: "Lan vẫn bán được hàng và học thêm cách đọc nhịp thị trường. Giá trị chưa hoàn toàn được bảo vệ, nhưng cô đã thấy rõ mỗi ưu đãi ngắn hạn đều cần một lời hứa dài hạn đi kèm." },
      difficult: { title: "Khi giá chỉ còn là con số", text: "Những quyết định gấp gáp giúp quầy hàng qua mùa này, nhưng dấu ấn của làng nghề mờ dần. Lan nhận ra: muốn xây lại niềm tin, trước hết phải trả lại tiếng nói cho công sức phía sau sản phẩm." },
    },
  },
  {
    name: "Đơn hàng lúc mưa",
    opening: "Mưa đổ xuống thành phố đúng lúc chuông ứng dụng giao hàng reo dồn dập. Minh kéo khóa áo mưa, nhìn màn hình sáng lên với một đơn thưởng cao.",
    context: "Sau mỗi biểu đồ giao hàng là thời gian, sức khỏe và rủi ro của nhiều người. Trung tâm điều hành phải quyết định cách hệ thống phản ứng khi điều kiện ngoài đường thay đổi.",
    scenes: [
      { heading: "Cơn mưa đầu ca", text: "Đường bắt đầu ngập; ứng dụng vẫn gợi ý nhận thêm cuốc vì nhu cầu tăng mạnh.", choices: [
        { label: "Bật phụ phí mưa và cho tài xế tự chọn nhận cuốc", consequence: "Thu nhập bù rủi ro rõ hơn, còn quyền quyết định vẫn nằm trong tay người đang ở ngoài đường.", score: 1 },
        { label: "Giữ nguyên giá và đẩy thưởng theo số đơn", consequence: "Nhiều người cố chạy nhanh hơn để đạt mốc thưởng, trong khi điều kiện đường xấu đi.", score: 0 },
        { label: "Ép nhận cuốc gần bằng cảnh báo giảm hạng", consequence: "Tốc độ phân phối tăng trong chốc lát, nhưng niềm tin với hệ thống giảm rất nhanh.", score: -1 },
      ] },
      { heading: "Tuyến đường bị ngập", text: "Một đơn giao chậm vì đoạn đường an toàn duy nhất dài hơn dự kiến.", choices: [
        { label: "Tự động nhận diện vùng ngập và nới thời gian giao", consequence: "Khách nhận được thông tin trung thực; người giao không phải đánh đổi an toàn lấy điểm số.", score: 1 },
        { label: "Đền mã giảm giá cho khách nhưng giữ chỉ tiêu giao", consequence: "Khách bớt khó chịu, nhưng gánh nặng thời gian vẫn dồn về phía tài xế.", score: 0 },
        { label: "Trừ điểm người giao vì trễ đơn", consequence: "Hệ thống có một con số đẹp hơn, còn thực tế đường phố bị bỏ quên.", score: -1 },
      ] },
      { heading: "Ca trực ở trung tâm", text: "Đội vận hành có ngân sách giới hạn cho tuần mưa tiếp theo.", choices: [
        { label: "Lập quỹ thời tiết và kênh phản hồi trực tiếp", consequence: "Chi phí tăng trước mắt, đổi lại dữ liệu và kinh nghiệm từ người giao được đưa vào quyết định.", score: 1 },
        { label: "Chỉ tăng quảng cáo để kéo thêm đơn", consequence: "Lượng đơn có thể tăng, nhưng nút thắt trên đường vẫn nguyên vẹn.", score: 0 },
        { label: "Cắt hỗ trợ để bảo toàn lợi nhuận tuần", consequence: "Bảng cân đối ngắn hạn nhẹ hơn, song đội ngũ bắt đầu rời đi khi mưa tới.", score: -1 },
      ] },
    ],
    endings: {
      positive: { title: "Nền tảng biết lắng nghe", text: "Cơn mưa không biến mất, nhưng hệ thống đã thay đổi cách chia sẻ rủi ro. Minh có thêm quyền lựa chọn; khách hiểu rõ hơn hành trình của đơn hàng; dữ liệu trở thành công cụ chăm sóc thay vì chỉ để thúc ép." },
      balanced: { title: "Một ngày giao vẫn chạy", text: "Dịch vụ được duy trì qua cơn mưa, dù một vài gánh nặng vẫn chưa được gọi tên. Đội vận hành đã có điểm bắt đầu để thiết kế quy tắc công bằng hơn cho lần sau." },
      difficult: { title: "Biểu đồ xanh, con đường đỏ", text: "Chỉ tiêu được bảo vệ nhưng những người ở ngoài đường phải trả giá. Khi người giao rời đi, nền tảng nhận ra tốc độ không thể là thước đo duy nhất của một dịch vụ bền vững." },
    },
  },
  {
    name: "Cần cẩu và quả bóng đỏ",
    opening: "Tin tuyến metro mới vừa lan ra, bảng giá đất quanh công trường đổi màu chỉ trong một tuần. Trên vỉa hè, một người thợ xây hỏi khi nào nơi đây mới có trường học và chợ thật sự.",
    context: "Đất đai có thể trở thành nơi ở, nơi làm việc và hạ tầng chung; cũng có thể bị cuốn vào vòng mua đi bán lại. Những người trong câu chuyện đang quyết định khu phố sẽ lớn lên theo hướng nào.",
    scenes: [
      { heading: "Tin đồn về ga mới", text: "Một nhóm nhà đầu tư đề nghị mua lô đất ngay hôm nay, trước khi thông tin chính thức công bố.", choices: [
        { label: "Đợi quy hoạch công khai và đối thoại với cư dân", consequence: "Cơ hội kiếm lời chớp nhoáng qua đi, nhưng quyết định có thêm thông tin và nhiều tiếng nói hơn.", score: 1 },
        { label: "Bán một phần để giảm rủi ro", consequence: "Bạn giữ được khoản vốn dự phòng, dù giá đất vẫn bị đẩy lên theo kỳ vọng.", score: 0 },
        { label: "Mua gom theo tin đồn để đón sóng", consequence: "Giá tăng nhanh, đồng thời người thuê nhà quanh đó bắt đầu lo lắng.", score: -1 },
      ] },
      { heading: "Bản vẽ dự án", text: "Kiến trúc sư đưa ra hai phương án: căn hộ cao cấp khép kín hoặc khu hỗn hợp có dịch vụ công cộng.", choices: [
        { label: "Dành không gian cho nhà ở vừa túi tiền và tiện ích chung", consequence: "Biên lợi nhuận ngắn hạn mỏng hơn, nhưng khu phố có lý do để sống và làm việc lâu dài.", score: 1 },
        { label: "Kết hợp hai loại hình với tỷ lệ vừa phải", consequence: "Nhiều nhóm vẫn có cơ hội tiếp cận, dù áp lực giá chưa hoàn toàn biến mất.", score: 0 },
        { label: "Tối đa hóa diện tích bán cao cấp", consequence: "Dự án dễ quảng bá, nhưng khoảng cách giữa công trường và cộng đồng xung quanh rộng thêm.", score: -1 },
      ] },
      { heading: "Ngày mở bán", text: "Khách xếp hàng đông; một số căn được giữ chỗ bởi người chưa từng định ở đây.", choices: [
        { label: "Ưu tiên người mua để ở và công khai giao dịch", consequence: "Nhịp bán có thể chậm hơn, nhưng dự án gần hơn với nhu cầu sử dụng thật.", score: 1 },
        { label: "Giới hạn số căn mỗi khách", consequence: "Đầu cơ giảm bớt, còn thị trường vẫn có chỗ cho nhiều kiểu người mua.", score: 0 },
        { label: "Để giá và người mua tự quyết hoàn toàn", consequence: "Cơn sốt tạo cảm giác thành công, song rủi ro lại dồn về người mua sau cùng.", score: -1 },
      ] },
    ],
    endings: {
      positive: { title: "Một khu phố có người ở", text: "Cần cẩu rời đi, thay vào đó là những con đường có trường, chợ và người dân thật. Giá trị của khu đất được gắn với nhu cầu sống, thay vì chỉ với kỳ vọng bán lại." },
      balanced: { title: "Giữa hai nhịp tăng trưởng", text: "Khu phố phát triển và vẫn còn nhiều áp lực giá. Các quyết định vừa qua chưa giải được mọi mâu thuẫn, nhưng đã để lại một khoảng trống cho cộng đồng cùng điều chỉnh." },
      difficult: { title: "Quả bóng đỏ tiếp tục bay", text: "Giá tăng nhanh hơn hạ tầng. Khi người mua để ở không còn cơ hội, khu đất trở thành cuộc chơi của kỳ vọng và câu hỏi “ai sẽ là người ở cuối cùng?” vẫn chưa có lời đáp." },
    },
  },
  {
    name: "Tháp của những nút mạng",
    opening: "Một ứng dụng từng giúp mọi người kết nối nhanh nay đã thành cánh cổng gần như bắt buộc với cửa hàng, lập trình viên và người dùng. Trên đỉnh tháp, các biểu đồ đều chỉ lên.",
    context: "Hiệu ứng mạng có thể tạo tiện ích lớn, nhưng cũng tập trung quyền lực vào người kiểm soát dữ liệu, tiêu chuẩn và khả năng xuất hiện. Đây là lúc nhóm điều hành phải chọn cách dùng sức mạnh ấy.",
    scenes: [
      { heading: "Cánh cổng dữ liệu", text: "Một nhóm lập trình viên xin quyền kết nối an toàn để xây dịch vụ bổ trợ.", choices: [
        { label: "Mở giao diện lập trình với tiêu chuẩn bảo mật rõ ràng", consequence: "Hệ sinh thái có thêm lối đi mới; công ty phải cạnh tranh bằng chất lượng thay vì chỉ bằng hàng rào.", score: 1 },
        { label: "Thử nghiệm với vài đối tác lớn", consequence: "Rủi ro được kiểm soát, nhưng các nhóm nhỏ vẫn phải đứng ngoài cánh cổng.", score: 0 },
        { label: "Từ chối để giữ toàn bộ dữ liệu trong tháp", consequence: "Quyền kiểm soát tăng lên, cùng với sự phụ thuộc của tất cả những ai muốn tiếp cận khách hàng.", score: -1 },
      ] },
      { heading: "Vị trí trên trang đầu", text: "Một cửa hàng nhỏ phản ánh rằng họ chỉ xuất hiện khi mua quảng cáo.", choices: [
        { label: "Công khai tiêu chí xếp hạng và tách quảng cáo khỏi kết quả", consequence: "Người bán biết cách cải thiện chất lượng, còn người mua phân biệt được điều gì đang được tài trợ.", score: 1 },
        { label: "Giữ quảng cáo nhưng đặt trần hiển thị", consequence: "Áp lực giảm một phần, dù khả năng trả tiền vẫn ảnh hưởng tới sự chú ý.", score: 0 },
        { label: "Tăng phí ưu tiên vì nhu cầu đang cao", consequence: "Doanh thu quảng cáo tăng, nhưng sân chơi trở nên hẹp hơn với những cửa hàng mới.", score: -1 },
      ] },
      { heading: "Quy tắc của cộng đồng", text: "Một thay đổi thuật toán khiến nhiều đối tác mất doanh thu chỉ sau một đêm.", choices: [
        { label: "Thông báo trước, giải thích tác động và mở kênh khiếu nại", consequence: "Quyết định mất thêm thời gian, nhưng đối tác có cơ hội thích nghi và phản hồi.", score: 1 },
        { label: "Công bố thay đổi sau khi đã áp dụng", consequence: "Tốc độ vận hành được giữ, còn niềm tin cần được xây lại bằng các bước tiếp theo.", score: 0 },
        { label: "Không công bố vì đó là bí mật kinh doanh", consequence: "Sự bất định trở thành chi phí vô hình mà mọi cửa hàng nhỏ phải gánh.", score: -1 },
      ] },
    ],
    endings: {
      positive: { title: "Một mạng lưới có nhiều cửa", text: "Tháp vẫn mạnh, nhưng quyền lực không còn chỉ chảy theo một chiều. Khi tiêu chuẩn, dữ liệu và quy tắc được giải thích, sự đổi mới có thêm chỗ để nảy mầm." },
      balanced: { title: "Cánh cổng hé mở", text: "Nền tảng đã ghi nhận một số tiếng nói, nhưng chưa hoàn toàn từ bỏ lợi thế của mình. Cân bằng giữa tiện ích chung và quyền lực riêng vẫn là một cuộc thương lượng đang tiếp diễn." },
      difficult: { title: "Ngọn tháp kín cổng", text: "Mọi con đường đều đi qua một cánh cổng, và người giữ cổng quyết định ai được nhìn thấy. Sự tiện lợi còn đó, nhưng lựa chọn của cộng đồng ngày càng nhỏ lại." },
    },
  },
  {
    name: "Quảng trường cân bằng",
    opening: "Chiều muộn, doanh nghiệp, người lao động và đại diện cộng đồng cùng ngồi quanh một chiếc bàn dài. Ai cũng mang theo những con số đúng của riêng mình.",
    context: "Lợi nhuận, thu nhập, an toàn và môi trường không tự động hài hòa. Cuộc gặp này là cơ hội để xem điều gì xảy ra khi các nhóm lợi ích được đặt trong cùng một cuộc đối thoại.",
    scenes: [
      { heading: "Ca làm kéo dài", text: "Đơn hàng tăng khiến quản lý đề nghị tăng ca liên tục trong ba tháng.", choices: [
        { label: "Thỏa thuận tăng ca tự nguyện kèm quỹ an toàn", consequence: "Chi phí tăng, nhưng người lao động có quyền chọn và có nguồn lực bảo vệ sức khỏe.", score: 1 },
        { label: "Chia ca linh hoạt với mức thưởng vừa phải", consequence: "Sản xuất được duy trì, dù thu nhập của từng người chưa tăng như kỳ vọng.", score: 0 },
        { label: "Áp chỉ tiêu bắt buộc để kịp hợp đồng", consequence: "Hợp đồng được cứu trong ngắn hạn, còn áp lực và rủi ro tích lại trong xưởng.", score: -1 },
      ] },
      { heading: "Dòng nước phía sau xưởng", text: "Cộng đồng phản ánh nguồn nước gần khu sản xuất có dấu hiệu thay đổi.", choices: [
        { label: "Công bố số liệu và đầu tư xử lý ngay", consequence: "Doanh nghiệp phải chi thêm, nhưng cộng đồng được tham gia giám sát điều ảnh hưởng đến mình.", score: 1 },
        { label: "Thuê kiểm định độc lập trước khi hành động", consequence: "Mọi bên có thêm bằng chứng; thời gian chờ đợi vẫn khiến người dân sốt ruột.", score: 0 },
        { label: "Phủ nhận vì chưa có kết luận chính thức", consequence: "Cuộc họp tan trong nghi ngờ, và chi phí niềm tin bắt đầu tăng lên.", score: -1 },
      ] },
      { heading: "Phần lợi nhuận cuối năm", text: "Kết quả kinh doanh tốt hơn dự kiến. Câu hỏi là lợi ích ấy sẽ được phân phối thế nào.", choices: [
        { label: "Chia thưởng, đào tạo và quỹ cộng đồng theo cam kết công khai", consequence: "Nhiều bên cùng thấy mình trong thành quả; nguồn lực quay lại nuôi năng lực lâu dài.", score: 1 },
        { label: "Tái đầu tư phần lớn và thưởng một khoản cố định", consequence: "Doanh nghiệp có vốn đi tiếp, dù cuộc đối thoại về phân phối vẫn cần mở.", score: 0 },
        { label: "Chỉ chia cho cổ đông để tối đa hóa lợi tức", consequence: "Một nhóm được lợi nhiều nhất, còn những người cùng tạo ra kết quả thấy mình đứng ngoài câu chuyện.", score: -1 },
      ] },
    ],
    endings: {
      positive: { title: "Quảng trường còn sáng đèn", text: "Không ai nhận được mọi thứ mình muốn, nhưng mọi người có một cơ chế để tiếp tục nói chuyện. Lợi ích riêng được đặt trong một luật chơi giúp thành quả đi xa hơn một mùa báo cáo." },
      balanced: { title: "Một thỏa thuận đang lớn lên", text: "Bàn đàm phán chưa giải quyết hết mâu thuẫn, song đã tạo ra vài cam kết để đo lường. Cân bằng không phải điểm đến, mà là việc quay lại bàn khi điều kiện thay đổi." },
      difficult: { title: "Những chiếc ghế trống", text: "Khi một phía liên tục bị bỏ lại, cuộc đối thoại không còn là đối thoại. Lợi nhuận có thể giữ nguyên trong sổ sách, nhưng cộng đồng và đội ngũ đang mất dần lý do để cùng đi tiếp." },
    },
  },
  {
    name: "Cảng mở ra thế giới",
    opening: "Một con tàu rời bến mang theo hàng hóa của xưởng nhỏ. Trên boong là cơ hội mở rộng, nhưng cũng có tỷ giá, tiêu chuẩn mới và những mắt xích ở rất xa.",
    context: "Hội nhập giúp thị trường rộng hơn, đồng thời làm chuỗi cung ứng dễ bị ảnh hưởng bởi những biến động bên ngoài. Người quản lý cảng phải chọn cách đi nhanh mà không đánh mất khả năng tự chủ.",
    scenes: [
      { heading: "Container bị giữ lại", text: "Cảng ở đầu bên kia thông báo chậm thông quan vì một quy định mới.", choices: [
        { label: "Kích hoạt nguồn cung dự phòng và thông báo sớm cho khách", consequence: "Chi phí tăng nhẹ, nhưng doanh nghiệp giữ được sự chủ động và uy tín.", score: 1 },
        { label: "Chờ thông quan rồi điều chỉnh lịch giao", consequence: "Bạn tránh được chi phí dự phòng, đổi lại khách hàng phải chờ lâu hơn.", score: 0 },
        { label: "Giấu thông tin để tránh hủy đơn", consequence: "Sự im lặng kéo dài đến khi khách tự phát hiện; niềm tin khó phục hồi hơn một lần giao trễ.", score: -1 },
      ] },
      { heading: "Tiêu chuẩn xanh", text: "Một thị trường mới yêu cầu truy xuất nguồn gốc và giảm phát thải trong toàn bộ chuỗi.", choices: [
        { label: "Đầu tư từng bước vào chuẩn xanh và đào tạo nhà cung ứng", consequence: "Bước đầu tốn kém, nhưng xưởng có thêm năng lực bước vào những thị trường dài hạn.", score: 1 },
        { label: "Chọn chứng nhận tối thiểu để thử thị trường", consequence: "Cánh cửa mở ra vừa đủ, dù lợi thế cạnh tranh bền vững vẫn chưa rõ ràng.", score: 0 },
        { label: "Bỏ qua vì chi phí hiện tại quá cao", consequence: "Xưởng tiết kiệm được trước mắt, nhưng các cánh cửa mới dần khép lại.", score: -1 },
      ] },
      { heading: "Gió đổi chiều", text: "Tỷ giá biến động mạnh trong lúc doanh nghiệp vừa ký hợp đồng xuất khẩu lớn.", choices: [
        { label: "Chia rủi ro bằng hợp đồng linh hoạt và nhiều thị trường", consequence: "Lợi nhuận không bùng nổ, nhưng một biến động không thể kéo cả xưởng chao đảo.", score: 1 },
        { label: "Giữ hợp đồng cũ và theo dõi từng tuần", consequence: "Bạn giữ được sự đơn giản, đồng thời chấp nhận một phần rủi ro thị trường.", score: 0 },
        { label: "Dồn toàn bộ nguồn lực vào đơn có lợi nhất lúc này", consequence: "Nếu gió thuận, kết quả rất lớn; nếu gió đổi, khoảng trống cũng lớn không kém.", score: -1 },
      ] },
    ],
    endings: {
      positive: { title: "Ra khơi với nhiều chiếc neo", text: "Xưởng bước ra thế giới mà không đánh đổi khả năng đứng vững ở nhà. Mỗi quan hệ mới đều đi cùng tiêu chuẩn, phương án dự phòng và năng lực nội tại." },
      balanced: { title: "Con tàu đang học cách đi xa", text: "Cơ hội xuất khẩu được giữ, dù vài rủi ro vẫn còn phơi ra trước gió. Những quyết định này tạo một hải đồ đầu tiên để xưởng chuẩn bị kỹ hơn cho chuyến sau." },
      difficult: { title: "Một chuyến đi lệch gió", text: "Xưởng đã chạy nhanh theo cơ hội, nhưng phụ thuộc vào quá ít đường đi. Khi một mắt xích trục trặc, bài học rõ nhất là hội nhập cần đi cùng năng lực chống chịu." },
    },
  },
];

export default function ExploreMap({ guideTarget = false }: { guideTarget?: boolean }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const [cursor, setCursor] = useState({ x: 50, y: 50 });
  const [sceneIndex, setSceneIndex] = useState(0);
  const [decisions, setDecisions] = useState<StoryChoice[]>([]);
  const [lastConsequence, setLastConsequence] = useState<string | null>(null);
  const [showEnding, setShowEnding] = useState(false);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", close); };
  }, [open]);

  const trackPointer = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setCursor({ x: ((event.clientX - rect.left) / rect.width) * 100, y: ((event.clientY - rect.top) / rect.height) * 100 });
  };
  const topic = explorationTopics[selected];
  const story = stories[selected];
  const currentScene = story.scenes[sceneIndex];
  const ending = useMemo(() => {
    const score = decisions.reduce((total, decision) => total + decision.score, 0);
    return story.endings[score >= 2 ? "positive" : score <= -1 ? "difficult" : "balanced"];
  }, [decisions, story]);
  const chooseStory = (index: number) => {
    setSelected(index);
    setSceneIndex(0);
    setDecisions([]);
    setLastConsequence(null);
    setShowEnding(false);
  };
  const chooseSceneChoice = (choice: StoryChoice) => {
    setDecisions((items) => [...items, choice]);
    setLastConsequence(choice.consequence);
  };
  const advanceScene = () => {
    if (sceneIndex === story.scenes.length - 1) setShowEnding(true);
    else { setSceneIndex((index) => index + 1); setLastConsequence(null); }
  };

  return <>
    <button className="explore-map-teaser" data-home-guide={guideTarget ? "map" : undefined} onClick={() => setOpen(true)} aria-label="Mở bản đồ khám phá Marxopoly">
      <span className="map-teaser-grid" />
      {mapPoints.map((point, index) => <i key={index} style={{ left: `${point.x}%`, top: `${point.y}%` }}><b>{index + 1}</b></i>)}
      <span className="map-teaser-copy"><b>◉ BẢN ĐỒ KHÁM PHÁ</b><small>Nhấn để đi qua 6 vùng</small></span>
    </button>

    {typeof document !== "undefined" && createPortal(<AnimatePresence>
      {open && <motion.div className="map-overlay" role="dialog" aria-modal="true" aria-labelledby="map-title" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)}>
        <motion.section className="explore-reader" initial={{ y: 30, scale: .98 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: .98 }} onClick={(event) => event.stopPropagation()}>
          <header className="explore-reader-head"><div><small>MARXOPOLY • KHÔNG GIAN KHÁM PHÁ</small><h2 id="map-title">Bản đồ dòng chảy thị trường</h2></div><button onClick={() => setOpen(false)} aria-label="Đóng bản đồ">×</button></header>
          <div className="explore-reader-body">
            <div className="explore-map-canvas" onMouseMove={trackPointer}>
              <div className="map-terrain map-terrain-a" /><div className="map-terrain map-terrain-b" /><div className="map-route route-a" /><div className="map-route route-b" />
              <span className="map-cursor" style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }} aria-hidden="true" />
              {explorationTopics.map((item, index) => <button key={item.slide} className={`map-point ${selected === index ? "active" : ""}`} style={{ left: `${mapPoints[index].x}%`, top: `${mapPoints[index].y}%` }} onClick={() => chooseStory(index)} aria-label={`Khám phá vùng ${index + 1}: ${stories[index].name}`}><i>{index + 1}</i><span>{stories[index].name}</span></button>)}
              <p className="map-instruction">Di chuyển chuột để thả dấu ghim • Chọn một điểm để mở câu chuyện</p>
            </div>
            <article className="map-detail" style={{ "--map-accent": ["#df3e32", "#2477bd", "#e7ad26", "#8a5eb2", "#178a77", "#d55f29"][selected] } as React.CSSProperties}>
              <div className="map-detail-top"><b>VÙNG 0{topic.slide}</b><span>Chuyện kể từ nền kinh tế</span></div>
              <h3>{story.name}</h3>
              <div className="story-progress" aria-label={`Tiến trình câu chuyện: ${sceneIndex + 1} trên ${story.scenes.length}`}><i style={{ width: `${showEnding ? 100 : ((sceneIndex + (lastConsequence ? 1 : 0)) / story.scenes.length) * 100}%` }} /></div>
              <section className="story-intro"><small>MỞ ĐẦU</small><p>{story.opening}</p></section>
              <section className="story-context"><small>BỐI CẢNH</small><p>{story.context}</p></section>
              {!showEnding && <section className="story-scene">
                <small>DIỄN BIẾN · CHẶNG {sceneIndex + 1}/{story.scenes.length}</small>
                <h4>{currentScene.heading}</h4><p>{currentScene.text}</p>
                {!lastConsequence ? <div className="story-choice-list"><small>BẠN SẼ LÀM GÌ?</small>{currentScene.choices.map((choice) => <button key={choice.label} onClick={() => chooseSceneChoice(choice)}>{choice.label}<span>→</span></button>)}</div> : <AnimatePresence mode="wait"><motion.div className="story-choice-response" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><b>HỆ QUẢ TỪ LỰA CHỌN</b><p>{lastConsequence}</p></motion.div></AnimatePresence>}
                {lastConsequence && <button className="story-action" onClick={advanceScene}>{sceneIndex === story.scenes.length - 1 ? "Xem kết thúc của bạn" : "Tiếp tục diễn biến"} <span>→</span></button>}
              </section>}
              {showEnding && <motion.section className="story-ending" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}><small>KẾT THÚC CỦA BẠN</small><h4>{ending.title}</h4><p>{ending.text}</p><button className="story-action" onClick={() => chooseStory(selected)}>Chơi lại câu chuyện <span>↻</span></button></motion.section>}
              {showEnding && <div className="story-actions"><button className="story-next" onClick={() => chooseStory((selected + 1) % stories.length)}>Khám phá vùng kế tiếp →</button></div>}
            </article>
          </div>
        </motion.section>
      </motion.div>}
    </AnimatePresence>, document.body)}
  </>;
}
