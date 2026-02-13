'use client';

import { TestCase } from '@/lib/testCases';
import { ReactNode } from 'react';

type QATooltipProps = {
  testCase: TestCase;
  enabled: boolean;
  children: ReactNode;
};

export function QATooltip({ testCase, enabled, children }: QATooltipProps) {
  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative group">
      {children}
      
      {/* Tooltip - appears on hover */}
      <div className="absolute z-50 invisible group-hover:visible
                      bg-blue-50 border-2 border-blue-500 rounded-lg p-4
                      shadow-2xl w-80 -top-2 left-full ml-4
                      transition-all duration-200">
        {/* Arrow */}
        <div className="absolute -left-2 top-4 w-4 h-4 bg-blue-50 
                        border-l-2 border-t-2 border-blue-500 
                        transform rotate-[-45deg]" />
        
        {/* Content */}
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-mono text-blue-600 font-bold">
              🧪 {testCase.id}
            </div>
            <span className={`text-xs px-2 py-0.5 rounded ${
              testCase.priority === 'Critical' 
                ? 'bg-red-100 text-red-800' 
                : testCase.priority === 'High'
                ? 'bg-orange-100 text-orange-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {testCase.priority}
            </span>
          </div>
          
          <h4 className="font-bold text-sm text-gray-900 mb-2">
            {testCase.feature}
          </h4>
          
          <div className="space-y-1 text-xs">
            <p className="text-gray-700">
              <strong className="text-gray-900">Scenario:</strong>
              <br />
              {testCase.scenario}
            </p>
            
            <p className="text-gray-700">
              <strong className="text-gray-900">Expected:</strong>
              <br />
              {testCase.expected}
            </p>
          </div>
          
          <div className="mt-3 pt-2 border-t border-blue-200">
            {testCase.covered ? (
              <span className="inline-flex items-center text-xs bg-green-100 
                             text-green-800 px-2 py-1 rounded font-medium">
                ✅ Test Coverage Active
              </span>
            ) : (
              <span className="inline-flex items-center text-xs bg-red-100 
                             text-red-800 px-2 py-1 rounded font-medium">
                ❌ Not Covered
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}