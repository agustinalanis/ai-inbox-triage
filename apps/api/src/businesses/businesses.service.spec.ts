import consultorio from './configs/consultorio.json' with { type: 'json' };
import {
  BusinessesService,
  parseBusinessConfigs,
} from './businesses.service.js';

const minimalBusiness = {
  id: 'shop',
  name: 'Shop',
  description: 'A shop.',
  priorityRules: 'Everything is normal.',
  categories: [{ id: 'general', label: 'General', description: 'Anything.' }],
};

describe('BusinessesService', () => {
  it('loads the shipped business configs', () => {
    const service = new BusinessesService();

    expect(service.findAll().map((business) => business.id)).toEqual([
      'consultorio',
      'academia',
    ]);
    expect(
      service.findOne('consultorio')?.categories.find((c) => c.escalate)?.id,
    ).toBe('crisis');
    expect(
      service.findOne('academia')?.categories.find((c) => c.escalate)?.id,
    ).toBe('wellbeing-risk');
  });

  it('returns undefined for an unknown business', () => {
    expect(new BusinessesService().findOne('unknown')).toBeUndefined();
  });
});

describe('parseBusinessConfigs', () => {
  it('applies the defaults of optional category fields', () => {
    const category = parseBusinessConfigs([minimalBusiness]).get('shop')
      ?.categories[0];

    expect(category).toEqual({
      id: 'general',
      label: 'General',
      description: 'Anything.',
      examples: [],
      extract: [],
      escalate: false,
    });
  });

  it('rejects a config without categories, naming its position', () => {
    expect(() =>
      parseBusinessConfigs([
        consultorio,
        { ...minimalBusiness, categories: [] },
      ]),
    ).toThrow(/Invalid business config at index 1/);
  });

  it('rejects duplicate category ids', () => {
    const categories = [
      minimalBusiness.categories[0],
      minimalBusiness.categories[0],
    ];

    expect(() =>
      parseBusinessConfigs([{ ...minimalBusiness, categories }]),
    ).toThrow(/category ids must be unique/);
  });

  it('rejects duplicate business ids', () => {
    expect(() =>
      parseBusinessConfigs([minimalBusiness, minimalBusiness]),
    ).toThrow('Duplicate business id "shop"');
  });
});
