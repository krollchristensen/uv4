module.exports = (err, req, res, next) => {
    console.error('Fejl:', err.message);
    res.status(500).json({ error: 'Intern serverfejl' });
};
