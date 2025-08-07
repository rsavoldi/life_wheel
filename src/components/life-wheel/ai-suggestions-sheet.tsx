'use client';

import type { SuggestImprovementsOutput } from '@/ai/flows/suggest-improvements';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useI18n } from '@/hooks/use-i18n';

interface AISuggestionsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  suggestions: SuggestImprovementsOutput | null;
  isLoading: boolean;
  error: string | null;
}

export function AISuggestionsSheet({
  open,
  onOpenChange,
  suggestions,
  isLoading,
  error,
}: AISuggestionsSheetProps) {
  const { t } = useI18n();
  const renderLoadingState = () => (
    <div className="space-y-4 p-4">
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-4 w-3/4" />
      <div className="space-y-6 pt-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    </div>
  );

  const renderErrorState = () => (
    <div className="p-4">
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>{t('error.title')}</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    </div>
  );

  const renderSuggestions = () => (
    <ScrollArea className="h-full">
      <div className="p-1 md:p-4">
        <SheetHeader className="text-left">
          <SheetTitle>{t('aiSuggestions.title')}</SheetTitle>
          <SheetDescription>
            {t('aiSuggestions.description')}
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-6 py-6">
          {suggestions?.suggestions.map((suggestion) => (
            <Card key={suggestion.area}>
              <CardHeader>
                <CardTitle className="text-lg text-primary">{suggestion.area}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-1">{t('aiSuggestions.strategies')}</h4>
                  <p className="text-muted-foreground text-sm">{suggestion.strategies}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{t('aiSuggestions.activities')}</h4>
                  <p className="text-muted-foreground text-sm">{suggestion.activities}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </ScrollArea>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0">
        {isLoading
          ? renderLoadingState()
          : error
          ? renderErrorState()
          : suggestions && renderSuggestions()}
      </SheetContent>
    </Sheet>
  );
}
