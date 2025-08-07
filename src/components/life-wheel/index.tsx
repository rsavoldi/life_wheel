'use client';

import { useState, useEffect } from 'react';
import type { LifeArea } from '@/types';
import { getInitialLifeAreas } from '@/lib/constants';
import { WheelChart } from './wheel-chart';
import { WheelControls } from './wheel-controls';
import { getAISuggestions } from '@/app/actions';
import type { SuggestImprovementsOutput } from '@/ai/flows/suggest-improvements';
import { AISuggestionsSheet } from './ai-suggestions-sheet';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';

export default function LifeWheel() {
  const { t, currentLanguage } = useI18n();
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestImprovementsOutput | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setAreas(getInitialLifeAreas(t));
  }, [t, currentLanguage]);

  const handleGetSuggestions = async () => {
    setIsSheetOpen(true);
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const result = await getAISuggestions(areas);

    if (result.success) {
      setSuggestions(result.data);
    } else {
      setError(result.error);
      toast({
        variant: 'destructive',
        title: t('error.title'),
        description: result.error,
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 flex items-center justify-center min-h-[50vh] lg:min-h-[80vh] p-4 bg-card rounded-xl shadow-md">
          <WheelChart areas={areas} setAreas={setAreas} />
        </div>
        <div className="lg:col-span-1">
          <WheelControls
            areas={areas}
            setAreas={setAreas}
            onGetSuggestions={handleGetSuggestions}
            isGeneratingSuggestions={isLoading}
          />
        </div>
      </div>
      <AISuggestionsSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        suggestions={suggestions}
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
}
