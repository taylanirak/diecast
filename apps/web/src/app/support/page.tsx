'use client';

export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Yardım Merkezi</h1>
        <div className="bg-white rounded-xl shadow-sm p-8">
          <p className="text-gray-600 mb-4">
            Yardım merkezi sayfası yakında eklenecektir.
          </p>
          <p className="text-gray-600">
            Sorularınız için lütfen <a href="/contact" className="text-primary-500 hover:underline">iletişim</a> sayfasını kullanın.
          </p>
        </div>
      </main>
    </div>
  );
}
