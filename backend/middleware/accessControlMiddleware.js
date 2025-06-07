const instructorAccess = (req, res, next) => {
    const role = req.user.role;

    if (role !== 'instructor') {
        return res.status(403).json({ message: 'Access denied. Only instructors have the permission.' });
    }
    next();
}
  

module.exports = { instructorAccess };
