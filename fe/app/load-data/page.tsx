'use client'

import React from 'react'
import { DataUpload } from '@/components/data-upload'

export default function LoadDataPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Load Your Data</h1>
          <p className="text-slate-400">
            Upload satu CSV per brand (misalnya <span className="font-semibold">disney.csv</span>,{' '}
            <span className="font-semibold">netflix.csv</span>). Nama brand akan diambil dari nama
            file dan di-capitalize otomatis.
          </p>
        </div>

        <DataUpload />
      </div>
    </main>
  )
}
