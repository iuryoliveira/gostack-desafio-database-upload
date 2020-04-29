import { Router } from 'express';
import { getCustomRepository, Transaction } from 'typeorm';

import path from 'path';

import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import loadCSV from '../utils/loadCSV';

const transactionsRouter = Router();

const upload = multer(uploadConfig);

transactionsRouter.get('/', async (request, response) => {
  const transactionRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionRepository.find();

  const balance = await transactionRepository.getBalance();

  return response.json({ transactions, balance });
});

transactionsRouter.post('/', async (request, response) => {
  const { title, type, value, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const transaction = await createTransaction.execute({
    title,
    value,
    type,
    categoryName: category,
  });

  return response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute({ id });

  return response.status(204).json();
});

transactionsRouter.post(
  '/import',
  upload.single('transactions'),
  async (request, response) => {
    const { file } = request;

    const csvFilePath = path.resolve(
      __dirname,
      '..',
      '..',
      'tmp',
      file.filename,
    );

    const transactionsData = await loadCSV(csvFilePath);

    const importTransaction = new ImportTransactionsService();

    const transactions = await importTransaction.execute({
      transactionsData,
    });

    return response.json(transactions);
  },
);

export default transactionsRouter;
