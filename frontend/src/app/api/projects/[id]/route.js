import { NextResponse } from 'next/server';

// Backend URL - services/api.js ile aynı port kullan
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    
    // Backend Express sunucusuna istek yap
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        // Auth token'ı frontend'den al ve backend'e ilet
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')
        })
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Proje bulunamadı' },
          { status: 404 }
        );
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Express response format'ını kontrol et
    const project = data.success ? data.data : data;
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Proje getirme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const updateData = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')
        })
      },
      body: JSON.stringify(updateData)
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Proje bulunamadı' },
          { status: 404 }
        );
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    const project = data.data || data;
    
    return NextResponse.json(project);
  } catch (error) {
    console.error('Proje güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    
    const response = await fetch(`${BACKEND_URL}/api/projects/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')
        })
      }
    });
    
    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Proje bulunamadı' },
          { status: 404 }
        );
      }
      throw new Error(`HTTP ${response.status}`);
    }
    
    return NextResponse.json({ message: 'Proje başarıyla silindi' });
  } catch (error) {
    console.error('Proje silme hatası:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}