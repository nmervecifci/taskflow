import { NextResponse } from "next/server";

// Backend URL - services/api.js ile aynı port kullan
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

// Status çevirisi fonksiyonu
const translateStatus = (status) => {
  const statusMap = {
    pending: "Bekleyen",
    "in-progress": "Devam Eden",
    completed: "Tamamlanan",
  };
  return statusMap[status] || status;
};

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    // Backend Express sunucusuna istek yap
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}/tasks`, {
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization"),
        }),
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    // Express response format'ını kontrol et
    const tasks = data.success ? data.data : data;

    // Status'ları Türkçe'ye çevir
    const translatedTasks = Array.isArray(tasks)
      ? tasks.map((task) => ({
          ...task,
          status: translateStatus(task.status),
        }))
      : [];

    return NextResponse.json(translatedTasks);
  } catch (error) {
    console.error("Görevler getirme hatası:", error);
    return NextResponse.json([], { status: 200 }); // Boş array döndür
  }
}

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const taskData = await request.json();

    // Status'u İngilizce'ye çevir
    if (taskData.status) {
      taskData.status = reverseTranslateStatus(taskData.status);
    }

    const response = await fetch(`${BACKEND_URL}/api/projects/${id}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(request.headers.get("authorization") && {
          Authorization: request.headers.get("authorization"),
        }),
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const task = data.data || data;

    // Response'da status'u Türkçe'ye çevir
    const responseTask = {
      ...task,
      status: translateStatus(task.status),
    };

    return NextResponse.json(responseTask, { status: 201 });
  } catch (error) {
    console.error("Görev oluşturma hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
