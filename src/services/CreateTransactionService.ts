import { getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateCategoryService from './CreateCategoryService';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  categoryName: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    categoryName,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const { total } = await transactionsRepository.getBalance();

    if (type === 'outcome' && total - value < 0) {
      throw new AppError('Value exaggerated');
    }

    const createCategory = new CreateCategoryService();
    const category = await createCategory.execute({ title: categoryName });
    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category_id: category.id,
    });

    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
