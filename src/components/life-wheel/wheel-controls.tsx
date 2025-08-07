'use client';

import type { Dispatch, SetStateAction } from 'react';
import { Sparkles, Trash2, PlusCircle, Loader2, Download, FileDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import type { LifeArea } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { ScrollArea } from '../ui/scroll-area';
import { useI18n } from '@/hooks/use-i18n';

interface WheelControlsProps {
  areas: LifeArea[];
  setAreas: Dispatch<SetStateAction<LifeArea[]>>;
  onGetSuggestions: () => void;
  isGeneratingSuggestions: boolean;
  onSaveAsPng: () => void;
  onSaveAsPdf: () => void;
}

const defaultColors = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
  '#C9CBCF', '#E7E9ED', '#8A2BE2', '#7FFF00', '#D2691E', '#FF7F50'
];

export function WheelControls({ areas, setAreas, onGetSuggestions, isGeneratingSuggestions, onSaveAsPng, onSaveAsPdf }: WheelControlsProps) {
  const { t } = useI18n();

  const updateArea = (id: string, updatedValues: Partial<LifeArea>) => {
    setAreas((prev) => prev.map((area) => (area.id === id ? { ...area, ...updatedValues } : area)));
  };

  const addArea = () => {
    const newColor = defaultColors[areas.length % defaultColors.length] || '#CCCCCC';
    setAreas((prev) => [
      ...prev,
      { id: uuidv4(), name: t('wheelControls.newArea'), score: 5, color: newColor },
    ]);
  };

  const removeArea = (id: string) => {
    setAreas((prev) => prev.filter((area) => area.id !== id));
  };
  
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>{t('wheelControls.title')}</CardTitle>
        <CardDescription>{t('wheelControls.description')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[45vh] pr-4">
          <div className="space-y-6">
            {areas.map((area) => (
              <div key={area.id} className="space-y-4 p-4 border rounded-lg bg-background shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                        type="color"
                        value={area.color}
                        onChange={(e) => updateArea(area.id, { color: e.target.value })}
                        className="w-10 h-10 p-1"
                        aria-label={`Color for ${area.name}`}
                    />
                    <Input
                      value={area.name}
                      onChange={(e) => updateArea(area.id, { name: e.target.value })}
                      className="text-md font-semibold border-0 focus-visible:ring-1"
                      aria-label={`Name for ${area.name}`}
                    />
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeArea(area.id)} aria-label={`Remove ${area.name}`}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <Label htmlFor={`score-${area.id}`}>{t('wheelControls.score')}</Label>
                    <span 
                      className="text-sm font-bold w-8 h-8 flex items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: area.color }}
                    >
                      {area.score}
                    </span>
                  </div>
                   <Slider
                    id={`score-${area.id}`}
                    min={0}
                    max={10}
                    step={1}
                    value={[area.score]}
                    onValueChange={([value]) => updateArea(area.id, { score: value })}
                    style={{ '--slider-color': area.color } as React.CSSProperties}
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={addArea}>
                <PlusCircle className="mr-2 h-4 w-4" />
                {t('wheelControls.addArea')}
            </Button>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={onGetSuggestions} disabled={isGeneratingSuggestions}>
          {isGeneratingSuggestions ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {t('wheelControls.getSuggestions')}
        </Button>
        <div className="flex w-full gap-2">
          <Button variant="outline" className="w-full" onClick={onSaveAsPng}>
            <Download className="mr-2 h-4 w-4" />
            PNG
          </Button>
          <Button variant="outline" className="w-full" onClick={onSaveAsPdf}>
            <FileDown className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
