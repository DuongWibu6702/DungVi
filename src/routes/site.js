const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')

router.get('/', siteController.home)
router.get('/terms-of-service', siteController.termsOfService)
router.get('/contact', siteController.contact)
router.get('/about-us', siteController.aboutUs)
router.get('/logout', siteController.logout);

module.exports = router