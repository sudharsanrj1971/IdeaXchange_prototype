// src/components/StateStepper.tsx
import React from 'react';

interface Props {
  /** Current state name, one of: 'Submitted', 'Collaborating', 'Validating', 'Certified' */
  currentState: string;
}

const steps = ['Submitted', 'Collaborating', 'Validating', 'Certified'];

export default function StateStepper({ currentState }: Props) {
  const currentIndex = steps.indexOf(currentState);

  return (
    <div className="flex items-center space-x-4">
      {steps.map((step, i) => (
        <React.Fragment key={step}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i <= currentIndex ? 'bg-pink-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              {i + 1}
            </div>
            <span className="mt-1 text-xs text-center text-gray-300">
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-1 ${i < currentIndex ? 'bg-pink-600' : 'bg-gray-700'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
