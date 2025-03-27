-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th3 27, 2025 lúc 03:20 PM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `chatbox`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `admin`
--

CREATE TABLE `admin` (
  `STT` int(10) NOT NULL,
  `masv` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `admin`
--

INSERT INTO `admin` (`STT`, `masv`) VALUES
(2, 'DH52201286');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `giangvien`
--

CREATE TABLE `giangvien` (
  `magv` varchar(50) NOT NULL,
  `tengv` varchar(50) NOT NULL,
  `sdt` varchar(10) NOT NULL,
  `email` varchar(50) NOT NULL,
  `zalo` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `giangvien`
--

INSERT INTO `giangvien` (`magv`, `tengv`, `sdt`, `email`, `zalo`) VALUES
('GV01', 'Viễn Anh Tho', '0283748228', 'vienanhtho@gmail.com', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichhoc`
--

CREATE TABLE `lichhoc` (
  `STT` int(11) NOT NULL,
  `Thu` int(8) NOT NULL,
  `Ca` int(4) NOT NULL,
  `phong` varchar(10) NOT NULL,
  `masv` varchar(50) NOT NULL,
  `mamh` varchar(50) NOT NULL,
  `magv` varchar(50) NOT NULL,
  `ngaybatdau` date NOT NULL,
  `ngayketthuc` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lichhoc`
--

INSERT INTO `lichhoc` (`STT`, `Thu`, `Ca`, `phong`, `masv`, `mamh`, `magv`, `ngaybatdau`, `ngayketthuc`) VALUES
(1, 4, 3, '803', 'DH52201286', '001', 'GV01', '2025-03-18', '2025-04-18'),
(3, 6, 1, '807', 'DH52201286', '003', 'GV01', '2025-03-18', '2025-04-18'),
(4, 2, 1, '607', 'DH52201105', '001', 'GV01', '2025-03-18', '2025-04-18'),
(5, 3, 3, '707', 'DH52201105', '002', 'GV01', '2025-03-18', '2025-04-18'),
(6, 6, 4, '807', 'DH52201105', '003', 'GV01', '2025-03-18', '2025-04-18'),
(7, 7, 1, '808', 'DH52201286', '004', 'GV01', '2025-02-18', '2025-04-18'),
(8, 7, 1, '808', 'DH52201105', '004', 'GV01', '2025-02-18', '2025-04-18'),
(9, 7, 2, '808', 'DH52201105', '005', 'GV01', '2025-02-18', '2025-04-18');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `lichsuchat`
--

CREATE TABLE `lichsuchat` (
  `id` int(11) NOT NULL,
  `masv` varchar(50) NOT NULL,
  `nguoidung_chat` text NOT NULL,
  `ai_rep` text NOT NULL,
  `thoigianchat` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `lichsuchat`
--

INSERT INTO `lichsuchat` (`id`, `masv`, `nguoidung_chat`, `ai_rep`, `thoigianchat`) VALUES
(91, 'DH52201105', 'xin chào', 'Chào Yến Ngọc.\n', '2025-03-21 13:33:28'),
(92, 'DH52201105', 'thời khoá biểu của tôi như thế nào', 'Chào Yến Ngọc, thứ 6 này bạn có môn CSS của thầy Viễn Anh Tho lúc 15h tại phòng 807 nhé.\n', '2025-03-21 13:33:44'),
(93, 'DH52201105', 'hãy nói chi tiết thời khóa biểu của tôi', 'Chào Yến Ngọc,\n\nThứ 2, ca 1 (7h30 - 9h): HTML, thầy Quan Le Huu Minh, phòng 607.\nThứ 3, ca 3 (12h30 - 15h): JavaScript, thầy QuanDepTrai, phòng 707.\nThứ 6, ca 4 (15h - 17h30): CSS, thầy Viễn Anh Tho, phòng 807.\n', '2025-03-21 13:34:02'),
(94, 'DH52201105', 'Xin chào.', 'Chào Yến Ngọc.\n', '2025-03-21 13:46:20'),
(95, 'DH52201105', 'Bây giờ tôi còn kịp đi học không?', 'Chào Yến Ngọc, bây giờ là 13:46 thứ Sáu ngày 21 tháng 3, bạn còn kịp giờ học CSS của thầy Viễn Anh Tho lúc 15h tại phòng 807 nhé.\n', '2025-03-21 13:46:41'),
(96, 'DH52201105', 'Cảm ơn bạn.', 'Chào Yến Ngọc, không có gì. Chúc bạn học tốt môn CSS!\n', '2025-03-21 14:08:06'),
(97, 'DH52201105', 'Xin chào bạn.', 'Chào Yến Ngọc.\n', '2025-03-21 14:15:15'),
(98, 'DH52201105', 'Tôi buồn quá, bạn có thể tâm sự với tôi không?', 'Chào Yến Ngọc, tôi hiểu mà. Chuyện gì làm bạn buồn vậy?\n', '2025-03-21 14:16:32'),
(99, 'DH52201105', 'Tại sao bạn đọc lại bị thiếu chứ đầu tiên vậy?', 'Chào Yến Ngọc, tôi vẫn luôn ở đây lắng nghe bạn mà. Thiếu sót ở đâu, bạn cứ nói nhé.\n', '2025-03-21 14:16:52'),
(100, 'DH52201105', 'Ok bạn.', 'Chào Yến Ngọc, có gì cứ chia sẻ với tôi nhé.\n', '2025-03-21 14:17:07'),
(101, 'DH52201105', 'bạn là ai thuộc công ty nào', 'Chào Yến Ngọc, tôi là trợ lý ảo của trường, luôn sẵn sàng hỗ trợ bạn.\n', '2025-03-21 14:19:43'),
(102, 'DH52201105', 'Xin chào.', 'Chào Yến Ngọc.\n', '2025-03-21 14:54:46'),
(103, 'DH52201286', 'Xin chào.', 'Chào Quân, có gì cần hỗ trợ không?\n', '2025-03-21 23:26:15'),
(104, 'DH52201105', 'Xin chào bạn.', 'Chào Yến Ngọc.\n', '2025-03-21 23:52:33'),
(105, 'DH52201105', 'Hôm nay tôi có muốn gì không?', 'Chào Yến Ngọc, hôm nay bạn có môn CSS lúc 15h tại phòng 807 nhé.\n', '2025-03-21 23:52:45'),
(106, 'DH52201286', 'xin chào bạn mấy giờ rồi', 'Chào Quân, hiện tại là 23:59.\n', '2025-03-21 23:59:59'),
(107, 'DH52201105', 'xin chào bạn tôi tên gì bạn nhỉ', 'Chào Yến Ngọc.\n', '2025-03-22 01:46:33'),
(108, 'DH52201286', 'hello', 'Chào Quân, cần gì nữa không?\n', '2025-03-23 15:29:02'),
(109, 'DH52201105', 'hôm nay là thứ mấy', 'Chào Yến Ngọc, hôm nay là Chủ Nhật.\n', '2025-03-23 17:33:14'),
(110, 'DH52201286', 'xin chào bạn', 'Chào Quân, có gì cần mình giúp không?\n', '2025-03-27 21:13:43');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `monhoc`
--

CREATE TABLE `monhoc` (
  `mamh` varchar(50) NOT NULL,
  `tenmh` varchar(50) NOT NULL,
  `sotc` int(10) NOT NULL,
  `tailieu` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `monhoc`
--

INSERT INTO `monhoc` (`mamh`, `tenmh`, `sotc`, `tailieu`) VALUES
('001', 'HTML', 0, 'Quan Le Huu Minh'),
('002', 'JavaScript', 0, 'QuanDepTrai'),
('003', 'CSS', 0, 'Viễn Anh Tho'),
('004', 'Công Nghệ Phần Mềm', 0, 'Hiệu'),
('005', 'Nhập môn web và ứng dụng', 0, 'Thầy Nghĩa'),
('006', 'Cơ sở dữ liệu', 2, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `nhachen`
--

CREATE TABLE `nhachen` (
  `STT` int(11) NOT NULL,
  `mask` varchar(50) NOT NULL,
  `masv` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sinhvien`
--

CREATE TABLE `sinhvien` (
  `masv` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `tensv` varchar(50) NOT NULL,
  `ngaysinh` date NOT NULL,
  `gioitinh` varchar(10) NOT NULL,
  `lop` varchar(10) NOT NULL,
  `chuyennganh` varchar(50) NOT NULL,
  `sdt` varchar(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `hinhanh` varchar(255) DEFAULT NULL,
  `ctxh` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sinhvien`
--

INSERT INTO `sinhvien` (`masv`, `password`, `tensv`, `ngaysinh`, `gioitinh`, `lop`, `chuyennganh`, `sdt`, `email`, `hinhanh`, `ctxh`) VALUES
('DH52201105', 'yenngoc0102', 'Đinh Dương Yến Ngọc', '2004-02-01', 'Nu', 'D22_TH15', 'CNTT', '0328421191', 'dinhduongyenngoc@gmail.com', 'undefined_1742666729663.jpg', 0),
('DH52201200', 'DH52201200', 'Nguyễn Văn C', '2025-03-13', 'Nam', 'D22_TH13', 'QTKD', '0372482218', 'lehuuminhquan@gmail.com', NULL, 0),
('DH52201209', '123456789', 'Nguyễn Văn B', '2025-03-21', 'nu', 'D22_TH14', 'QTKD', '453628823', 'voanhthien@gmail.com', NULL, 0),
('DH52201286', 'quanle2004', 'Lê Hữu Minh Quân', '2004-04-26', 'Nam', 'D22_TH15', 'CNTT', '328421191', 'lehuuminhquan2004@gmail.com', 'undefined_1742736081560.jpg', 0),
('DH52201287', 'quanle2004', 'Viễn Anh Tho', '2004-03-12', 'nu', 'D22_TH14', 'QTKD', '372482218', 'voanhthien@gmail.com', NULL, 0),
('DH52201288', 'quanle2004', 'Viễn Anh Thôn', '2003-02-11', 'nu', 'D22_TH15', 'CNTT', '372482218', 'voanht2222hien@gmail.com', NULL, 0),
('DH52201289', 'helloword', 'Nguyễn Văn A', '2004-01-08', 'nu', 'D22_TH15', 'CNTT', '453628823', 'voanhthien@gmail.com', NULL, 0);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `sukien`
--

CREATE TABLE `sukien` (
  `mask` varchar(50) NOT NULL,
  `tensk` varchar(50) NOT NULL,
  `noidung` varchar(255) NOT NULL,
  `hinhanh` varchar(50) DEFAULT NULL,
  `thoigianbatdau` datetime NOT NULL,
  `thoigianketthuc` datetime NOT NULL,
  `ctxh` double NOT NULL CHECK (`ctxh` >= 0),
  `drl` int(11) DEFAULT NULL CHECK (`drl` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `sukien`
--

INSERT INTO `sukien` (`mask`, `tensk`, `noidung`, `hinhanh`, `thoigianbatdau`, `thoigianketthuc`, `ctxh`, `drl`) VALUES
('DVS01', 'Dọn vệ sinh', 'dọn rác sân trường', '', '2025-03-27 13:01:00', '2025-03-28 13:01:00', 1, 0),
('SK001', 'Hiến máu nhân đạo', 'Chương trình hiến máu nhân đạo tại trường', 'hienmau.jpg', '2025-04-01 08:00:00', '2025-04-01 16:00:00', 8, 10),
('SK002', 'Dọn vệ sinh môi trường', 'Dọn dẹp, làm sạch khuôn viên trường', 'vesinh.jpg', '2025-04-15 07:30:00', '2025-04-15 11:30:00', 4, 5),
('SK003', 'Workshop Kỹ năng mềm', 'Hội thảo về kỹ năng giao tiếp và làm việc nhóm', 'workshop.jpg', '2025-04-20 13:30:00', '2025-04-20 16:30:00', 3, 5),
('SK004', 'Ngày hội việc làm', 'Kết nối doanh nghiệp và sinh viên', 'job.jpg', '2025-05-01 08:00:00', '2025-05-01 17:00:00', 8, 10),
('SK005', 'Giải bóng đá sinh viên', 'Giải bóng đá giao hữu giữa các khoa', 'football.jpg', '2025-05-10 07:00:00', '2025-05-10 17:00:00', 8, 10);

-- Cấu trúc bảng đăng ký sự kiện 'dangky_sukien'
CREATE TABLE `dangky_sukien` (
  `mask` varchar(50) NOT NULL,
  `masv` varchar(50) NOT NULL,
  `ngaydangky` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Đang đổ dữ liệu cho bảng `dangky_sukien`
INSERT INTO `dangky_sukien` (`mask`, `masv`, `ngaydangky`) VALUES
('DVS01', 'DH52201105', '2025-03-27 13:01:00'),
('SK001', 'DH52201105', '2025-03-27 13:01:00'),
('SK002', 'DH52201105', '2025-03-27 13:01:00'),
('SK003', 'DH52201105', '2025-03-27 13:01:00'),

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`STT`);

--
-- Chỉ mục cho bảng `giangvien`
--
ALTER TABLE `giangvien`
  ADD PRIMARY KEY (`magv`);

--
-- Chỉ mục cho bảng `lichhoc`
--
ALTER TABLE `lichhoc`
  ADD PRIMARY KEY (`STT`),
  ADD KEY `fk_sinhvien` (`masv`),
  ADD KEY `fk_monhoc` (`mamh`),
  ADD KEY `fk_giangvien` (`magv`);

--
-- Chỉ mục cho bảng `lichsuchat`
--
ALTER TABLE `lichsuchat`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_sinhvien_lichsuchat` (`masv`);

--
-- Chỉ mục cho bảng `monhoc`
--
ALTER TABLE `monhoc`
  ADD PRIMARY KEY (`mamh`);

--
-- Chỉ mục cho bảng `nhachen`
--
ALTER TABLE `nhachen`
  ADD PRIMARY KEY (`STT`),
  ADD KEY `fk_nhachen_sinhvien` (`masv`),
  ADD KEY `fk_sukien` (`mask`);

--
-- Chỉ mục cho bảng `sinhvien`
--
ALTER TABLE `sinhvien`
  ADD PRIMARY KEY (`masv`);

--
-- Chỉ mục cho bảng `sukien`
--
ALTER TABLE `sukien`
  ADD PRIMARY KEY (`mask`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `admin`
--
ALTER TABLE `admin`
  MODIFY `STT` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT cho bảng `lichhoc`
--
ALTER TABLE `lichhoc`
  MODIFY `STT` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT cho bảng `lichsuchat`
--
ALTER TABLE `lichsuchat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT cho bảng `nhachen`
--
ALTER TABLE `nhachen`
  MODIFY `STT` int(11) NOT NULL AUTO_INCREMENT;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `lichhoc`
--
ALTER TABLE `lichhoc`
  ADD CONSTRAINT `fk_giangvien` FOREIGN KEY (`magv`) REFERENCES `giangvien` (`magv`),
  ADD CONSTRAINT `fk_monhoc` FOREIGN KEY (`mamh`) REFERENCES `monhoc` (`mamh`),
  ADD CONSTRAINT `fk_sinhvien` FOREIGN KEY (`masv`) REFERENCES `sinhvien` (`masv`);

--
-- Các ràng buộc cho bảng `lichsuchat`
--
ALTER TABLE `lichsuchat`
  ADD CONSTRAINT `fk_sinhvien_lichsuchat` FOREIGN KEY (`masv`) REFERENCES `sinhvien` (`masv`);

--
-- Các ràng buộc cho bảng `nhachen`
--
ALTER TABLE `nhachen`
  ADD CONSTRAINT `fk_nhachen_sinhvien` FOREIGN KEY (`masv`) REFERENCES `sinhvien` (`masv`),
  ADD CONSTRAINT `fk_sukien` FOREIGN KEY (`mask`) REFERENCES `sukien` (`mask`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
