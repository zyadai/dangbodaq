import React, { useState, useCallback, useRef } from 'react';
import { transcribeMedia } from './services/geminiService';
import { Language, TranscriptionMode, AppState, TranscriptionResult } from './types';
import LanguageSelector from './components/LanguageSelector';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>({
    file: null,
    status: 'idle',
    error: null,
    result: null,
    targetLanguage: Language.MIXED,
    mode: TranscriptionMode.BOOK,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2000 * 1024 * 1024) { 
        setState(prev => ({ ...prev, error: 'فایلەکە زۆر گەورەیە. تکایە فایلێک باربکە کە کەمتر بێت لە ٢ گێگابایت (٢٠٠٠ مێگابایت).' }));
        return;
      }
      setState(prev => ({ ...prev, file, error: null }));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  const startProcessing = async () => {
    if (!state.file) {
      setState(prev => ({ ...prev, error: 'تکایە فایلێک هەڵبژێرە' }));
      return;
    }

    setState(prev => ({ ...prev, status: 'uploading', error: null, result: null }));

    try {
      const base64 = await fileToBase64(state.file);
      
      setState(prev => ({ ...prev, status: 'processing' }));
      const result = await transcribeMedia(base64, state.file.type, state.targetLanguage, state.mode);
      
      setState(prev => ({ ...prev, status: 'completed', result }));
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        status: 'error', 
        error: err.message || 'هەڵەیەک ڕوویدا لە کاتی کارکردن. دڵنیابەرەوە لە جۆری فایلەکە و پەیوەندی ئینتەرنێت.' 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
              Zyad Ai Pro
            </h1>
          </div>
          <div className="flex gap-2">
            <p className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full border border-indigo-100 hidden sm:block">
              صلى الله عليه وسلم
            </p>
            <p className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100 hidden sm:block">
               رسول الله
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 mt-8 space-y-8">
        <div className="bg-gradient-to-l from-indigo-50 to-white p-8 rounded-3xl border border-indigo-100 shadow-sm text-center space-y-4">
          <div className="inline-block p-2 bg-indigo-100 rounded-full mb-2">
            <svg className="w-6 h-6 text-indigo-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
            </svg>
          </div>
          <p className="text-xl font-bold text-indigo-900 leading-relaxed">
            رسول الله ﷺ فەرموویەتی : <br className="sm:hidden" />
            <span className="text-emerald-700">« خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ »</span>
          </p>
          <p className="text-lg font-medium text-slate-600">
            باشترینتان ئەو کەسەیە کە سوودی زۆرتر بێت بۆ خەڵکی
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 space-y-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center text-slate-800">
                دەرهێنانی دەق لە ڤیدیۆی وتار و کورتە وتاری ئاینی
              </h2>
              <p className="text-center text-slate-500 text-sm">
                فایلەکەت لێرە باربکە بۆ وەرگرتنی دەقەکان بە ڕێنووسی دروست و پاراستنی زاراوە ئاینییەکان
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
              <LanguageSelector 
                value={state.targetLanguage} 
                onChange={(lang) => setState(prev => ({ ...prev, targetLanguage: lang }))} 
              />
              
              <div className="flex flex-col space-y-2">
                <label className="text-sm font-semibold text-gray-700">شێوازی دەرهێنان</label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={() => setState(prev => ({ ...prev, mode: TranscriptionMode.BOOK }))}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      state.mode === TranscriptionMode.BOOK
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    شێوازی پەڕتووک (ڕێکخراو)
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, mode: TranscriptionMode.RAW }))}
                    className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      state.mode === TranscriptionMode.RAW
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-white text-gray-600 border border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                    }`}
                  >
                    دەقی ڕەسەن (وەک خۆی)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center">
              <div 
                className={`w-full relative border-2 border-dashed rounded-2xl p-10 transition-all cursor-pointer ${
                  state.file ? 'border-indigo-500 bg-indigo-50 shadow-inner' : 'border-slate-300 hover:border-indigo-400'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="audio/*,video/*"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className={`p-5 rounded-full ${state.file ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-lg">{state.file ? state.file.name : 'فایلی وتارەکە لێرە باربکە'}</p>
                    <p className="text-sm text-slate-400 mt-1">پشتگیری هەموو جۆرە دەنگ و ڤیدیۆیەک دەکەین تا ٢ گێگابایت</p>
                  </div>
                </div>
              </div>
            </div>

            {state.error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-xs flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {state.error}
              </div>
            )}

            <button
              onClick={startProcessing}
              disabled={state.status === 'processing' || state.status === 'uploading' || !state.file}
              className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-3 ${
                state.status === 'processing' || state.status === 'uploading' || !state.file
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 hover:shadow-indigo-200'
              }`}
            >
              {state.status === 'uploading' ? (
                <>
                  <svg className="animate-spin h-6 w-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  ئامادەکردنی فایل (چاوەڕێ بە)...
                </>
              ) : state.status === 'processing' ? (
                <>
                  <svg className="animate-pulse h-6 w-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  دەرهێنانی دەق بە تەواوی...
                </>
              ) : (
                <>
                  دەستپێکردنی دەرهێنان
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </>
              )}
            </button>
          </div>

          {state.result && (
            <div className="border-t border-slate-100 bg-slate-50 p-8 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className={`w-2 h-8 rounded-full ${state.mode === TranscriptionMode.BOOK ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                  {state.mode === TranscriptionMode.BOOK ? 'پەڕەی پەڕتووکەکە' : 'دەقی ڕەسەن (وشە بە وشە)'}
                </h3>
              </div>

              <div className="space-y-4">
                <div className={`p-8 md:p-14 rounded-2xl border shadow-sm relative group ${
                  state.mode === TranscriptionMode.BOOK 
                    ? 'bg-[#fdfbf7] border-[#e8e4d9] shadow-inner' // ڕەنگی کاغەزی سروشتی بۆ شێوازی پەڕتووک
                    : 'bg-white border-slate-200'
                }`}>
                  
                  {state.mode === TranscriptionMode.BOOK && (
                    <div className="text-center mb-10 pb-6 border-b-2 border-[#e8e4d9] border-dashed">
                      <h4 className="text-2xl font-bold text-[#4a3f35] font-serif leading-relaxed">
                        {state.result.verifiedMeaning || "دەقی شەرحەکە"}
                      </h4>
                    </div>
                  )}

                  {!state.mode.includes(TranscriptionMode.BOOK) && (
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6 border-b border-slate-50 pb-2 text-center">
                      {state.result.verifiedMeaning}
                    </h4>
                  )}
                  
                  <p className={`whitespace-pre-wrap font-medium ${
                    state.mode === TranscriptionMode.BOOK 
                      ? 'text-[1.2rem] text-[#3a352f] text-justify leading-[2.8] indent-8 font-serif' 
                      : 'text-[1.15rem] text-slate-800 leading-relaxed text-right'
                  }`}>
                    {state.result.originalText}
                  </p>
                  
                  <button 
                    onClick={() => navigator.clipboard.writeText(state.result?.originalText || '')}
                    className="absolute top-6 left-6 p-2.5 bg-white border border-slate-200 text-indigo-600 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 shadow-sm"
                    title="کۆپیکردن بۆ ناو فۆرد"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* بەشی خوارەوە - Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-12">
        <div className="max-w-4xl mx-auto px-4 flex flex-col items-center space-y-8">
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            {/* لینکی ئامادەکەری سایت */}
            <a 
              href="https://www.facebook.com/share/176QRzGspv/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2]/5 border border-[#1877F2]/20 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 text-[#1877F2] rounded-2xl transition-all shadow-sm group w-full sm:w-auto"
            >
              <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-slate-700 group-hover:text-[#1877F2] transition-colors">لینکی پڕۆفایلی ئامادەکەری سایت</span>
            </a>

            {/* لینکی مامۆستا هەڵۆ */}
            <a 
              href="https://www.facebook.com/share/1APofWm6NY/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="flex items-center justify-center gap-3 px-6 py-4 bg-[#1877F2]/5 border border-[#1877F2]/20 hover:bg-[#1877F2]/10 hover:border-[#1877F2]/30 text-[#1877F2] rounded-2xl transition-all shadow-sm group w-full sm:w-auto"
            >
              <svg className="w-7 h-7 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
              <span className="font-bold text-slate-700 group-hover:text-[#1877F2] transition-colors">لینکی پڕۆفایلی مامۆستا هەڵۆ</span>
            </a>
          </div>

          <p className="text-slate-400 text-xs font-medium text-center leading-relaxed">
            © 2026 Zyad Ai Pro - خزمەتگوزارییەکی بێبەرامبەر بۆ بڵاوکردنەوەی وتار و کورتە وتارە ئاینییەکان
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;