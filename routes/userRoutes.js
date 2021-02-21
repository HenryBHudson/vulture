const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.post('/register', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/changeRole', userController.changeRole);
router.post('/joinProject', userController.joinProject);
router.post('/switchProject', userController.switchProject);
router.post('/leaveProject', userController.leaveProject);
router.post('/updateProfile', userController.updateProfile)
router.post('/updateAction', userController.updateAction);
router.post('/updateStatus', userController.updateStatus);

// router.post('/forgotPassword', authController.forgotPassword);
// router.patch('/resetPassword/:token', authController.resetPassword);

// router.patch('/updatePassword', authController.protect, authController.updatePassword);

// router.patch('/updateUser', authController.protect, userController.updateUser)

// router
//     .route('/')
//     .get(userController.getAllUsers)
//     .post(userController.createUser);

// router
//     .route('/:id')
//     .get(userController.getUser)
//     .patch(userController.updateUser)
//     .delete(userController.deleteUser);

module.exports = router;