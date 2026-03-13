import { AppUser } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: AppUser;
    }
  }
}
