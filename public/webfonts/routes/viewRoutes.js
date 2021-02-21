const express = require('express');
const viewsController = require('../controllers/viewsController');
const projectController = require('../controllers/projectController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/');

router.get('/login', projectController.getProject, authController.isLoggedIn, viewsController.getLoginForm);
router.get('/logout', authController.logout);
router.get('/register', projectController.getProject, authController.isLoggedIn, viewsController.sendToRegister);

router.get('/join', authController.protect, viewsController.sendToJoin)
router.get('/action', authController.protect, viewsController.sendToAction)
router.get('/create', authController.protect, viewsController.sendToCreate)
router.get('/projects', authController.protect, projectController.getUserProjects, viewsController.sendToProjects);
router.get('/account', authController.protect, viewsController.sendToAccount);
router.get('/chat', authController.protect, userController.getChats, viewsController.sendToChat);
router.get('/chat/:id', authController.protect, userController.getChats, viewsController.sendToChat);

router.get('/overview', authController.protect, authController.interceptProject, projectController.getProject, projectController.getUserProjects, viewsController.sendToDash)
router.get('/visual', authController.protect, authController.interceptProject, projectController.runVisual, projectController.getProject, projectController.getUserProjects, viewsController.sendToVisual);
router.get('/markers', authController.protect, authController.interceptProject, projectController.getProject, projectController.getUserProjects, viewsController.sendToMarkers);
router.get('/members', authController.protect, authController.interceptProject, projectController.adminProtect, projectController.getProject, projectController.getUserProjects, userController.getUsers, viewsController.sendToMembers);
router.get('/settings', authController.protect, authController.interceptProject, projectController.adminProtect, projectController.getProject, projectController.getUserProjects, viewsController.sendToSettings);

router.get('/me', authController.protect, viewsController.getAccount); 
router.post('/submit-user-data', authController.protect, viewsController.updateUserData);

module.exports = router;