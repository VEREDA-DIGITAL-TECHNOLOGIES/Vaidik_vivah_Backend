import Contact from "../Models/Contact.js";
import errorhandler from "../Utils/errorhandler.js";
import { catchAsyncError } from "../Middlewares/catchAsyncError.js";

// ===== USER =====

// Create a new contact
export const createContact = catchAsyncError(async (req, res, next) => {
    const { name, mobile, email, message } = req.body;

    if (!name || !mobile || !email || !message) {
        return next(new errorhandler("All fields are required!", 400));
    }

    const contact = await Contact.create({ name, mobile, email, message });

    return res.status(201).json({
        success: true,
        message: "Contact submitted successfully!",
        data: contact
    });
});

// ===== ADMIN =====

// Get all contacts
export const getAllContacts = catchAsyncError(async (req, res, next) => {
    const contacts = await Contact.findAll({ order: [["createdAt", "DESC"]] });
    return res.status(200).json({ success: true, data: contacts });
});

// Get single contact by ID from body
export const getContactById = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;

    if (!id) return next(new errorhandler("Contact ID is required!", 400));

    const contact = await Contact.findByPk(id);
    if (!contact) return next(new errorhandler("Contact not found!", 404));

    return res.status(200).json({ success: true, data: contact });
});

// Delete contact by ID from body
export const deleteContact = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;

    if (!id) return next(new errorhandler("Contact ID is required!", 400));

    const contact = await Contact.findByPk(id);
    if (!contact) return next(new errorhandler("Contact not found!", 404));

    await contact.destroy();

    return res.status(200).json({ success: true, message: "Contact deleted successfully!" });
});

// Mark contact as contacted back by ID from body
export const markContactedBack = catchAsyncError(async (req, res, next) => {
    const { id } = req.body;

    if (!id) return next(new errorhandler("Contact ID is required!", 400));

    const contact = await Contact.findByPk(id);
    if (!contact) return next(new errorhandler("Contact not found!", 404));

    contact.contactedBack = true;
    await contact.save();

    return res.status(200).json({
        success: true,
        message: "Contact marked as contacted back!",
        data: contact
    });
});
