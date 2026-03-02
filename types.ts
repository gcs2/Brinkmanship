export interface GameState {
    current_date: string; // ISO format date string
    metrics: {
        metric_1: number; // Stability
        metric_2: number; // Approval
        metric_3: number; // CPI / Inflation
        metric_4: number; // Trust
        metric_5: number; // Stock Market
        metric_6: number; // Bond Yields
        metric_7: number; // Unemployment
        metric_8: number; // Oil Price
    };
    demographics: {
        demo_1: number;
        demo_2: number;
        demo_3: number;
    };
    system: {
        volatility: number;
        fear_index: number;
        provocation: number;
    };
}

export interface ScenarioConfig {
    theme_name: string;
    assets?: Record<string, string>;
    metrics: Record<string, string>;
    demographics: Record<string, string>;
    system: Record<string, string>;
}

export interface EventOption {
    id: string;
    text: string;
    category: string;
    threshold: number;
}

export interface ActiveEvent {
    event_id: string;
    title: string;
    description: string;
    options: EventOption[];
}
