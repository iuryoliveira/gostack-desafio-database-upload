import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionRepository = getRepository(Transaction);

    const transactions = await transactionRepository.find();

    const income = transactions.reduce(
      (acc: number, transaction: Transaction) => {
        if (transaction.type === 'income') {
          return +acc + +transaction.value;
        }
        return +acc;
      },
      0,
    );

    const outcome = transactions.reduce(
      (acc: number, transaction: Transaction) => {
        if (transaction.type === 'outcome') {
          return +acc + +transaction.value;
        }
        return +acc;
      },
      0,
    );

    const total = income - outcome;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
