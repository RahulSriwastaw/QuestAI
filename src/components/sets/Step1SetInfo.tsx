import React from 'react';
import { useSetCreatorStore } from '../../store/useSetCreatorStore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Bot, FileUp } from 'lucide-react';

const SUBJECTS = [
  { id: 'math', name: 'Mathematics' },
  { id: 'eng', name: 'English' },
  { id: 'reasoning', name: 'Reasoning' },
];

const CHAPTERS: Record<string, { id: string; name: string }[]> = {
  math: [{ id: 'alg', name: 'Algebra' }, { id: 'trig', name: 'Trigonometry' }],
  eng: [{ id: 'gram', name: 'Grammar' }, { id: 'vocab', name: 'Vocabulary' }],
  reasoning: [{ id: 'logic', name: 'Logical Reasoning' }],
};

export const Step1SetInfo: React.FC = () => {
  const { name, subject_id, chapter_id, description, creation_mode, setField, setStep } = useSetCreatorStore();

  return (
    <div className="space-y-6">
      <div>
        <Label className="text-lg font-semibold">Give your set a name</Label>
        <Input
          value={name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder="e.g., Math Algebra Practice"
          className="text-2xl h-16 mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Subject</Label>
          <Select value={subject_id} onValueChange={(val) => setField('subject_id', val)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {SUBJECTS.map((s) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Chapter</Label>
          <Select value={chapter_id} onValueChange={(val) => setField('chapter_id', val)} disabled={!subject_id}>
            <SelectTrigger>
              <SelectValue placeholder="Select Chapter" />
            </SelectTrigger>
            <SelectContent>
              {subject_id && CHAPTERS[subject_id]?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Short Description (optional)</Label>
        <Textarea
          value={description}
          onChange={(e) => setField('description', e.target.value)}
          placeholder="25 Algebra questions for SSC CGL practice"
          className="mt-2"
        />
      </div>

      <div>
        <Label className="text-lg font-semibold">How do you want to pick questions?</Label>
        <div className="grid grid-cols-3 gap-4 mt-4">
          {[
            { id: 'browse', label: 'Browse & Filter', icon: Search, desc: 'Pick from Q-Bank' },
            { id: 'ai', label: 'AI Suggest', icon: Bot, desc: 'Let AI pick' },
            { id: 'import', label: 'Import CSV', icon: FileUp, desc: 'Upload your own' },
          ].map((mode) => (
            <Card 
              key={mode.id} 
              className={`cursor-pointer border-2 ${creation_mode === mode.id ? 'border-orange-500 bg-orange-50' : 'hover:border-slate-300'}`}
              onClick={() => setField('creation_mode', mode.id)}
            >
              <CardContent className="p-4 text-center">
                <mode.icon className="mx-auto mb-2 text-orange-500" />
                <p className="font-bold">{mode.label}</p>
                <p className="text-xs text-slate-500">{mode.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setStep(2)} disabled={!name || !subject_id}>
          Continue → Add Questions
        </Button>
      </div>
    </div>
  );
};
