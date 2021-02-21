const express = require('express');
const projectController = require('./../controllers/projectController');
const authController = require('./../controllers/authController');

const router = express.Router();

router
    .route('/')
    .get(projectController.getAllProjects)
router.post('/createTicket', projectController.createTicket)
router.post('/updateCardPlace', projectController.updateCardPlace);
router.post('/createMarker', projectController.createMarker);
router.post('/removeUser', projectController.removeUser);
router.post('/banUser', projectController.banUser);
router.post('/createProject', projectController.createProject);
router.post('/updateCard', projectController.updateCard);
router.post('/deleteCard', projectController.deleteCard);
router.post('/updateProject', projectController.updateProject);
router.post('/deleteProject', projectController.deleteProject);
router.post('/deleteMarker', projectController.deleteMarker);

module.exports = router;