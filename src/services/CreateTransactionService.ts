import { getRepository, getCustomRepository } from 'typeorm';

import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';
import TransictionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    type,
    value,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransictionsRepository);

    if (type === 'outcome') {
      const { total } = await transactionsRepository.getBalance();

      if (total < value) {
        throw new AppError('Value for outcome is bigger than total value');
      }
    }

    const categoriesRepository = getRepository(Category);

    let checkCategory = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!checkCategory) {
      checkCategory = categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(checkCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      type,
      value,
      category_id: checkCategory.id,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
