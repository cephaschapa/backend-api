const express = require('express');
const { getBetas, addBeta } = require('../controllers/beta');
const advancedResutls = require('../middleware/advancedResults');
const {protect, authorize} = require('../middleware/auth')
const Beta = require('../models/Beta')

const router = express.Router({mergeParams:true})

// router.use(protect)
// router.use(authorize('user'))

router.route('/').get(advancedResutls(Beta), getBetas).post(addBeta)
// router.route('/:id').get(getBlog).put(updateBlog).delete(deleteBlog)
module.exports = router