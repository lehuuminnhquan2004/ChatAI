const express = require("express");
const router = express.Router();
const pool = require("../config/db");

// Get all teachers
router.get("/", async (req, res) => {
  try {
    console.log("Đang lấy thông tin giảng viên...");
    const [rows] = await pool.query("SELECT * FROM giangvien");
    console.log("Kết quả truy vấn:", rows);
    res.json(rows);
  } catch (error) {
    console.error("Error fetching teachers:", error);
    res.status(500).json({ message: "Lỗi khi lấy thông tin giảng viên" });
  }
});

// Add new teacher
router.post("/", async (req, res) => {
  const { magv, tengv, sdt, email, zalo } = req.body;
  try {
    await db.query(
      "INSERT INTO giangvien (magv, tengv, sdt, email, zalo) VALUES (?, ?, ?, ?, ?)",
      [magv, tengv, sdt, email, zalo]
    );
    res.status(201).json({ message: "Thêm giảng viên thành công" });
  } catch (error) {
    console.error("Error adding teacher:", error);
    res.status(500).json({ message: "Lỗi khi thêm giảng viên" });
  }
});

// Update teacher
router.put("/:magv", async (req, res) => {
  const { magv } = req.params;
  const { tengv, sdt, email, zalo } = req.body;
  try {
    await db.query(
      "UPDATE giangvien SET tengv = ?, sdt = ?, email = ?, zalo = ? WHERE magv = ?",
      [tengv, sdt, email, zalo, magv]
    );
    res.json({ message: "Cập nhật thông tin giảng viên thành công" });
  } catch (error) {
    console.error("Error updating teacher:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật thông tin giảng viên" });
  }
});

// Delete teacher
router.delete("/:magv", async (req, res) => {
  const { magv } = req.params;
  try {
    await db.query("DELETE FROM giangvien WHERE magv = ?", [magv]);
    res.json({ message: "Xóa giảng viên thành công" });
  } catch (error) {
    console.error("Error deleting teacher:", error);
    res.status(500).json({ message: "Lỗi khi xóa giảng viên" });
  }
});

module.exports = router;
