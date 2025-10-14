
import type { JwtPayloadUser } from '../auth/types/jwt-payload-user.type';
declare global {
  namespace Express {
    // Make req.user typed as JwtPayloadUser | undefined (passport might return null)
    interface User extends JwtPayloadUser {}
    interface Request {
      user?: JwtPayloadUser;
    }
  }
}
