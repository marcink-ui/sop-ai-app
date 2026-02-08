/**
 * C-Suite Perspectives for Party Mode Analysis
 * 
 * Each perspective provides a unique lens for analyzing SOPs, processes, 
 * and organizational transformation from different executive viewpoints.
 */

import {
    TrendingUp,
    DollarSign,
    Settings,
    Cpu,
    Megaphone,
    Users,
    type LucideIcon
} from 'lucide-react';

export type CSuitePerspective = 'CEO' | 'CFO' | 'COO' | 'CTO' | 'CMO' | 'CHRO';

export interface PerspectiveConfig {
    id: CSuitePerspective;
    title: string;
    subtitle: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
    focusAreas: string[];
    keyQuestions: string[];
    analysisPrompt: string;
    sopAnalysisTemplate: {
        sections: {
            name: string;
            description: string;
            questions: string[];
        }[];
    };
}

export const C_SUITE_PERSPECTIVES: Record<CSuitePerspective, PerspectiveConfig> = {
    CEO: {
        id: 'CEO',
        title: 'CEO',
        subtitle: 'Chief Executive Officer',
        icon: TrendingUp,
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/30',
        focusAreas: [
            'Strategia długoterminowa',
            'Wizja transformacji',
            'Wartość dla interesariuszy',
            'Konkurencyjność rynkowa',
            'Kultura organizacyjna'
        ],
        keyQuestions: [
            'Jak ten proces wpływa na naszą przewagę konkurencyjną?',
            'Czy wspiera realizację strategicznych celów firmy?',
            'Jaki wpływ ma na wartość firmy dla akcjonariuszy?',
            'Czy jest zgodny z naszą kulturą i wartościami?'
        ],
        analysisPrompt: `Przeanalizuj ten SOP z perspektywy CEO, skupiając się na:
1. Strategicznym znaczeniu procesu
2. Wpływie na przewagę konkurencyjną
3. Zgodności z wizją i misją firmy
4. Wartości dla interesariuszy
5. Długoterminowych implikacjach`,
        sopAnalysisTemplate: {
            sections: [
                {
                    name: 'Strategiczna Wartość',
                    description: 'Ocena znaczenia procesu dla strategii firmy',
                    questions: [
                        'Jak ten proces wspiera kluczowe cele strategiczne?',
                        'Jakie przewagi konkurencyjne generuje lub może generować?',
                        'Czy istnieją ryzyka strategiczne związane z tym procesem?'
                    ]
                },
                {
                    name: 'Wpływ na Kulturę',
                    description: 'Ocena zgodności z wartościami organizacji',
                    questions: [
                        'Czy proces wspiera pożądane zachowania i wartości?',
                        'Jak wpływa na zaangażowanie pracowników?',
                        'Czy jest transparentny i etyczny?'
                    ]
                },
                {
                    name: 'Pozycja Rynkowa',
                    description: 'Ocena wpływu na konkurencyjność',
                    questions: [
                        'Jak proces wpływa na doświadczenie klienta?',
                        'Czy wyróżnia nas na tle konkurencji?',
                        'Jakie są możliwości innowacji w tym obszarze?'
                    ]
                }
            ]
        }
    },

    CFO: {
        id: 'CFO',
        title: 'CFO',
        subtitle: 'Chief Financial Officer',
        icon: DollarSign,
        color: 'text-emerald-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/30',
        focusAreas: [
            'Rentowność procesów',
            'Optymalizacja kosztów',
            'ROI transformacji',
            'Zarządzanie ryzykiem finansowym',
            'Compliance finansowy'
        ],
        keyQuestions: [
            'Jaki jest koszt tego procesu na transakcję/operację?',
            'Gdzie są największe możliwości redukcji kosztów?',
            'Jaki ROI możemy osiągnąć przez automatyzację?',
            'Jakie są ryzyka finansowe i compliance?'
        ],
        analysisPrompt: `Przeanalizuj ten SOP z perspektywy CFO, skupiając się na:
1. Kosztach jednostkowych i całkowitych procesu
2. Możliwościach optymalizacji finansowej
3. ROI potencjalnej automatyzacji
4. Zgodności z regulacjami finansowymi
5. Zarządzaniu ryzykiem finansowym`,
        sopAnalysisTemplate: {
            sections: [
                {
                    name: 'Analiza Kosztów',
                    description: 'Szczegółowa analiza kosztów procesu',
                    questions: [
                        'Jakie są koszty bezpośrednie i pośrednie procesu?',
                        'Jaki jest koszt na jednostkę/transakcję?',
                        'Gdzie występuje marnotrawstwo zasobów?'
                    ]
                },
                {
                    name: 'ROI Optymalizacji',
                    description: 'Potencjalny zwrot z inwestycji w ulepszenia',
                    questions: [
                        'Jaki jest potencjał oszczędności przy automatyzacji?',
                        'Ile wynosi okres zwrotu inwestycji?',
                        'Jakie są ukryte koszty braku optymalizacji?'
                    ]
                },
                {
                    name: 'Ryzyko i Compliance',
                    description: 'Ocena ryzyk finansowych i regulacyjnych',
                    questions: [
                        'Jakie ryzyka finansowe są związane z procesem?',
                        'Czy spełnia wymogi audytu i regulacji?',
                        'Jak proces wpływa na cash flow?'
                    ]
                }
            ]
        }
    },

    COO: {
        id: 'COO',
        title: 'COO',
        subtitle: 'Chief Operating Officer',
        icon: Settings,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/30',
        focusAreas: [
            'Efektywność operacyjna',
            'Standaryzacja procesów',
            'Skalowanie operacji',
            'Jakość i ciągłość',
            'Optymalizacja zasobów'
        ],
        keyQuestions: [
            'Jak ustandaryzować ten proces w całej organizacji?',
            'Gdzie są wąskie gardła operacyjne?',
            'Jak skalować proces zachowując jakość?',
            'Jakie są zależności między procesami?'
        ],
        analysisPrompt: `Przeanalizuj ten SOP z perspektywy COO, skupiając się na:
1. Efektywności i przepustowości operacyjnej
2. Możliwościach standaryzacji i skalowania
3. Identyfikacji wąskich gardeł
4. Zarządzaniu jakością procesu
5. Integracji z innymi procesami`,
        sopAnalysisTemplate: {
            sections: [
                {
                    name: 'Efektywność Operacyjna',
                    description: 'Ocena wydajności i przepustowości',
                    questions: [
                        'Jaki jest czas cyklu i przepustowość procesu?',
                        'Gdzie występują największe opóźnienia?',
                        'Jaki jest wskaźnik błędów i reprocessing?'
                    ]
                },
                {
                    name: 'Standaryzacja',
                    description: 'Możliwości ujednolicenia procesu',
                    questions: [
                        'Czy proces jest wykonywany jednakowo we wszystkich lokalizacjach?',
                        'Jakie są odchylenia od standardu?',
                        'Co blokuje pełną standaryzację?'
                    ]
                },
                {
                    name: 'Skalowalność',
                    description: 'Zdolność do wzrostu bez proporcjonalnego wzrostu zasobów',
                    questions: [
                        'Jak proces radzi sobie ze wzrostem wolumenu?',
                        'Jakie są limity skalowania?',
                        'Co jest potrzebne do obsługi 2x/5x/10x wolumenu?'
                    ]
                }
            ]
        }
    },

    CTO: {
        id: 'CTO',
        title: 'CTO',
        subtitle: 'Chief Technology Officer',
        icon: Cpu,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/30',
        focusAreas: [
            'Potencjał automatyzacji',
            'Integracja systemów',
            'Architektury technologiczne',
            'Bezpieczeństwo IT',
            'Innowacje technologiczne'
        ],
        keyQuestions: [
            'Które kroki można w pełni zautomatyzować?',
            'Jakie systemy i API są potrzebne?',
            'Jak wygląda architektura danych procesu?',
            'Jakie są wymagania bezpieczeństwa?'
        ],
        analysisPrompt: `Przeanalizuj ten SOP z perspektywy CTO, skupiając się na:
1. Potencjale automatyzacji każdego kroku
2. Wymaganych integracjach systemowych
3. Architekturze przepływu danych
4. Bezpieczeństwie i compliance IT
5. Możliwościach zastosowania AI/ML`,
        sopAnalysisTemplate: {
            sections: [
                {
                    name: 'Analiza Automatyzacji',
                    description: 'Ocena potencjału automatyzacji krok po kroku',
                    questions: [
                        'Które kroki są w pełni automatyzowalne?',
                        'Które wymagają wsparcia AI/ML?',
                        'Co musi pozostać manualne i dlaczego?'
                    ]
                },
                {
                    name: 'Architektura Integracji',
                    description: 'Wymagane systemy i połączenia',
                    questions: [
                        'Jakie systemy są zaangażowane w proces?',
                        'Jakie API i integracje są potrzebne?',
                        'Jak wygląda przepływ danych?'
                    ]
                },
                {
                    name: 'Bezpieczeństwo i Compliance',
                    description: 'Wymagania techniczne dotyczące bezpieczeństwa',
                    questions: [
                        'Jakie dane wrażliwe są przetwarzane?',
                        'Jakie są wymagania szyfrowania i dostępu?',
                        'Czy spełnia wymogi GDPR/SOC2/ISO?'
                    ]
                }
            ]
        }
    },

    CMO: {
        id: 'CMO',
        title: 'CMO',
        subtitle: 'Chief Marketing Officer',
        icon: Megaphone,
        color: 'text-pink-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/30',
        focusAreas: [
            'Doświadczenie klienta',
            'Wizerunek marki',
            'Customer journey',
            'Komunikacja z rynkiem',
            'Wartość dla klienta'
        ],
        keyQuestions: [
            'Jak ten proces wpływa na doświadczenie klienta?',
            'Czy jest spójny z naszym przekazem marki?',
            'Jakie punkty styku z klientem możemy ulepszyć?',
            'Jak komunikujemy wartość tego procesu?'
        ],
        analysisPrompt: `Przeanalizuj ten SOP z perspektywy CMO, skupiając się na:
1. Wpływie na doświadczenie klienta (CX)
2. Spójności z marką i komunikacją
3. Punktach styku z klientem
4. Możliwościach personalizacji
5. Mierzeniu satysfakcji klienta`,
        sopAnalysisTemplate: {
            sections: [
                {
                    name: 'Customer Experience',
                    description: 'Wpływ na doświadczenie klienta',
                    questions: [
                        'Jak klient postrzega ten proces?',
                        'Jakie są "pain points" z perspektywy klienta?',
                        'Jak możemy przekroczyć oczekiwania klienta?'
                    ]
                },
                {
                    name: 'Spójność Marki',
                    description: 'Zgodność z tożsamością marki',
                    questions: [
                        'Czy komunikacja w procesie odzwierciedla wartości marki?',
                        'Jak możemy wyróżnić się na tle konkurencji?',
                        'Czy proces buduje lojalność klienta?'
                    ]
                },
                {
                    name: 'Personalizacja',
                    description: 'Możliwości dostosowania do klienta',
                    questions: [
                        'Gdzie możemy spersonalizować doświadczenie?',
                        'Jakie dane o kliencie wykorzystujemy?',
                        'Jak mierzymy i poprawiamy satysfakcję?'
                    ]
                }
            ]
        }
    },

    CHRO: {
        id: 'CHRO',
        title: 'CHRO',
        subtitle: 'Chief Human Resources Officer',
        icon: Users,
        color: 'text-orange-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/30',
        focusAreas: [
            'Zaangażowanie pracowników',
            'Rozwój kompetencji',
            'Zarządzanie zmianą',
            'Kultura pracy',
            'Work-life balance'
        ],
        keyQuestions: [
            'Jak ten proces wpływa na pracowników?',
            'Jakie kompetencje są potrzebne?',
            'Jak zarządzać zmianą przy automatyzacji?',
            'Czy wspiera rozwój i zaangażowanie?'
        ],
        analysisPrompt: `Przeanalizuj ten SOP z perspektywy CHRO, skupiając się na:
1. Wpływie na pracowników i ich role
2. Wymaganych kompetencjach i szkoleniach
3. Zarządzaniu zmianą organizacyjną
4. Zaangażowaniu i satysfakcji pracowników
5. Możliwościach rozwoju kariery`,
        sopAnalysisTemplate: {
            sections: [
                {
                    name: 'Wpływ na Zespół',
                    description: 'Jak proces wpływa na ludzi',
                    questions: [
                        'Jak automatyzacja wpłynie na role pracowników?',
                        'Czy proces wspiera czy obciąża zespół?',
                        'Jakie są możliwości przesunięć do wartościowej pracy?'
                    ]
                },
                {
                    name: 'Kompetencje i Rozwój',
                    description: 'Wymagane umiejętności i szkolenia',
                    questions: [
                        'Jakie nowe kompetencje będą potrzebne?',
                        'Jak zaplanować ścieżki rozwoju?',
                        'Jakie szkolenia są wymagane?'
                    ]
                },
                {
                    name: 'Zarządzanie Zmianą',
                    description: 'Plan wdrożenia zorientowany na ludzi',
                    questions: [
                        'Jak komunikować zmiany zespołowi?',
                        'Jakie są obawy i jak je adresować?',
                        'Jak mierzyć adopcję i satysfakcję?'
                    ]
                }
            ]
        }
    }
};

// Helper functions
export function getPerspectiveConfig(perspective: CSuitePerspective): PerspectiveConfig {
    return C_SUITE_PERSPECTIVES[perspective];
}

export function getAllPerspectives(): PerspectiveConfig[] {
    return Object.values(C_SUITE_PERSPECTIVES);
}

export function generateAnalysisPrompt(
    perspective: CSuitePerspective,
    sopContent: string
): string {
    const config = getPerspectiveConfig(perspective);
    return `${config.analysisPrompt}

## SOP do analizy:
${sopContent}

Przedstaw analizę w formie strukturyzowanej, uwzględniając sekcje:
${config.sopAnalysisTemplate.sections.map(s => `- ${s.name}: ${s.description}`).join('\n')}

Zakończ konkretymi rekomendacjami działań.`;
}

export function generateMultiPerspectivePrompt(
    perspectives: CSuitePerspective[],
    sopContent: string
): string {
    const perspectiveDetails = perspectives.map(p => {
        const config = getPerspectiveConfig(p);
        return `### ${config.title} (${config.subtitle})
Fokus: ${config.focusAreas.join(', ')}`;
    }).join('\n\n');

    return `Przeprowadź wielowymiarową analizę tego SOP z perspektywy wybranych członków C-Suite:

${perspectiveDetails}

## SOP do analizy:
${sopContent}

Dla każdej perspektywy przedstaw:
1. Kluczowe obserwacje
2. Ryzyka i szanse
3. Konkretne rekomendacje

Na końcu przedstaw podsumowanie z punktami wymagającymi uwagi całego zarządu.`;
}
