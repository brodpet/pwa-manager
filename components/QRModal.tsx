'use client'

import { QRCodeSVG } from 'qrcode.react'

interface QRModalProps {
  url: string
  siteName: string
  onClose: () => void
}

export default function QRModal({ url, siteName, onClose }: QRModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#1e293b] rounded-2xl p-6 flex flex-col items-center gap-4 border border-slate-700 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-white font-semibold text-lg">Scan to Install</h2>
        <p className="text-slate-400 text-xs text-center">{siteName}</p>
        <div className="bg-white p-3 rounded-xl">
          <QRCodeSVG value={url} size={200} />
        </div>
        <p className="text-slate-500 text-xs text-center max-w-[220px]">
          Scan with your phone camera to open the install page
        </p>
        <button
          onClick={onClose}
          className="w-full py-2 rounded-lg bg-slate-700 text-slate-200 text-sm hover:bg-slate-600 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}
