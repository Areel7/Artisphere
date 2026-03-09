import { check } from "express-validator";

export const registerValidation = [
  check("username").not().isEmpty().withMessage("Username is required"),

  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail({ gmail_remove_dots: true }),

  check("password")
    .not()
    .isEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
];

export const loginValidation = [
  check("email")
    .not()
    .isEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail({ gmail_remove_dots: true }),

  check("password").not().isEmpty().withMessage("Password is required"),
];
