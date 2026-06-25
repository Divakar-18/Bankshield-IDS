"use client";

import React from "react";
import Link from "next/link";
import { Shield, ArrowRight, Activity, Award } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cyber-bg flex flex-col justify-between relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:24px_24px] opacity-20"></div>
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-sky-900/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Navbar */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center shadow-neon-blue">
            <Shield className="text-white w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-wider text-white code-font">
            BANKSHIELD<span className="text-sky-500">AI</span>
          </span>
        </div>
        <div className="flex items-center space-x-2 text-xs code-font text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 px-3 py-1.5 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>SOC Console Ready · Inference Calibrated</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center z-10 flex-grow py-12">
        <div className="lg:col-span-6 space-y-6">
          <div className="inline-flex items-center space-x-2 bg-sky-950/30 border border-sky-800/40 px-3 py-1 rounded text-xs text-sky-400 font-semibold tracking-wider uppercase">
            <Activity className="w-3.5 h-3.5" />
            <span>Banking Security Operations Center</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
            AI-Powered Banking <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              Threat Intelligence
            </span>
          </h1>
          <p className="text-base text-gray-400 leading-relaxed max-w-lg">
            Detect, explain, prioritize and neutralize cyber threats in real time. Optimized Random Forest Intrusion Detection mapping to MITRE ATT&CK tactics with SHAP local explainability.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard">
              <button className="px-8 py-4 bg-gradient-to-r from-sky-600 to-sky-500 hover:from-sky-500 hover:to-sky-400 rounded text-sm font-semibold tracking-wide shadow-neon-blue transition duration-200 flex items-center space-x-2 text-white">
                <span>Launch SOC Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </Link>
          </div>
        </div>

        {/* Visual Showcase Radar */}
        <div className="lg:col-span-6 flex justify-center items-center relative">
          <div className="w-[380px] h-[380px] md:w-[450px] md:h-[450px] rounded-full border border-sky-950/60 flex items-center justify-center relative bg-slate-950/40 shadow-2xl backdrop-blur-sm">
            <div className="absolute inset-4 rounded-full border border-sky-900/30 flex items-center justify-center">
              <div className="absolute inset-16 rounded-full border border-sky-800/20 flex items-center justify-center">
                <div className="absolute inset-28 rounded-full border border-sky-800/10 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center">
                    <div className="w-3.5 h-3.5 rounded-full bg-sky-500 animate-ping"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Alerts */}
            <div className="absolute top-1/4 left-1/3 w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-neon-red"></div>
            <div className="absolute bottom-1/3 right-1/4 w-3.5 h-3.5 rounded-full bg-yellow-500 animate-pulse shadow-neon-green"></div>

            {/* Floating stats block */}
            <div className="absolute bottom-6 left-6 right-6 bg-slate-950/90 border border-cyber-border rounded px-4 py-3 text-xs code-font flex justify-between items-center backdrop-blur-md">
              <div>
                <span className="text-gray-500 block text-[9px] uppercase">Active Detector</span>
                <span className="text-white font-bold">SMOTE + Random Forest</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500 block text-[9px] uppercase">Accuracy</span>
                <span className="text-emerald-400 font-extrabold text-sm">96.82%</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-cyber-border/40 py-6 z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 space-y-4 md:space-y-0">
          <div>
            <span>BankShield AI © 2026. Commercial Threat Intelligence.</span>
          </div>
          <div className="flex space-x-6">
            <span className="flex items-center"><Award className="w-3.5 h-3.5 mr-1 text-sky-500" /> UNSW-NB15 Validated</span>
            <span>SHAP Explainable AI</span>
            <span>Isolation Forest Anomaly Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
