import { ClsStore } from 'nestjs-cls';

export interface CurrentUserStore extends ClsStore {
  user: {
    id: string;
    email: string;
    role: string;
    active: boolean;
  };
}
