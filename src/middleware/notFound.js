const path = require('path');
module.exports = (req, res) => {
    res.status(404).sendFile(path.join(process.cwd(), 'public', '404.html'));
};
