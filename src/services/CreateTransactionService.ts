import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

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

    const transactionRepository = getCustomRepository(TransactionRepository);
    const categoryRepository = getCustomRepository(CategoryRepository);

    if (type === 'outcome') {
      const { total } = await transactionRepository.getBalance();

      if (total - value < 0) {
        throw new AppError('Transaction value exceeds the limit.', 400);
      }
    }

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
