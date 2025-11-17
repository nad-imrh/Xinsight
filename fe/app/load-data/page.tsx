'use client'
import React from 'react'
import Link from 'next/link'
import { DataUpload } from '@/components/data-upload'

export default function LoadDataPage() {
  return (
    <main className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Load Your Data</h1>
          <p className="text-slate-400">Upload Disney and Netflix CSV files to start analyzing</p>
        </div>
        
        <DataUpload />
      </div>
    </main>
  )
}
