// src/middleware/tempAdminMiddleware.js
export const handleTempAdmin = (req, res, next) => {
  // Check for temp admin header
  if (req.headers['x-temp-admin'] === 'true') {
    console.log('🔐 Temp admin access granted via header');
    req.isTempAdmin = true;
    
    // If no user is authenticated but temp admin is enabled, create a mock user
    if (!req.user) {
      req.user = {
        _id: 'temp_admin_user',
        name: 'Temporary Admin',
        role: 'admin'
      };
      console.log('👤 Created temporary admin user for request');
    } else {
      // If user exists, temporarily upgrade to admin
      req.user.role = 'admin';
      console.log(`👤 Upgraded user ${req.user._id} to admin via temp header`);
    }
  }
  next();
};