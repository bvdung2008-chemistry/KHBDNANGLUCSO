import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sparkles, FileText, Download, GraduationCap, Laptop, ClipboardCheck } from "lucide-react";
import { toast, Toaster } from "sonner";

interface LessonPlan {
  title: string;
  objectives: string;
  equipment: string;
  activities: {
    name: string;
    purpose: string;
    content: string;
    product: string;
    procedure: string;
  }[];
  rubric: string;
  suggestions: string[];
}

export default function App() {
  const [subject, setSubject] = useState("Tin học");
  const [grade, setGrade] = useState("11");
  const [periods, setPeriods] = useState("1");
  const [topic, setTopic] = useState("");
  const [requirements, setRequirements] = useState("");
  const [extra, setExtra] = useState("Tích hợp năng lực số và hoạt động AI");
  const [loading, setLoading] = useState(false);
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);

  const generatePlan = async () => {
    if (!topic) {
      toast.error("Vui lòng nhập tên bài dạy");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          promptParts: { subject, grade, periods, topic, requirements, extra }
        }),
      });

      if (!response.ok) throw new Error("Lỗi máy chủ");
      const data = await response.json();
      setLessonPlan(data);
      toast.success("Đã tạo giáo án thành công!");
    } catch (error) {
      console.error(error);
      toast.error("Không thể tạo giáo án. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!lessonPlan) return;
    const text = `GIÁO ÁN: ${lessonPlan.title.toUpperCase()}
(Chuẩn Công văn 5512 - Tích hợp năng lực số & AI)

I. MỤC TIÊU
${lessonPlan.objectives}

II. THIẾT BỊ DẠY HỌC VÀ HỌC LIỆU
${lessonPlan.equipment}

III. TIẾN TRÌNH DẠY HỌC
${lessonPlan.activities.map((a, i) => `
${i + 1}. ${a.name}
- Mục tiêu: ${a.purpose}
- Nội dung: ${a.content}
- Sản phẩm: ${a.product}
- Tổ chức thực hiện:
${a.procedure}`).join("\n")}

IV. KIỂM TRA, ĐÁNH GIÁ (RUBRIC)
${lessonPlan.rubric}

V. GỢI Ý SƯ PHẠM
${lessonPlan.suggestions.map(s => `- ${s}`).join("\n")}

--------------------------------------------------
Tạo bởi AI Soạn Giáo Án 5512 - Structured Prompt Education`;

    navigator.clipboard.writeText(text);
    toast.info("Đã sao chép nội dung giáo án định dạng Word");
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <Toaster position="top-center" />
      
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <GraduationCap className="h-10 w-10 text-blue-600" />
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
              AI Soạn Giáo Án <span className="text-blue-600">5512</span>
            </h1>
          </div>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Hỗ trợ giáo viên Việt Nam soạn thảo bài giảng chuẩn Công văn 5512, tích hợp năng lực số và AI.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Input Panel */}
          <aside className="lg:col-span-4 space-y-6">
            <Card className="shadow-xl border-t-4 border-t-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Sparkles className="mr-2 h-5 w-5 text-yellow-500" />
                  Cấu hình bài dạy
                </CardTitle>
                <CardDescription>Nhập thông tin cơ bản về bài học</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Môn học</Label>
                    <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="VD: Tin học" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="grade">Lớp</Label>
                    <Input id="grade" value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="VD: 11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="periods">Số tiết</Label>
                    <Input id="periods" value={periods} onChange={(e) => setPeriods(e.target.value)} placeholder="VD: 2" />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="topic">Tên bài dạy</Label>
                  <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Nhập tên bài học..." className="font-medium" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requirements">Yêu cầu cần đạt</Label>
                  <Textarea 
                    id="requirements" 
                    value={requirements} 
                    onChange={(e) => setRequirements(e.target.value)} 
                    placeholder="VD: Nhận biết được..., Giải thích được... (Theo CTGDPT 2018)"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extra">Yêu cầu bổ sung</Label>
                  <Textarea 
                    id="extra" 
                    value={extra} 
                    onChange={(e) => setExtra(e.target.value)} 
                    placeholder="VD: Tích hợp Canva, Scratch hoặc AI..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg shadow-lg" 
                  onClick={generatePlan}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center"><Sparkles className="mr-2 h-5 w-5 animate-spin" /> Đang soạn...</span>
                  ) : (
                    <span className="flex items-center"><Sparkles className="mr-2 h-5 w-5" /> Soạn giáo án ngay</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Result Panel */}
          <main className="lg:col-span-8">
            {lessonPlan ? (
              <Card className="shadow-2xl h-full border-0 overflow-hidden">
                <div className="bg-slate-900 p-4 flex justify-between items-center text-white">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-5 w-5 text-blue-400" />
                    <span className="font-semibold">{lessonPlan.title}</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={copyToClipboard} className="text-white hover:bg-slate-800">
                      <Download className="mr-2 h-4 w-4" /> Sao chép
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="muc-tieu" className="w-full">
                  <TabsList className="w-full justify-start rounded-none bg-slate-100 border-b overflow-x-auto">
                    <TabsTrigger value="muc-tieu" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600">Mục tiêu</TabsTrigger>
                    <TabsTrigger value="thiet-bi" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600">Thiết bị</TabsTrigger>
                    <TabsTrigger value="tien-trinh" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600">Tiến trình</TabsTrigger>
                    <TabsTrigger value="rubric" className="data-[state=active]:bg-white rounded-none border-b-2 data-[state=active]:border-blue-600">Đánh giá</TabsTrigger>
                  </TabsList>

                  <ScrollArea className="h-[600px] bg-white">
                    <TabsContent value="muc-tieu" className="p-6 m-0">
                      <div className="prose prose-slate max-w-none">
                        <div className="flex items-center mb-4">
                          <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
                          <h3 className="text-xl font-bold m-0">Mục tiêu bài dạy</h3>
                        </div>
                        <div className="whitespace-pre-wrap text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-inner">
                          {lessonPlan.objectives}
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="thiet-bi" className="p-6 m-0">
                      <div className="flex items-center mb-4">
                        <Laptop className="h-6 w-6 text-blue-600 mr-2" />
                        <h3 className="text-xl font-bold m-0">Thiết bị dạy học & Học liệu</h3>
                      </div>
                      <div className="whitespace-pre-wrap text-slate-700 bg-slate-50 p-4 rounded-lg border border-slate-200">
                        {lessonPlan.equipment}
                      </div>
                    </TabsContent>

                    <TabsContent value="tien-trinh" className="p-6 m-0">
                      <div className="space-y-6">
                        {lessonPlan.activities.map((act, idx) => (
                          <div key={idx} className="relative pl-8 border-l-2 border-blue-200 pb-4 last:pb-0">
                            <div className="absolute left-[-9px] top-0 h-4 w-4 rounded-full bg-blue-600" />
                            <h4 className="text-lg font-bold text-blue-700 mb-2">{act.name}</h4>
                            <div className="grid gap-3 text-sm">
                              <div className="bg-white p-3 rounded border shadow-sm">
                                <span className="font-bold block mb-1 text-slate-500 uppercase text-[10px]">Mục tiêu</span>
                                {act.purpose}
                              </div>
                              <div className="bg-blue-50 p-3 rounded border border-blue-100 shadow-sm">
                                <span className="font-bold block mb-1 text-blue-600 uppercase text-[10px]">Nội dung & Sản phẩm</span>
                                <p><strong>ND:</strong> {act.content}</p>
                                <p className="mt-2 text-blue-800 font-medium italic">Sản phẩm: {act.product}</p>
                              </div>
                              <div className="bg-slate-50 p-3 rounded border shadow-sm">
                                <span className="font-bold block mb-1 text-slate-500 uppercase text-[10px]">Tổ chức thực hiện</span>
                                {act.procedure}
                              </div>
                            </div>
                            {idx < lessonPlan.activities.length - 1 && <Separator className="my-6" />}
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="rubric" className="p-6 m-0">
                      <div className="flex items-center mb-4">
                        <ClipboardCheck className="h-6 w-6 text-green-600 mr-2" />
                        <h3 className="text-xl font-bold m-0">Đánh giá kết quả học tập</h3>
                      </div>
                      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
                         <div className="p-4 whitespace-pre-wrap font-mono text-xs bg-slate-50 leading-relaxed text-slate-800">
                            {lessonPlan.rubric}
                         </div>
                      </div>
                      
                      {lessonPlan.suggestions.length > 0 && (
                        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-bold text-yellow-800 mb-2 flex items-center">
                            <Sparkles className="h-4 w-4 mr-2" /> Lời khuyên sư phạm
                          </h4>
                          <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
                            {lessonPlan.suggestions.map((s, i) => <li key={i}>{s}</li>)}
                          </ul>
                        </div>
                      )}
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </Card>
            ) : (
              <div className="h-[600px] flex flex-col items-center justify-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200 shadow-inner p-12 text-center">
                <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <FileText className="h-16 w-16 opacity-20" />
                </div>
                <h3 className="text-2xl font-bold text-slate-700 mb-2">Chưa có giáo án nào được soạn</h3>
                <p className="max-w-md">Nhập thông tin bài học ở bảng bên trái và nhấn "Soạn giáo án ngay" để bắt đầu quy trình hỗ trợ sư phạm thông minh.</p>
              </div>
            )}
          </main>
        </div>
      </div>
      
      <footer className="mt-12 text-center text-slate-400 text-sm">
        <p>© 2026 Structured Prompt Education - Made with AI Studio</p>
      </footer>
    </div>
  );
}
Response Schema
{
  "mucTieu": [],
  "thietBi": [],
  "tienTrinh": [],
  "danhGia": []
}