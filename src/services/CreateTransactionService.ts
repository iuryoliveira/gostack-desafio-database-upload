// import AppError from '../errors/AppError';

import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import CreateCategoryService from './CreateCategoryService';

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
    const transactionRepository = getRepository(Transaction);
    const categoryRepository = getRepository(Category);

    let categoryId;

    const findCategory = await categoryRepository.findOne({
      where: { title: categoryName },
    });

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
