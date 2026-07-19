import personalDetails from "../Models/personalDetails.model.js";


/**
 * GET contact number by userId
 * GET /api/personal-details/contact/:userId
 */
export const getContactNumber = async (req, res) => {
  try {
    const { userId } = req.params;

    const details = await personalDetails.findOne({
      where: { userId },
      attributes: ["contactNumber"],
    });

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Personal details not found",
      });
    }

    res.status(200).json({
      success: true,
      contactNumber: details.contactNumber,
    });
  } catch (error) {
    console.error("Get contact number error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * UPDATE contact number by userId
 * PUT /api/personal-details/contact/:userId
 */
export const updateContactNumber = async (req, res) => {
  try {
    const { userId } = req.params;
    const { contactNumber } = req.body;

    if (!contactNumber || contactNumber.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "Contact number must be 10 digits",
      });
    }

    const details = await personalDetails.findOne({
      where: { userId },
    });

    if (!details) {
      return res.status(404).json({
        success: false,
        message: "Personal details not found",
      });
    }

    details.contactNumber = contactNumber;
    await details.save();

    res.status(200).json({
      success: true,
      message: "Contact number updated successfully",
      contactNumber: details.contactNumber,
    });
  } catch (error) {
    console.error("Update contact number error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
