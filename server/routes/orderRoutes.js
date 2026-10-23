const express = require("express");
const {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  updateStatus,
  addPayment,
  deleteOrder,
} = require("../controllers/orderController");
const { uploadPhoto, getPhoto } = require("../controllers/photoController");
const { protect, ownerOnly } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.get("/", getOrders);
router.post("/", ownerOnly, createOrder);
router.get("/:id", getOrder);
router.put("/:id", ownerOnly, updateOrder);
router.delete("/:id", ownerOnly, deleteOrder);
router.patch("/:id/status", updateStatus);
router.post("/:id/payments", ownerOnly, addPayment);
router.post("/:id/photo", ownerOnly, upload.single("photo"), uploadPhoto);
router.get("/:id/photo", getPhoto);

module.exports = router;
