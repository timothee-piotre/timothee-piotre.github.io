// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    const createGroupBtn = document.getElementById('create-group');
    const joinGroupBtn = document.getElementById('join-group');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (createGroupBtn) {
        createGroupBtn.addEventListener('click', () => {
            // Code pour créer un groupe
            const groupName = prompt('Entrez le nom du groupe');
            if (groupName) {
                // Appel API pour créer un groupe
                fetch('/api/groups/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ name: groupName }),
                })
                .then(response => response.json())
                .then(data => {
                    alert('Groupe créé avec succès');
                    // Actualiser la liste des groupes
                    loadGroups();
                })
                .catch(error => console.error('Error:', error));
            }
        });
    }

    if (joinGroupBtn) {
        joinGroupBtn.addEventListener('click', () => {
            // Code pour rejoindre un groupe
            const groupId = prompt('Entrez l\'ID du groupe à rejoindre');
            if (groupId) {
                // Appel API pour rejoindre un groupe
                fetch(`/api/groups/join/${groupId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                .then(response => response.json())
                .then(data => {
                    alert('Vous avez rejoint le groupe');
                    // Actualiser la liste des groupes
                    loadGroups();
                })
                .catch(error => console.error('Error:', error));
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            })
            .catch(error => console.error('Error:', error));
        });
    }

    if (register-Form) {
        register-Form.addEventListener('submit', (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            })
            .then(response => response.json())
            .then(data => {
                localStorage.setItem('token', data.token);
                window.location.href = 'index.html';
            })
            .catch(error => console.error('Error:', error));
        });
    }

    function loadGroups() {
        // Charger et afficher les groupes
        fetch('/api/groups', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            const groupsList = document.getElementById('groups-list');
            groupsList.innerHTML = '';
            data.forEach(group => {
                const groupDiv = document.createElement('div');
                groupDiv.classList.add('group');
                groupDiv.innerHTML = `
                    <h2>${group.name}</h2>
                    <p>Admin: ${group.adminId}</p>
                    <p>Membres: ${group.members.length}</p>
                    <button onclick="viewGroup(${group.id})">Voir le Groupe</button>
                `;
                groupsList.appendChild(groupDiv);
            });
        })
        .catch(error => console.error('Error:', error));
    }
});
// server.js
const express = require('express');
const { connectDB } = require('config/db');
require('dotenv').config();

const app = express();

// Connect to database
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('api/auth', require('routes/authRoutes'));
app.use('api/groups', require('routes/groupRoutes'));
app.use('api/photos', require('routes/photoRoutes'));

// Sync database and start server
const startServer = async () => {
    try {
        await sequelize.sync();
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    } catch (error) {
        console.error('Error syncing database:', error);
    }
};

startServer();
// models/Group.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('config/db');
const User = require('User');

const Group = sequelize.define('Group', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    adminId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Relation Many-to-Many avec User
Group.belongsToMany(User, { through: 'GroupMembers' });
User.belongsToMany(Group, { through: 'GroupMembers' });

module.exports = Group;
// models/Guess.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('config/db');
const Photo = require('Photo');
const User = require('User');

const Guess = sequelize.define('Guess', {
    photoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    guesserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    guessedUserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    isCorrect: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Relations
Guess.belongsTo(Photo, { foreignKey: 'photoId' });
Guess.belongsTo(User, { foreignKey: 'guesserId' });
Guess.belongsTo(User, { foreignKey: 'guessedUserId' });

module.exports = Guess;
const { DataTypes } = require('sequelize');
const { sequelize } = require('config/db');
const User = require('User');
const Group = require('Group');

const Photo = sequelize.define('Photo', {
    uploaderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isAnonymous: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Relations
Photo.belongsTo(User, { foreignKey: 'uploaderId' });
Photo.belongsTo(Group, { foreignKey: 'groupId' });

module.exports = Photo;
// models/User.js
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('config/db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    points: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Hachage du mot de passe avant la création de l'utilisateur
User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
});

User.prototype.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = User;
const { DataTypes } = require('sequelize');
const { sequelize } = require('config/db');
const Photo = require('Photo');
const User = require('User');

const Vote = sequelize.define('Vote', {
    photoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    voterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    score: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

// Relations
Vote.belongsTo(Photo, { foreignKey: 'photoId' });
Vote.belongsTo(User, { foreignKey: 'voterId' });

module.exports = Vote;
// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('models/User');

const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findByPk(decoded.id);
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

module.exports = { protect };
// controllers/authController.js
const User = require('models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const user = await User.create({ username, email, password });
        res.status(201).json({
            id: user.id,
            username: user.username,
            email: user.email,
            token: generateToken(user.id),
        });
    } catch (error) {
        res.status(400).json({ message: 'User could not be created', error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                id: user.id,
                username: user.username,
                email: user.email,
                token: generateToken(user.id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Cannot log in', error: error.message });
    }
};
// controllers/groupController.js
const Group = require('models/Group');
const User = require('models/User');

exports.createGroup = async (req, res) => {
    const { name } = req.body;

    try {
        const group = await Group.create({
            name,
            adminId: req.user.id,
        });
        await group.addUser(req.user.id); // Add the creator as a member
        res.status(201).json(group);
    } catch (error) {
        res.status(400).json({ message: 'Group could not be created', error: error.message });
    }
};

exports.joinGroup = async (req, res) => {
    try {
        const group = await Group.findByPk(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });

        const user = req.user;

        // Check if the user is already a member
        const isMember = await group.hasUser(user.id);
        if (isMember) return res.status(400).json({ message: 'Already a member' });

        await group.addUser(user.id);
        res.status(200).json(group);
    } catch (error) {
        res.status(400).json({ message: 'Cannot join group', error: error.message });
    }
};
// controllers/photoController.js
const Photo = require('models/Photo');

exports.uploadPhoto = async (req, res) => {
    const { filePath, isAnonymous } = req.body;

    try {
        const photo = await Photo.create({
            uploaderId: req.user.id,
            groupId: req.params.groupId,
            filePath,
            isAnonymous,
        });
        res.status(201).json(photo);
    } catch (error) {
        res.status(400).json({ message: 'Photo could not be uploaded', error: error.message });
    }
};
// config/db.js
const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite', // Chemin vers le fichier SQLite
});

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDB };
