// midlertidig in-memory storage
const users = [];
let nextId = 1;

function addUser(name, email) {
    const user = { id: nextId++, name, email };
    users.push(user);
    return user;
}

function listUsers() {
    return users.slice();
}

module.exports = { addUser, listUsers };
