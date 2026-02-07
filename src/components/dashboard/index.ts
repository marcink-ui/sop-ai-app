// Dashboard Widgets Barrel Export
export { WidgetContainer, type WidgetContainerProps, type WidgetSize } from './widget-container';
export { ChatWidget } from './chat-widget';
export { PandasWidget } from './pandas-widget';
export { TasksWidget } from './tasks-widget';
export { CustomFormulaWidget } from './custom-formula-widget';
export {
    DashboardEditor,
    useDashboardWidgets,
    type WidgetType,
    type WidgetConfig,
    DEFAULT_WIDGETS,
    STORAGE_KEY,
} from './dashboard-editor';
