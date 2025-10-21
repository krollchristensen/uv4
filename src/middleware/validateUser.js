module.exports = (req, res, next) => {
    const { name, email } = req.body || {};
    if (!name || !email || !email.includes('@')) {
        return res.status(400).json({ error: 'Ugyldigt input' });
    }
    next();
};
