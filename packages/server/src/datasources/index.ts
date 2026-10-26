import { UserDataSource } from './UserDataSource';
import { CategoryDataSource } from './CategoryDataSource';
import { TransactionDataSource } from './TransactionDataSource';

export { BaseDataSource } from './BaseDataSource';
export { UserDataSource } from './UserDataSource';
export { CategoryDataSource } from './CategoryDataSource';
export { TransactionDataSource } from './TransactionDataSource';

export interface DataSources {
  userAPI: UserDataSource;
  categoryAPI: CategoryDataSource;
  transactionAPI: TransactionDataSource;
}

export function createDataSources(): DataSources {
  return {
    userAPI: new UserDataSource(),
    categoryAPI: new CategoryDataSource(),
    transactionAPI: new TransactionDataSource(),
  };
}
