import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import academia from './configs/academia.json' with { type: 'json' };
import consultorio from './configs/consultorio.json' with { type: 'json' };
import {
  businessConfigSchema,
  type BusinessConfig,
} from './business-config.schema.js';

// To add a business, add its JSON file to configs/ and to this list.
const RAW_CONFIGS: unknown[] = [consultorio, academia];

// Throws on the first invalid config, so the app refuses to start with a broken one.
export function parseBusinessConfigs(
  rawConfigs: unknown[],
): Map<string, BusinessConfig> {
  const configs = new Map<string, BusinessConfig>();
  for (const [index, raw] of rawConfigs.entries()) {
    const result = businessConfigSchema.safeParse(raw);
    if (!result.success) {
      throw new Error(
        `Invalid business config at index ${index}:\n${z.prettifyError(result.error)}`,
      );
    }
    if (configs.has(result.data.id)) {
      throw new Error(`Duplicate business id "${result.data.id}"`);
    }
    configs.set(result.data.id, result.data);
  }
  return configs;
}

@Injectable()
export class BusinessesService {
  private readonly configs = parseBusinessConfigs(RAW_CONFIGS);

  findAll(): BusinessConfig[] {
    return [...this.configs.values()];
  }

  findOne(id: string): BusinessConfig | undefined {
    return this.configs.get(id);
  }
}
