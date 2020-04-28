import { getRepository, Repository, EntityRepository } from 'typeorm';

import Category from '../models/Category';

@EntityRepository(Category)
class CategoryRepository extends Repository<Category> {
  public async findByTitle(title: string): Promise<Category | null> {
    const categoryRepository = getRepository(Category);

    const category = await categoryRepository.findOne({
      where: { title },
    });

    return category || null;
  }
}

export default CategoryRepository;
