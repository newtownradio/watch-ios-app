"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const httpTrigger = function (context, req) {
    return __awaiter(this, void 0, void 0, function* () {
        context.log('HTTP trigger function processed a request.');
        // Set CORS headers
        context.res = {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
        };
        // Handle preflight requests
        if (req.method === 'OPTIONS') {
            context.res.status = 200;
            return;
        }
        if (req.method !== 'POST') {
            context.res = {
                status: 405,
                body: { error: 'Method not allowed' }
            };
            return;
        }
        try {
            const { email, code } = req.body;
            if (!email || !code) {
                context.res = {
                    status: 400,
                    body: { error: 'Email and code are required' }
                };
                return;
            }
            // Send email via Resend
            const result = yield resend.emails.send({
                from: 'noreply@watch.style',
                to: email,
                subject: 'Password Reset - Watch.Style',
                html: generatePasswordResetEmailHTML(code),
                text: generatePasswordResetEmailText(code)
            });
            context.log('Email sent successfully:', result);
            context.res = {
                status: 200,
                body: {
                    success: true,
                    message: 'Password reset email sent successfully',
                    data: result
                }
            };
        }
        catch (error) {
            context.log.error('Failed to send email:', error);
            context.res = {
                status: 500,
                body: {
                    error: 'Failed to send email',
                    details: error.message
                }
            };
        }
    });
};
function generatePasswordResetEmailHTML(code) {
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - Watch.Style</title>
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: #1e3a8a; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
                .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
                .code { background: #1e3a8a; color: white; font-size: 24px; font-weight: bold; padding: 15px; text-align: center; border-radius: 6px; margin: 20px 0; letter-spacing: 3px; }
                .footer { text-align: center; margin-top: 30px; color: #666; font-size: 14px; }
                .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Watch.Style</h1>
                    <h2>Password Reset Request</h2>
                </div>
                <div class="content">
                    <p>You requested a password reset for your Watch.Style account.</p>
                    
                    <p>Use the verification code below to reset your password:</p>
                    
                    <div class="code">${code}</div>
                    
                    <div class="warning">
                        <strong>Important:</strong>
                        <ul>
                            <li>This code will expire in 10 minutes</li>
                            <li>If you didn't request this reset, please ignore this email</li>
                            <li>Never share this code with anyone</li>
                        </ul>
                    </div>
                    
                    <p>If you have any questions, please contact our support team.</p>
                </div>
                <div class="footer">
                    <p>&copy; 2024 Watch.Style. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;
}
function generatePasswordResetEmailText(code) {
    return `
Password Reset - Watch.Style

You requested a password reset for your Watch.Style account.

Use the verification code below to reset your password:

${code}

IMPORTANT:
- This code will expire in 10 minutes
- If you didn't request this reset, please ignore this email
- Never share this code with anyone

If you have any questions, please contact our support team.

© 2024 Watch.Style. All rights reserved.
    `;
}
exports.default = httpTrigger;
//# sourceMappingURL=index.js.map