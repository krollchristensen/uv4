const { addUser, listUsers } = require('../services/userService');

module.exports.submitData = (req, res, next) => {
    try {
        const { name, email } = req.body;
        // demo på tvungen fejl
        if (name === 'boom') throw new Error('DB offline');
        const saved = addUser(name, email);
        res.status(201).json(saved);
    } catch (err) {
        next(err);
    }
};

module.exports.getUsers = (req, res) => {
    res.status(200).json(listUsers());
};

module.exports.downloadFile = (req, res, next) => {
    try {
        res.download('public/sample.txt');
    } catch (err) {
        next(err);
    }
};
