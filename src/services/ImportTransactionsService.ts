import { getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  transactionsData: Array<{
    title: string;
    type: 'income' | 'outcome';
    value: number;
    categoryName: string;
  }>;
}

class ImportTransactionsService {
  async execute(transactionsData: Request): Promise<Transaction[]> {
    const createTransaction = new CreateTransactionService();
    console.log(transactionsData);

    const transactionList = transactionsData.transactionsData.map(
      async transaction => {
        const newTransaction = createTransaction.execute({
          title: transaction[0],
          type: transaction[1],
          value: transaction[2],
          categoryName: transaction[3],
        });

        return newTransaction;
      },
    );

    const resultado = await Promise.all(transactionList);
    return resultado;
  }
}

export default ImportTransactionsService;
