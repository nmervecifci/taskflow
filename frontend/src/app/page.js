import {
  CheckCircle,
  Users,
  Calendar,
  BarChart3,
  ArrowRight,
  Star,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  const features = [
    {
      icon: <CheckCircle className="h-6 w-6 text-blue-600" />,
      title: "Görev Yönetimi",
      description: "Görevlerinizi organize edin, öncelik verin ve takip edin",
    },
    {
      icon: <Users className="h-6 w-6 text-blue-600" />,
      title: "Takım İşbirliği",
      description: "Takım üyelerinizle gerçek zamanlı işbirliği yapın",
    },
    {
      icon: <Calendar className="h-6 w-6 text-blue-600" />,
      title: "Zaman Planlaması",
      description: "Projelerinizi zamanında tamamlayın",
    },
    {
      icon: <BarChart3 className="h-6 w-6 text-blue-600" />,
      title: "İlerleme Takibi",
      description: "Projenizin ilerlemesini görsel grafiklerle takip edin",
    },
  ];

  const stats = [
    { number: "10K+", label: "Aktif Kullanıcı" },
    { number: "50K+", label: "Tamamlanan Proje" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Destek" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
            </div>

            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Ücretsiz Dene
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Star className="h-4 w-4 mr-2" />
            Türkiyenin #1 Proje Yönetim Platformu
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Projelerinizi <span className="text-blue-600">Kolayca</span> Yönetin
          </h1>

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            TaskFlow ile takımınızla birlikte çalışın, görevleri organize edin
            ve projelerinizi zamanında tamamlayın. Trello tarzı sürükle-bırak
            arayüzü ile iş akışınızı optimize edin.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-lg inline-flex items-center"
            >
              Ücretsiz Başla
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-colors font-semibold text-lg"
            >
              Giriş Yap
            </Link>
          </div>

          <p className="text-sm text-gray-500 mt-4">
            Kredi kartı gerekmez • 14 gün ücretsiz deneme
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Neden TaskFlow?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Modern takımların ihtiyaç duyduğu tüm özellikler tek platformda
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="bg-blue-50 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Haydi, İlk Projenizi Oluşturun!
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Binlerce takım TaskFlowu kullanarak projelerini başarıyla
              tamamlıyor. Siz de aramıza katılın!
            </p>
            <Link
              href="/register"
              className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition-colors font-semibold text-lg shadow-lg inline-flex items-center"
            >
              <Shield className="mr-2 h-5 w-5" />
              Güvenli Şekilde Başla
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <Zap className="h-6 w-6" />
              </div>
              <span className="text-xl font-bold">TaskFlow</span>
            </div>

            <div className="flex space-x-6">
              <Link
                href="/login"
                className="hover:text-blue-400 transition-colors"
              >
                Giriş Yap
              </Link>
              <Link
                href="/register"
                className="hover:text-blue-400 transition-colors"
              >
                Kayıt Ol
              </Link>
              <a href="#" className="hover:text-blue-400 transition-colors">
                İletişim
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 TaskFlow. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
