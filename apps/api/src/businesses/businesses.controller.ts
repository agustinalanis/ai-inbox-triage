import { Controller, Get } from '@nestjs/common';
import { BusinessesService } from './businesses.service.js';

@Controller('businesses')
export class BusinessesController {
  constructor(private readonly businessesService: BusinessesService) {}

  // Only what the web needs: prompt details (examples, rules) stay on the server.
  @Get()
  findAll() {
    return this.businessesService
      .findAll()
      .map(({ id, name, description, categories }) => ({
        id,
        name,
        description,
        categories: categories.map(({ id: categoryId, label }) => ({
          id: categoryId,
          label,
        })),
      }));
  }
}
