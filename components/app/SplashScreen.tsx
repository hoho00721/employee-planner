'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export default function SplashScreen() {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 80) }, [])

  return (
    <div
      className="app-bg flex flex-col items-center justify-center relative overflow-hidden"
      style={{ minHeight:'100dvh' }}
    >
      {/* Glows */}
      <div className="glow-blob" style={{ width:360, height:360, background:'#1565C0', top:-80, right:-80, position:'absolute' }} />
      <div className="glow-blob" style={{ width:280, height:280, background:'#2E7D32', bottom:-60, left:-60, position:'absolute' }} />
      <div className="glow-blob" style={{ width:200, height:200, background:'#0288D1', top:'40%', right:'30%', position:'absolute' }} />

      <div
        className="flex flex-col items-center gap-6 z-10 px-8"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(28px)',
          transition: 'opacity 0.6s ease, transform 0.6s ease',
        }}
      >
        {/* Logo */}
        <div
          className="rounded-[28px] p-1.5 relative"
          style={{
            background: 'linear-gradient(135deg,#1565C0,#0D47A1)',
            boxShadow: '0 20px 60px rgba(21,101,192,0.5), 0 0 0 1px rgba(255,255,255,0.12)',
          }}
        >
          <Image
            src="/app-icon.png"
            alt="منظم الموظف"
            width={110} height={110}
            className="rounded-[22px]"
            priority
          />
        </div>

        {/* App name */}
        <div className="text-center">
          <h1
            className="font-black text-white leading-tight"
            style={{ fontSize:32, textShadow:'0 2px 20px rgba(21,101,192,0.6)' }}
          >
            منظم الموظف
          </h1>
          <p
            className="uppercase tracking-[0.25em] font-bold mt-1"
            style={{ fontSize:13, color:'rgba(255,255,255,0.45)' }}
          >
            Employee Planner
          </p>
        </div>

        {/* Tagline */}
        <div
          className="rounded-2xl px-5 py-3 text-center"
          style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.10)' }}
        >
          <p style={{ color:'rgba(255,255,255,0.60)', fontSize:13, lineHeight:1.6 }}>
            مساعدك الشخصي الذكي
            <br />
            لإدارة حياتك المهنية والشخصية
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-2 mt-2">
          {[0,1,2,3].map(i => (
            <div
              key={i}
              style={{
                width: i === 1 ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i === 1 ? '#1976D2' : 'rgba(255,255,255,0.20)',
                animation: `splashDot 1.4s ease-in-out ${i * 0.15}s infinite`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Version */}
      <p
        className="absolute bottom-8 z-10"
        style={{ color:'rgba(255,255,255,0.20)', fontSize:11 }}
      >
        v1.0.0 · الجزائر 🇩🇿
      </p>

      <style>{`
        @keyframes splashDot {
          0%, 80%, 100% { opacity:0.3; transform:scale(0.85); }
          40%            { opacity:1;   transform:scale(1.1); }
        }
      `}</style>
    </div>
  )
}
