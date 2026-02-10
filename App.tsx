import React, { useState, useRef } from 'react';
import { transcribeMedia } from './services/geminiService';
import { Language, TranscriptionMode, AppState } from './types';
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
      if (file.size > 500 * 1024 * 1024) { 
        setState(prev => ({ ...prev, error: 'قەبارەی فایلەکە زۆر گەورەیە. تکایە فایلێک باربکە کە کەمتر بێت لە ٥٠٠ مێگابایت بۆ خێراتر کارکردن.' }));
        return;
      }
      setState(prev => ({ ...prev, file, error: null }));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = error => reject(error);
    });
  };

  const startProcessing = async () => {
    if (!state.file) return setState(prev => ({ ...prev, error: 'تکایە فایلێک هەڵبژێرە' }));
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
        error: err.message || 'هەڵەیەک ڕوویدا لە کاتی کارکردن.' 
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-800 font-sans pb-16">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/60 sticky top-0 z-50 backdrop-blur-md bg-white/80">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">Zyad Ai Pro</h1>
              <p className="text-xs font-bold text-indigo-600">دەرهێنانی دەق بە زیرەکی دەستکرد</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-10 space-y-10">
        
        {/* Youtube Hint Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl p-6 border border-red-100 flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm shrink-0">
            <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
          </div>
          <div>
            <h3 className="text-lg font-bold text-red-900 mb-1">دەرهێنانی دەق لە ڤیدیۆی یوتیوب؟</h3>
            <p className="text-red-700/80 text-sm font-medium leading-relaxed">
              بۆ دەرهێنانی دەق لە ڤیدیۆیەکانی یوتیوب، پێویستە سەرەتا ڤیدیۆکە یان دەنگەکەی دابەزێنیتە سەر کۆمپیوتەرەکەت یان مۆبایلەکەت، پاشان لە بەشی خوارەوە فایلەکە هەڵبژێرە.
            </p>
          </div>
        </div>

        {/* Main Work Area */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100 p-8 md:p-12 space-y-10">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            {/* Left/Right Column: Settings */}
            <div className="space-y-8 bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-6">
                <svg className="w-6 h-6 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                ڕێکخستنەکان
              </h2>
              
              <LanguageSelector 
                value={state.targetLanguage} 
                onChange={(lang) => setState(prev => ({ ...prev, targetLanguage: lang }))} 
              />
              
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700">شێوازی دەرهێنان</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => setState(prev => ({ ...prev, mode: TranscriptionMode.BOOK }))}
                    className={`px-5 py-4 rounded-2xl text-sm font-bold transition-all flex flex-col items-center gap-2 ${
                      state.mode === TranscriptionMode.BOOK
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-indigo-200'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                    پەڕتووک (ڕێکخراو)
                  </button>
                  <button
                    onClick={() => setState(prev => ({ ...prev, mode: TranscriptionMode.RAW }))}
                    className={`px-5 py-4 rounded-2xl text-sm font-bold transition-all flex flex-col items-center gap-2 ${
                      state.mode === TranscriptionMode.RAW
                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                        : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-emerald-200'
                    }`}
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    دەقی ڕەسەن
                  </button>
                </div>
              </div>
            </div>

            {/* Other Column: Upload and Process */}
            <div className="flex flex-col justify-between space-y-6">
              <div 
                className={`flex-1 relative border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer text-center ${
                  state.file 
                    ? 'border-indigo-500 bg-indigo-50/50' 
                    : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'
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
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${state.file ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                  {state.file ? (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
                  )}
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  {state.file ? state.file.name : 'فایلی دەنگ یان ڤیدیۆ باربکە'}
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  {state.file ? `قەبارە: ${(state.file.size / (1024 * 1024)).toFixed(2)} MB` : 'پشتگیری کراوە تا قەبارەی ٥٠٠ مێگابایت'}
                </p>
              </div>

              {state.error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm font-bold border border-red-100 flex items-center gap-3">
                  <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/></svg>
                  {state.error}
                </div>
              )}

              <button
                onClick={startProcessing}
                disabled={state.status === 'processing' || state.status === 'uploading' || !state.file}
                className={`w-full py-5 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-3 ${
                  state.status === 'processing' || state.status === 'uploading' || !state.file
                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                    : 'bg-[#1e1b4b] text-white hover:bg-indigo-900 shadow-xl hover:-translate-y-1'
                }`}
              >
                {state.status === 'uploading' ? 'ئامادەکردنی فایل (چاوەڕێ بە)...' : state.status === 'processing' ? 'دەرهێنانی دەق لەکارە...' : 'دەستپێکردنی دەرهێنان'}
              </button>
            </div>
          </div>

          {/* Result Section */}
          {state.result && (
            <div className="pt-10 border-t-2 border-slate-100 mt-10">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black text-slate-800">ئەنجامی دەقەکە</h3>
                <button 
                  onClick={() => navigator.clipboard.writeText(state.result?.originalText || '')}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                  کۆپیکردن
                </button>
              </div>

              <div className={`p-8 md:p-12 rounded-[2rem] border-2 shadow-sm ${
                state.mode === TranscriptionMode.BOOK 
                  ? 'bg-[#faf7f2] border-[#e8dfd1]' // ڕەنگی پەڕتووک
                  : 'bg-white border-slate-200'
              }`}>
                {state.mode === TranscriptionMode.BOOK && (
                  <div className="text-center mb-10 pb-6 border-b-2 border-[#e8dfd1] border-dashed">
                    <h4 className="text-2xl font-black text-[#5c4f42]">{state.result.verifiedMeaning}</h4>
                  </div>
                )}
                
                <p className={`whitespace-pre-wrap ${
                  state.mode === TranscriptionMode.BOOK 
                    ? 'text-[1.3rem] text-[#3d362d] text-justify leading-[2.5] font-medium' 
                    : 'text-[1.1rem] text-slate-800 leading-relaxed text-right'
                }`}>
                  {state.result.originalText}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 mt-16 text-center text-slate-500 text-sm font-medium">
        <p>© 2026 Zyad Ai Pro - خزمەتگوزارییەکی بێبەرامبەر</p>
      </footer>
    </div>
  );
};

export default App;