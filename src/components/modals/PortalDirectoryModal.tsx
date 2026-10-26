import React from 'react';
import { DIRECT_PORTAL_LINKS } from '../../constants/portals';
import { Badge } from '../ui/Badge';
import { ExternalLink, Compass, X } from 'lucide-react';

interface PortalDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalDirectoryModal: React.FC<PortalDirectoryModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0d131f] border border-slate-700/80 rounded-xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden text-slate-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#070a10]/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-800 text-slate-200 rounded-lg border border-slate-700">
              <Compass className="w-5 h-5 text-slate-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Danh Bạ 5 Trụ Cột Công Cụ Miễn Phí Toàn Cầu
              </h2>
              <p className="text-xs text-slate-400">
                Các trang web chính thức bắt buộc phải bookmark của nhà giao dịch chuyên nghiệp
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto divide-y divide-slate-800/80 space-y-4">
          {DIRECT_PORTAL_LINKS.map((portal, idx) => (
            <div key={idx} className="pt-4 first:pt-0 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge tone="neutral">TRỤ CỘT {portal.pillarId}</Badge>
                  <h3 className="text-sm font-bold text-white">{portal.name}</h3>
                </div>
                <div className="text-xs text-slate-300 mt-1.5">
                  <strong>Vai trò:</strong> {portal.role}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  <strong>Tính năng miễn phí:</strong> {portal.freeFeatures}
                </p>
              </div>

              <a
                href={portal.url}
                target="_blank"
                rel="noreferrer noopener"
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                <span>Mở Trang</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </a>
            </div>
          ))}
        </div>

        <div className="px-6 py-3 border-t border-slate-800 bg-[#070a10]/80 flex items-center justify-between text-xs text-slate-400">
          <span>Tất cả các công cụ trên đều có phiên bản miễn phí 100% không cần trả phí</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-white text-slate-950 font-semibold rounded-lg text-xs transition-colors shadow-sm"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
