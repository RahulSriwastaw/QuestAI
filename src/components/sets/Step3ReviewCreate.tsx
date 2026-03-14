import React from 'react';
import { useSetCreatorStore } from '../../store/useSetCreatorStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Trash2, GripVertical } from 'lucide-react';

export const Step3ReviewCreate: React.FC = () => {
  const { set_questions, name, removeFromSet, setStep } = useSetCreatorStore();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Review Your Set: {name}</h2>
      
      <div className="grid grid-cols-3 gap-4">
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{set_questions.length}</p><p className="text-sm text-slate-500">Questions</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">3</p><p className="text-sm text-slate-500">Subjects</p></CardContent></Card>
        <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold">5</p><p className="text-sm text-slate-500">Exams</p></CardContent></Card>
      </div>

      <div className="border rounded-lg p-4">
        <h3 className="font-bold mb-4">Questions</h3>
        <div className="space-y-2">
          {set_questions.map((q, index) => (
            <div key={q.id} className="flex items-center gap-2 p-2 border rounded bg-white">
              <GripVertical className="text-slate-400 cursor-grab" />
              <span className="font-mono text-slate-500">{index + 1}.</span>
              <span className="flex-1 truncate">{q.question_text}</span>
              <Button variant="ghost" size="sm" onClick={() => removeFromSet(q.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Visibility</Label>
        <RadioGroup defaultValue="private" className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2 border p-4 rounded-lg flex-1">
            <RadioGroupItem value="private" id="private" />
            <Label htmlFor="private">🔒 Private</Label>
          </div>
          <div className="flex items-center space-x-2 border p-4 rounded-lg flex-1">
            <RadioGroupItem value="org" id="org" />
            <Label htmlFor="org">🏢 Org-Only</Label>
          </div>
          <div className="flex items-center space-x-2 border p-4 rounded-lg flex-1">
            <RadioGroupItem value="public" id="public" />
            <Label htmlFor="public">🌐 Public</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(2)}>← Back to Questions</Button>
        <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => setStep('success')}>Create Set →</Button>
      </div>
    </div>
  );
};
