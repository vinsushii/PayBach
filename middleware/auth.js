// middleware/auth.js
export const requireAuth = (req, res, next) => {
    console.log("\n=== AUTH MIDDLEWARE ===");
    console.log("Path:", req.path);
    console.log("Session user:", req.session?.user);
    console.log("Session ID:", req.sessionID);
    
    if (req.session && req.session.user && req.session.user.role === "admin") {
      console.log(" User authorized:", req.session.user.email);
      return next();
    }
    
    console.log(" Unauthorized access");
    return res.status(401).json({
      success: false,
      error: "Unauthorized. Please log in.",
    });
  };
  
  export const sessionCheck = (req, res, next) => {
    // Always allow session to be saved
    req.session.touch();
    next();
  };