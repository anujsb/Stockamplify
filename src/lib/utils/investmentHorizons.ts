/**
 * Investment Horizon Configuration
 * Defines different investment strategies and their corresponding data parameters
 */

import { TimeInterval, TimeRange } from '@/lib/services/chartService';

export interface HorizonConfig {
  name: string;
  description: string;
  interval: TimeInterval;
  period: TimeRange;
  focus: string;
  typicalHoldingPeriod: string;
  suitableFor: string[];
}

export const INVESTMENT_HORIZONS: Record<string, HorizonConfig> = {
  'scalping': {
    name: 'Scalping',
    description: 'Minutes to Hours',
    interval: '1m',
    period: '1d',
    focus: 'Micro-trends, immediate momentum, tight stop-loss',
    typicalHoldingPeriod: 'Minutes to hours',
    suitableFor: ['Day Traders', 'Scalpers', 'High-frequency Traders']
  },
  'intraday': {
    name: 'Intraday',
    description: 'Same Day',
    interval: '15m',
    period: '1d',
    focus: 'Same-day momentum shifts and volume bursts',
    typicalHoldingPeriod: 'Same day',
    suitableFor: ['Day Traders', 'Intraday Traders']
  },
  'swing-short': {
    name: 'Swing Trading - Short',
    description: '1 to 5 Days',
    interval: '1h',
    period: '5d',
    focus: 'Quick multi-day momentum and breakout levels',
    typicalHoldingPeriod: '1-5 days',
    suitableFor: ['Swing Traders', 'Short-term Traders']
  },
  'swing-medium': {
    name: 'Swing Trading - Medium',
    description: '1 to 4 Weeks',
    interval: '1d',
    period: '1mo',
    focus: 'Medium-term trends and key support/resistance',
    typicalHoldingPeriod: '1-4 weeks',
    suitableFor: ['Swing Traders', 'Medium-term Traders']
  },
  'positional': {
    name: 'Positional Trading',
    description: '1 to 6 Months',
    interval: '1d',
    period: '6mo',
    focus: 'Trend continuation and larger reversals',
    typicalHoldingPeriod: '1-6 months',
    suitableFor: ['Position Traders', 'Medium-term Investors']
  },
  'long-term': {
    name: 'Long-term Investing',
    description: '6 to 12 Months',
    interval: '1d',
    period: '1y',
    focus: 'Major support/resistance and macro trends',
    typicalHoldingPeriod: '6-12 months',
    suitableFor: ['Long-term Investors', 'Value Investors']
  }
};

/**
 * Get configuration for a specific investment horizon
 * @param horizon - Investment horizon key
 * @returns Horizon configuration or default
 */
export function getHorizonConfig(horizon: string): HorizonConfig {
  return INVESTMENT_HORIZONS[horizon] || INVESTMENT_HORIZONS['swing-medium'];
}

/**
 * Get all available investment horizons
 * @returns Array of horizon configurations
 */
export function getAllHorizons(): HorizonConfig[] {
  return Object.values(INVESTMENT_HORIZONS);
}

/**
 * Get horizon options for UI components
 * @returns Array of horizon options with value and label
 */
export function getHorizonOptions(): Array<{ value: string; label: string }> {
  return Object.entries(INVESTMENT_HORIZONS).map(([key, config]) => ({
    value: key,
    label: `${config.name} (${config.description})`
  }));
}

/**
 * Validate if a horizon is valid
 * @param horizon - Horizon to validate
 * @returns True if valid
 */
export function isValidHorizon(horizon: string): boolean {
  return horizon in INVESTMENT_HORIZONS;
} 