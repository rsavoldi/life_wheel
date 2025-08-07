'use client';

import { useState, useEffect, useRef } from 'react';
import type { LifeArea } from '@/types';
import { getInitialLifeAreas } from '@/lib/constants';
import { WheelChart } from './wheel-chart';
import { WheelControls } from './wheel-controls';
import { getAISuggestions } from '@/app/actions';
import type { SuggestImprovementsOutput } from '@/ai/flows/suggest-improvements';
import { AISuggestionsSheet } from './ai-suggestions-sheet';
import { useToast } from '@/hooks/use-toast';
import { useI18n } from '@/hooks/use-i18n';
import { v4 as uuidv4 } from 'uuid';
import { Canvg } from 'canvg';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export default function LifeWheel() {
  const { t, currentLanguage } = useI18n();
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestImprovementsOutput | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const wheelChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialAreas = getInitialLifeAreas(t).map((area) => ({
      ...area,
      id: uuidv4(),
    }));
    setAreas(initialAreas);
  }, [t]);

  const handleGetSuggestions = async () => {
    setIsSheetOpen(true);
    setIsLoading(true);
    setError(null);
    setSuggestions(null);

    const result = await getAISuggestions(areas, currentLanguage);

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

  const getChartAsBase64 = async (): Promise<string | null> => {
    if (!wheelChartRef.current) return null;
    
    // Create a clone of the SVG element to avoid modifying the one in the DOM
    const originalSvgElement = wheelChartRef.current.querySelector('svg');
    if (!originalSvgElement) return null;
    const svgElement = originalSvgElement.cloneNode(true) as SVGSVGElement;

    // Get computed styles from the browser
    const computedStyle = getComputedStyle(document.body);
    const foregroundColor = computedStyle.getPropertyValue('--foreground').trim();
    const mutedForegroundColor = computedStyle.getPropertyValue('--muted-foreground').trim();

    // Inline styles into the cloned SVG
    const elementsToStyle = svgElement.querySelectorAll('[data-strokecolor], [data-fillcolor]');
    elementsToStyle.forEach(el => {
        const strokeColor = el.getAttribute('data-strokecolor');
        const fillColor = el.getAttribute('data-fillcolor');
        if(strokeColor === 'muted-foreground') el.setAttribute('stroke', `hsl(${mutedForegroundColor})`);
        if(fillColor === 'foreground') el.setAttribute('fill', `hsl(${foregroundColor})`);
        if(fillColor === 'muted-foreground') el.setAttribute('fill', `hsl(${mutedForegroundColor})`);
    });

    const svgString = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    
    canvas.width = originalSvgElement.viewBox.baseVal.width;
    canvas.height = originalSvgElement.viewBox.baseVal.height;
    
    // Draw white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const v = await Canvg.from(ctx, svgString, {
        ignoreMouse: true,
        ignoreAnimation: true,
    });
    await v.render();

    return canvas.toDataURL('image/png');
  }

  const handleSaveAsPng = async () => {
    const pngData = await getChartAsBase64();
    if (pngData) {
      const link = document.createElement('a');
      link.href = pngData;
      link.download = 'life-wheel.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleSaveAsPdf = async () => {
    const pngData = await getChartAsBase64();
    if (pngData) {
      const doc = new jsPDF();
      doc.text("My Life Wheel", 14, 15);
      doc.addImage(pngData, 'PNG', 10, 20, 180, 180);

      const tableData = areas.map(area => [area.name, area.score]);
      (doc as any).autoTable({
        startY: 210,
        head: [['Area', 'Score']],
        body: tableData,
      });

      doc.save('life-wheel.pdf');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div ref={wheelChartRef} className="lg:col-span-2 flex items-center justify-center min-h-[50vh] lg:min-h-[80vh] p-4 bg-card rounded-xl shadow-md">
          <WheelChart areas={areas} setAreas={setAreas} key={`wheel-${currentLanguage}`} />
        </div>
        <div className="lg:col-span-1">
          <WheelControls
            areas={areas}
            setAreas={setAreas}
            onGetSuggestions={handleGetSuggestions}
            isGeneratingSuggestions={isLoading}
            onSaveAsPng={handleSaveAsPng}
            onSaveAsPdf={handleSaveAsPdf}
            key={`controls-${currentLanguage}`}
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
