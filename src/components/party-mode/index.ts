// Party Mode components and utilities
export { PerspectiveSelector, PerspectiveBadges } from './perspective-selector';
export {
    C_SUITE_PERSPECTIVES,
    type CSuitePerspective,
    type PerspectiveConfig,
    getAllPerspectives,
    getPerspectiveConfig,
    generateAnalysisPrompt,
    generateMultiPerspectivePrompt,
} from '@/lib/party-mode/c-suite-perspectives';
