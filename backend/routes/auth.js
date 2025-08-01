import express from 'express';
import { verifyIdToken, getUserByUid } from '../config/firebase.js';
import { query } from '../config/database.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// Register or login user
router.post('/login', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        message: 'ID token is required' 
      });
    }

    // Verify the Firebase ID token
    const decodedToken = await verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user exists in database
    let userResult = await query(
      'SELECT * FROM users WHERE firebase_uid = $1',
      [uid]
    );

    let user;

    if (userResult.rows.length === 0) {
      // Create new user
      const insertResult = await query(
        `INSERT INTO users (firebase_uid, email, display_name, photo_url) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [uid, email, name || email.split('@')[0], picture || null]
      );
      user = insertResult.rows[0];
      console.log('✅ New user created:', user.email);
    } else {
      // Update existing user info
      const updateResult = await query(
        `UPDATE users 
         SET display_name = $1, photo_url = $2, updated_at = CURRENT_TIMESTAMP 
         WHERE firebase_uid = $3 
         RETURNING *`,
        [name || userResult.rows[0].display_name, picture, uid]
      );
      user = updateResult.rows[0];
      console.log('✅ User updated:', user.email);
    }

    // Remove sensitive information
    const { firebase_uid, ...userResponse } = user;

    res.status(200).json({
      message: 'Authentication successful',
      user: userResponse
    });

  } catch (error) {
    console.error('❌ Authentication error:', error);
    res.status(401).json({ 
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get current user profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const userResult = await query(
      `SELECT u.*, 
       COUNT(DISTINCT pm.project_id) as project_count,
       COUNT(DISTINCT t.id) as task_count
       FROM users u
       LEFT JOIN project_members pm ON u.id = pm.user_id
       LEFT JOIN tasks t ON u.id = t.assigned_to
       WHERE u.id = $1
       GROUP BY u.id`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const user = userResult.rows[0];
    const { firebase_uid, ...userProfile } = user;

    res.status(200).json({
      user: userProfile
    });

  } catch (error) {
    console.error('❌ Error fetching user profile:', error);
    res.status(500).json({ 
      message: 'Error fetching user profile' 
    });
  }
});

// Update user profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { display_name, photo_url } = req.body;

    const updateResult = await query(
      `UPDATE users 
       SET display_name = $1, photo_url = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3 
       RETURNING *`,
      [display_name, photo_url, userId]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    const { firebase_uid, ...userProfile } = updateResult.rows[0];

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userProfile
    });

  } catch (error) {
    console.error('❌ Error updating user profile:', error);
    res.status(500).json({ 
      message: 'Error updating user profile' 
    });
  }
});

// Logout (client-side only, but endpoint for consistency)
router.post('/logout', authenticateUser, (req, res) => {
  res.status(200).json({ 
    message: 'Logout successful' 
  });
});

// Verify token endpoint
router.post('/verify', async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ 
        message: 'ID token is required' 
      });
    }

    const decodedToken = await verifyIdToken(idToken);
    
    res.status(200).json({
      valid: true,
      uid: decodedToken.uid,
      email: decodedToken.email
    });

  } catch (error) {
    res.status(401).json({
      valid: false,
      message: 'Invalid token'
    });
  }
});

export default router;
