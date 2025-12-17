export const sessionAuth = (req, res, next) => {
  if (!req.session.admin) {
    return res.status(401).json({
      success: false,
      message: "Admin not logged in"
    });
  }
  next();
};

export const adminOnly = (req, res, next) => {
  if (req.session.admin.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admins only"
    });
  }
  next();
};
