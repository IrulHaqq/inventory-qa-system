'use client';

type QAModeToggleProps = {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
};

export function QAModeToggle({ enabled, onChange }: QAModeToggleProps) {
  return (
    <div className="flex items-center gap-3 bg-white rounded-lg shadow-md px-4 py-3 border-2 border-gray-200">
      <span className="text-sm font-medium text-gray-700">
        QA Testing Mode:
      </span>
      
      <button
        onClick={() => onChange(!enabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full
                   transition-colors focus:outline-none focus:ring-2 
                   focus:ring-blue-500 focus:ring-offset-2 ${
          enabled ? 'bg-blue-600' : 'bg-gray-300'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full 
                     bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      <span className={`text-sm font-bold ${
        enabled ? 'text-blue-600' : 'text-gray-500'
      }`}>
        {enabled ? '🟢 ON' : '⚪ OFF'}
      </span>
      
      {enabled && (
        <span className="text-xs text-blue-600 ml-2 animate-pulse">
          Hover over elements to see test cases
        </span>
      )}
    </div>
  );
}