import { EntityRepository, Repository } from 'typeorm';
import Transaction from '../models/Transaction';

interface CreateTransactionDTO {
  title: string;
  value: number;
  type: 'income' | 'outcome';
}
interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async all(): Promise<Transaction[]> {
    const transactions = this.find({
      select: ['id', 'title', 'value', 'type'],
      relations: ['category'],
    });
    (await transactions).map(transaction => {
      delete transaction.category.created_at;
      delete transaction.category.updated_at;
      return transaction;
    });
    return transactions;
  }

  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = transactions.reduce(
      (previousElement, transaction): number => {
        if (transaction.type === 'income') {
          const total = transaction.value + previousElement;
          return total;
        }
        return previousElement;
      },
      0,
    );
    const outcome = transactions.reduce(
      (previousElement, transaction): number => {
        if (transaction.type === 'outcome') {
          const total = transaction.value + previousElement;
          return total;
        }
        return previousElement;
      },
      0,
    );
    const balance = { income, outcome, total: income - outcome };
    return balance;
  }
}

export default TransactionsRepository;
