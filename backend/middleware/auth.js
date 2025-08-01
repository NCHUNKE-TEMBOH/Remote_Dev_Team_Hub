import { verifyIdToken } from '../config/firebase.js';
import { query } from '../config/database.js';

// Middleware to verify Firebase authentication
export const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Access denied. No token provided.' 
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(token);
    
    // Get user from database
    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ 
        message: 'User not found in database.' 
      });
    }

    // Attach user info to request object
    req.user = {
      ...userResult.rows[0],
      firebase_uid: decodedToken.uid,
      email: decodedToken.email
    };

    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(401).json({ 
      message: 'Invalid token.' 
    });
  }
};

// Middleware to check if user has specific role
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentication required.' 
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions.' 
      });
    }

    next();
  };
};

// Middleware to check if user is project member
export const requireProjectMember = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project_id;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({ 
        message: 'Project ID is required.' 
      });
    }

    // Check if user is a member of the project
    const memberResult = await query(
      `SELECT pm.*, p.name as project_name 
       FROM project_members pm 
       JOIN projects p ON pm.project_id = p.id 
       WHERE pm.project_id = $1 AND pm.user_id = $2`,
      [projectId, userId]
    );

    if (memberResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Access denied. You are not a member of this project.' 
      });
    }

    // Attach project membership info to request
    req.projectMembership = memberResult.rows[0];
    
    next();
  } catch (error) {
    console.error('❌ Project membership check error:', error);
    return res.status(500).json({ 
      message: 'Error checking project membership.' 
    });
  }
};

// Middleware to check if user is project admin
export const requireProjectAdmin = async (req, res, next) => {
  try {
    const projectId = req.params.projectId || req.body.project_id;
    const userId = req.user.id;

    if (!projectId) {
      return res.status(400).json({ 
        message: 'Project ID is required.' 
      });
    }

    // Check if user is an admin of the project
    const adminResult = await query(
      `SELECT pm.* FROM project_members pm 
       WHERE pm.project_id = $1 AND pm.user_id = $2 AND pm.role IN ('admin', 'owner')`,
      [projectId, userId]
    );

    if (adminResult.rows.length === 0) {
      return res.status(403).json({ 
        message: 'Access denied. Admin privileges required.' 
      });
    }

    // Attach project admin info to request
    req.projectAdmin = adminResult.rows[0];
    
    next();
  } catch (error) {
    console.error('❌ Project admin check error:', error);
    return res.status(500).json({ 
      message: 'Error checking project admin privileges.' 
    });
  }
};

// Optional authentication middleware (doesn't fail if no token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // Continue without authentication
    }

    const token = authHeader.substring(7);
    const decodedToken = await verifyIdToken(token);
    
    const userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [decodedToken.uid]
    );

    if (userResult.rows.length > 0) {
      req.user = {
        ...userResult.rows[0],
        firebase_uid: decodedToken.uid,
        email: decodedToken.email
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};
