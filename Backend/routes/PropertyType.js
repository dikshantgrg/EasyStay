const express = require("express");
const { checkAuthorization, isAdmin } = require("../middleware/auth");
const { addPropertyType, getPropertyTypes, updatePropertyType, deletePropertyType } = require("../controller/propertyType");
const router = express.Router();



router.post("/api/add/property-type", checkAuthorization,isAdmin, addPropertyType);
router.get("/api/get/property-type", checkAuthorization,  getPropertyTypes);
router.put("/api/update/property-type/:id", checkAuthorization, isAdmin,updatePropertyType);    
router.delete("/api/delete/property-type/:id", checkAuthorization, isAdmin, deletePropertyType);


module.exports = router;
