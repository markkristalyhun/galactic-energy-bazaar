import {Role} from '@core/auth/models/role';

export interface UserModel {
  id: string;
  email: string;
  planetId: string;
  role: Role;
}
