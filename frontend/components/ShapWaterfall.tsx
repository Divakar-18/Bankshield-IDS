"use client";

import React from "react";
import { Eye, Info } from "lucide-react";

interface ShapWaterfallProps {
  shapExplanation?: Record<string, number>;
  predictionClass?: string;
}

export default function ShapWaterfall({ shapExplanation, predictionClass }: ShapWaterfallProps) {
  if (!shapExplanation) {
    return (
      <div className="bg-slate-950 border border-cyber-border rounded-lg p-5 text-center py-12 text-xs text-gray-500 italic">
        Select a threat node to visualize feature attributions.
      </div>
    );
  }

  // Sort by absolute value descending
  const sortedShaps = Object.entries(shapExplanation)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, 5);

  return (
    <div className="bg-slate-950 border border-cyber-border rounded-lg p-5 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-xs font-semibold text-gray-400 tracking-wider uppercase flex items-center">
            <Eye className="w-4 h-4 text-sky-500 mr-1.5" />
            SHAP Explainable AI Waterfall
          </h3>
          <span className="text-[10px] text-sky-400 code-font">Model Interpretability</span>
        </div>
        <p className="text-[10px] text-gray-500 mb-4">Driving features causing classification: <strong>{predictionClass}</strong></p>
      </div>

      <div className="space-y-3.5 my-2 flex-grow flex flex-col justify-center">
        {sortedShaps.map(([key, val], idx) => {
          const isPositive = val > 0;
          const percent = Math.min(100, Math.abs(val) * 150); // Scale multiplier

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[10px] code-font">
                <span className="text-gray-400">{key}</span>
                <span className={isPositive ? 'text-red-400 font-semibold' : 'text-sky-400 font-semibold'}>
                  {isPositive ? '+' : ''}{val.toFixed(4)}
                </span>
              </div>
              <div className="w-full bg-slate-900 h-2 rounded overflow-hidden relative">
                <div 
                  className={`h-full rounded ${isPositive ? 'bg-gradient-to-r from-red-600 to-red-400 shadow-neon-red' : 'bg-gradient-to-r from-sky-600 to-sky-400'}`}
                  style={{ width: `${percent}%`, marginLeft: isPositive ? '0' : 'auto' }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-[9px] text-gray-500 mt-4 border-t border-cyber-border/40 pt-3 leading-relaxed">
        <Info className="w-3.5 h-3.5 inline mr-1 text-sky-400" />
        Positive SHAP attributions drive the random forest split decision towards the threat prediction, whereas negative values pull the model towards normal network baselines.
      </div>
    </div>
  );
}
