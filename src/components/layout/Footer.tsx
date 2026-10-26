import React from 'react';

interface FooterProps {
  onOpenPortals: () => void;
  onOpenRoutine: () => void;
  onOpenAlerts: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenPortals,
  onOpenRoutine,
  onOpenAlerts,
}) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#070a10] text-slate-500 text-xs py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="font-bold text-slate-300">CryptoRadar Pro</span>
          <span className="mx-2">·</span>
          <span>Bộ Công Cụ Quan Sát Trực Quan 5 Trụ Cột</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={onOpenPortals}
            className="hover:text-slate-200 transition-colors"
          >
            5 Website Miễn Phí
          </button>
          <span>·</span>
          <button
            onClick={onOpenRoutine}
            className="hover:text-slate-200 transition-colors"
          >
            Quy Trình 5 Phút Sáng
          </button>
          <span>·</span>
          <button
            onClick={onOpenAlerts}
            className="hover:text-slate-200 transition-colors"
          >
            Cài Đặt Cảnh Báo
          </button>
        </div>

        <p className="text-[11px] text-slate-500">
          Dữ liệu hỗ trợ quan sát khách quan bằng số liệu, không cấu thành lời khuyên đầu tư tài chính.
        </p>
      </div>
    </footer>
  );
};
