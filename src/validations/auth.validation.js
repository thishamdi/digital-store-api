import Joi from 'joi';

export const mobileSchema = Joi.string()
    .pattern(/^\+?[1-9]\d{1,14}$/)
    .message('Invalid E.164 mobile number');

export const registerSchema = Joi.object({
    username: Joi.string().min(3).max(30).required(),
    email: Joi.string().email(),
    mobile: mobileSchema,
    password: Joi.string().min(8).required()
}).or('email', 'mobile');

export const loginSchema = Joi.object({
    email: Joi.string().email(),
    mobile: mobileSchema,
    password: Joi.string().required()
}).or('email', 'mobile');

export const verifyEmailSchema = Joi.object({
    otp: Joi.string().length(6).required()
});

export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string().min(8).required()
});