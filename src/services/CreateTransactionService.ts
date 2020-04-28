import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';

import CreateCategoryService from './CreateCategoryService';
import CategoryRepository from '../repositories/CategoryRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  categoryName: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryName,
  }: Request): Promise<Transaction> {
    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Invalid transaction type', 400);
    }

    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getCustomRepository(CategoryRepository);

    let categoryId;

    const findCategory = await categoryRepository.findByTitle(categoryName);

    if (!findCategory) {
      const createCategory = new CreateCategoryService();

      const category = await createCategory.execute({ title: categoryName });

      await categoryRepository.save(category);

      categoryId = category.id;
    } else {
      categoryId = findCategory.id;
    }

    const transaction = transactionRepository.create({
      title,
      type,
      value,
      category_id: categoryId,
    });

    await transactionRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
