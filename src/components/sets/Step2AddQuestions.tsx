import React, { useEffect } from 'react';
import { useSetCreatorStore } from '../../store/useSetCreatorStore';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, Plus, Check, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const Step2AddQuestions: React.FC = () => {
  const { filtered_questions, set_questions, fetchQuestions, addToSet, removeFromSet, setFilter, filters } = useSetCreatorStore();

  useEffect(() => {
    fetchQuestions();
  }, [filters, fetchQuestions]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 h-[600px]">
      {/* Left Pane: Browse */}
      <div className="md:col-span-3 flex flex-col gap-4">
        <div className="flex gap-2">
          <Input 
            placeholder="Search questions..." 
            className="flex-1" 
            value={filters.search_text}
            onChange={(e) => setFilter('search_text', e.target.value)}
          />
          <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filters</Button>
        </div>
        <div className="flex-1 overflow-y-auto border rounded-lg p-4 space-y-2">
          {filtered_questions.map((q) => {
            const isAdded = set_questions.some(sq => sq.id === q.id);
            return (
              <div key={q.id} className="flex items-center justify-between p-3 border rounded hover:bg-slate-50">
                <div className="flex-1">
                  <p className="font-medium text-sm">{q.question_text}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{q.difficulty}</Badge>
                    <Badge variant="outline">{q.type}</Badge>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant={isAdded ? "secondary" : "default"}
                  onClick={() => isAdded ? removeFromSet(q.id) : addToSet(q)}
                >
                  {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Pane: In Set */}
      <div className="md:col-span-2 flex flex-col border rounded-lg p-4 bg-slate-50">
        <h3 className="font-bold mb-4">In This Set ({set_questions.length})</h3>
        <div className="flex-1 overflow-y-auto space-y-2">
          {set_questions.length === 0 ? (
            <p className="text-slate-500 text-center mt-10">No questions yet. Add from the left.</p>
          ) : (
            set_questions.map((q) => (
              <div key={q.id} className="flex items-center justify-between p-2 bg-white border rounded text-sm">
                <span className="truncate">{q.question_text.substring(0, 30)}...</span>
                <Button size="sm" variant="ghost" onClick={() => removeFromSet(q.id)}><X className="w-4 h-4 text-red-500" /></Button>
              </div>
            ))
          )}
        </div>
        <Button className="w-full mt-4 bg-orange-500 hover:bg-orange-600">Review & Create →</Button>
      </div>
    </div>
  );
};
