import React from 'react';
import { useSetCreatorStore } from '../../store/useSetCreatorStore';
import { Progress } from '@/components/ui/progress';
import { Step1SetInfo } from './Step1SetInfo';
import { Step2AddQuestions } from './Step2AddQuestions';
import { Step3ReviewCreate } from './Step3ReviewCreate';
import { Button } from '@/components/ui/button';

export const SetCreatorWizard: React.FC = () => {
  const { step, reset } = useSetCreatorStore();

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1SetInfo />;
      case 2:
        return <Step2AddQuestions />;
      case 3:
        return <Step3ReviewCreate />;
      case 'success':
        return (
          <div className="text-center py-10">
            <h2 className="text-3xl font-bold mb-4">✅ Set Created!</h2>
            <p className="mb-8">Your set is ready to use.</p>
            <Button onClick={reset}>Create Another Set</Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-8">
        <div className="flex justify-between mb-2 text-sm font-medium">
          <span className={step >= 1 ? 'text-orange-600' : 'text-slate-400'}>1 Set Info</span>
          <span className={step >= 2 ? 'text-orange-600' : 'text-slate-400'}>2 Add Questions</span>
          <span className={step >= 3 ? 'text-orange-600' : 'text-slate-400'}>3 Review</span>
        </div>
        <Progress value={(step === 'success' ? 100 : (step / 3) * 100)} className="h-2" />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {renderStep()}
      </div>
    </div>
  );
};
