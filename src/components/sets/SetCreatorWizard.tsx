import React from 'react';
import { useSetCreatorStore } from '../../store/useSetCreatorStore';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

export const SetCreatorWizard: React.FC = () => {
  const { step, setStep } = useSetCreatorStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <div>Step 1: Set Info (Form)</div>;
      case 2:
        return <div>Step 2: Add Questions (Split Pane)</div>;
      case 3:
        return <div>Step 3: Review & Create</div>;
      case 'success':
        return <div>Success Screen</div>;
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          <span>Set Info</span>
          <span>Add Questions</span>
          <span>Review</span>
        </div>
        <Progress value={(step / 3) * 100} className="h-2" />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {renderStep()}
      </div>
    </div>
  );
};
