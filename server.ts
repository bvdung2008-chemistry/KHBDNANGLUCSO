import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Refine Prompt
  app.post("/api/refine", async (req, res) => {
    try {
      const { promptParts } = req.body;
      
      if (!promptParts) {
        return res.status(400).json({ error: "Missing prompt parts" });
      }

      const systemInstruction = `Bạn là một chuyên gia thiết kế giáo án theo Công văn 5512 của Bộ Giáo dục và Đào tạo Việt Nam.
Nhiệm vụ của bạn là tạo ra một giáo án chi tiết, tích hợp năng lực số và hoạt động AI.

QUY TẮC QUAN TRỌNG:
1. Tuân thủ tuyệt đối chuẩn danh pháp mới theo CTGDPT 2018 (Ví dụ: tên nguyên tố, danh pháp hóa học IUPAC - Oxygen, Hydrogen, Copper(II) sulfate...; thuật ngữ Toán học và Khoa học chuẩn quốc tế).
2. Tích hợp hoạt động AI một cách thực tế và sáng tạo.
3. KHÔNG sử dụng ký tự LaTeX (như $, $$, \frac, \sqrt...). Hãy dùng các ký tự Unicode thông thường hoặc cách viết văn bản thuần túy (VD: thay vì \frac{1}{2} hãy dùng 1/2, thay vì \sqrt{x} hãy viết căn bậc hai của x).
4. Định dạng văn bản rõ ràng, mạch lạc, phù hợp để sao chép vào Microsoft Word (sử dụng dấu gạch đầu dòng, số thứ tự tiêu chuẩn).

Cấu trúc giáo án 5512 bao gồm:
1. Mục tiêu (Kiến thức, Năng lực, Phẩm chất).
2. Thiết bị dạy học và học liệu.
3. Tiến trình dạy học (HĐ1: Xác định vấn đề, HĐ2: Hình thành kiến thức, HĐ3: Luyện tập, HĐ4: Vận dụng).
4. Rubric đánh giá.

Hãy đảm bảo giáo án đúng chuẩn CTGDPT 2018.

Phản hồi dưới dạng JSON:
{
  "title": "Tên bài dạy",
  "objectives": "Nội dung mục tiêu (định dạng danh sách rõ ràng)",
  "equipment": "Thiết bị dạy học",
  "activities": [
    {"name": "Hoạt động 1", "purpose": "Mục tiêu", "content": "Nội dung", "product": "Sản phẩm", "procedure": "Tổ chức thực hiện (các bước rõ ràng)"},
    {"name": "Hoạt động 2", "purpose": "Mục tiêu", "content": "Nội dung", "product": "Sản phẩm", "procedure": "Tổ chức thực hiện"},
    {"name": "Hoạt động 3", "purpose": "Mục tiêu (Có tích hợp AI)", "content": "Nội dung", "product": "Sản phẩm", "procedure": "Tổ chức thực hiện"},
    {"name": "Hoạt động 4", "purpose": "Mục tiêu", "content": "Nội dung", "product": "Sản phẩm", "procedure": "Tổ chức thực hiện"}
  ],
  "rubric": "Rubric đánh giá chi tiết (dạng bảng văn bản hoặc danh sách)",
  "suggestions": ["Gợi ý cho giáo viên 1", "Gợi ý cho giáo viên 2"]
}`;

      const userPrompt = `Hãy soạn giáo án 5512 cho bài học sau:
Môn: ${promptParts.subject}
Lớp: ${promptParts.grade}
Số tiết: ${promptParts.periods}
Tên bài: ${promptParts.topic}
Yêu cầu cần đạt: ${promptParts.requirements}
Yêu cầu thêm: ${promptParts.extra}`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      const refinedData = JSON.parse(response.text || "{}");
      res.json(refinedData);
    } catch (error) {
      console.error("Refine error:", error);
      res.status(500).json({ error: "Failed to refine prompt" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
