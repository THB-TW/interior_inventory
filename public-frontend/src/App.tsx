import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import axios from 'axios';
import { Building2, MapPin, Phone, User, FileText, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';

const formSchema = z.object({
  clientName: z.string().min(1, '請填寫真實姓名，方便我們聯繫您'),
  clientPhone: z.string().regex(/^09\d{8}$/, '手機號碼格式錯誤 (例：0912345678)'),
  city: z.string().min(1, '請選擇縣市'),
  district: z.string().min(1, '請填寫行政區'),
  siteAddress: z.string().min(5, '請輸入詳細的施作地址'),
  description: z.string().min(10, '為了作更精確地評估，請至少輸入 10 個字的預期需求'),
});

type FormValues = z.infer<typeof formSchema>;

const CITIES = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市', '新竹縣', '苗栗縣', '彰化縣',
  '南投縣', '雲林縣', '嘉義縣', '屏東縣', '宜蘭縣', '花蓮縣', '台東縣'
];

export default function App() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { city: '台北市' }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setApiError(null);
      // 自動補上我們指定的固定參數
      const payload = {
        ...data,
        salesUserId: 1, // 固定交由老闆負責
      };
      await axios.post('/api/projects', payload);
      setIsSuccess(true);
    } catch (error: any) {
      setApiError(error.response?.data?.message || '伺服器發生異常，請稍後再試。若情況持續，請來電 0916339002 洽詢。');
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[var(--color-secondary)] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-100 flex flex-col items-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">預約成功</h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            我們已經收到您的場勘需求，浩睿室內裝潢專員將會在 <span className="font-semibold text-[var(--color-primary)]">24 小時內</span> 與您聯繫，並預約進一步的現場丈量時間。期待能為您服務！
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-[var(--color-primary-dark)] hover:text-black font-medium transition-colors"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-secondary)] text-[var(--color-accent)] font-sans antialiased">
      {/* Hero Section */}
      <header className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 text-center bg-gradient-to-b from-[#f2ece6] to-[var(--color-secondary)]">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#e7e1dc] text-sm text-[var(--color-primary-dark)] mb-6 shadow-sm">
            <Building2 size={14} className="text-[#a59b92]" />
            浩睿室內裝潢 HAORUI INTERIOR
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 mb-4 font-serif">
            讓您的空間煥然一新
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            從初步構想到完工點交，我們提供最令人安心的設計與施工品質。請告訴我們您的裝修計畫，我們將盡快與您聯繫。
          </p>
        </div>
      </header>

      {/* Main Form Section */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pb-24 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/40 p-6 sm:p-8 border border-slate-100">
          
          {apiError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 text-sm rounded-lg border border-red-100">
              {apiError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 區塊 1: 聯絡資訊 */}
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <User size={18} className="text-[var(--color-primary)]" />
                基本資料
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  真實姓名 <span className="text-red-500">*</span>
                  <input
                    type="text"
                    placeholder="例如: 王小明"
                    {...register('clientName')}
                    className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-colors outline-none"
                  />
                  {errors.clientName && <p className="mt-1 text-sm text-red-500">{errors.clientName.message}</p>}
                </label>
                
                <label className="block text-sm font-medium text-slate-700">
                  聯絡電話 <span className="text-red-500">*</span>
                  <input
                    type="tel"
                    placeholder="09xxxxxxxx"
                    {...register('clientPhone')}
                    className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-colors outline-none"
                  />
                  {errors.clientPhone && <p className="mt-1 text-sm text-red-500">{errors.clientPhone.message}</p>}
                </label>
              </div>
            </div>

            {/* 區塊 2: 案場資訊 */}
            <div className="space-y-4 pt-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <MapPin size={18} className="text-[var(--color-primary)]" />
                案場位置
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  所在縣市 <span className="text-red-500">*</span>
                  <select
                    {...register('city')}
                    className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-colors outline-none appearance-none"
                  >
                    {CITIES.map(city => <option key={city} value={city}>{city}</option>)}
                  </select>
                  {errors.city && <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>}
                </label>

                <label className="block text-sm font-medium text-slate-700">
                  鄉鎮市區 <span className="text-red-500">*</span>
                  <input
                    type="text"
                    placeholder="例如: 信義區"
                    {...register('district')}
                    className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-colors outline-none"
                  />
                  {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district.message}</p>}
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                詳細地址 <span className="text-red-500">*</span>
                <input
                  type="text"
                  placeholder="例如: 信義路二段 120 號 5 樓"
                  {...register('siteAddress')}
                  className="mt-1 block w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-colors outline-none"
                />
                {errors.siteAddress && <p className="mt-1 text-sm text-red-500">{errors.siteAddress.message}</p>}
              </label>
            </div>

            {/* 區塊 3: 需求描述 */}
            <div className="space-y-4 pt-4">
              <h3 className="text-base font-semibold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText size={18} className="text-[var(--color-primary)]" />
                需求說明
              </h3>

              <label className="block text-sm font-medium text-slate-700">
                您期望的工程或設計內容 <span className="text-red-500">*</span>
                <textarea
                  rows={5}
                  placeholder="請簡單描述目前的現場狀況、期望的風格、或是想要解決的問題..."
                  {...register('description')}
                  className="mt-1 block w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-[var(--color-primary-dark)] focus:ring-1 focus:ring-[var(--color-primary-dark)] transition-colors outline-none resize-none leading-relaxed"
                />
                {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>}
              </label>
            </div>

            {/* 送出按鈕 */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-slate-800 hover:bg-black text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-md disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    正在傳送您的預約資料...
                  </>
                ) : (
                  <>
                    免費預約場勘
                    <ChevronRight size={18} />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-4 mb-2">
          <span className="flex items-center gap-1.5"><Building2 size={16} />浩睿室內裝潢</span>
          <span>|</span>
          <span className="flex items-center gap-1.5"><Phone size={16} />0916-339-002</span>
        </div>
        <p>© {new Date().getFullYear()} HAORUI INTERIOR. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
