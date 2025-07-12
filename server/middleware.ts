import { type Request, Response, NextFunction } from "express";
import "./types";

// Basic authentication middleware
export const basicAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Basic ')) {
    res.setHeader('WWW-Authenticate', 'Basic realm="BEAVERNET System"');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  const credentials = Buffer.from(authHeader.split(' ')[1], 'base64').toString('utf-8');
  const [username, password] = credentials.split(':');
  
  try {
    // Import storage here to avoid circular dependency
    const { storage } = await import('./storage');
    const user = await storage.getUserByUsername(username);
    
    if (user && user.password === password && user.isActive) {
      // Create display name from user profile
      const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`
        : user.firstName || user.lastName || username;
      
      req.user = { 
        username: user.username, 
        name: displayName,
        id: user.id,
        email: user.email,
        department: user.department,
        position: user.position,
        accessLevel: user.accessLevel
      };
      next();
    } else {
      res.setHeader('WWW-Authenticate', 'Basic realm="BEAVERNET System"');
      return res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Authentication error:', error);
    res.setHeader('WWW-Authenticate', 'Basic realm="BEAVERNET System"');
    return res.status(401).json({ message: 'Authentication failed' });
  }
};

// Access level authorization middleware
export const requireAccessLevel = (allowedLevels: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    
    if (!user || !user.accessLevel) {
      return res.status(403).json({ message: 'Access denied: No access level specified' });
    }

    if (!allowedLevels.includes(user.accessLevel)) {
      return res.status(403).json({ 
        message: `Access denied: Requires one of the following access levels: ${allowedLevels.join(', ')}`,
        userLevel: user.accessLevel
      });
    }

    next();
  };
};