"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFeedback = exports.incrementRating = exports.submitFeedback = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
const params_1 = require("firebase-functions/params");
const cors_1 = __importDefault(require("cors"));
const nodemailer_1 = __importDefault(require("nodemailer"));
admin.initializeApp();
const db = admin.firestore();
const corsHandler = (0, cors_1.default)({ origin: true });
const mailHost = (0, params_1.defineString)("MAIL_HOST");
const mailPort = (0, params_1.defineString)("MAIL_PORT");
const mailUser = (0, params_1.defineString)("MAIL_USER");
const mailPass = (0, params_1.defineString)("MAIL_PASS");
const alertTo = (0, params_1.defineString)("ALERT_TO_EMAIL");
const adminKey = (0, params_1.defineString)("ADMIN_KEY");
exports.submitFeedback = (0, https_1.onRequest)(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== "POST") {
                res.status(405).send("Method not allowed");
                return;
            }
            const { rating, name, phone, email, reason, comments } = req.body;
            if (!rating || !name || !phone || !reason) {
                res.status(400).send("Missing required fields");
                return;
            }
            const payload = {
                rating,
                name,
                phone,
                email: email ?? "",
                reason,
                comments: comments ?? "",
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
            };
            await db.collection("feedback").add(payload);
            if (rating <= 3) {
                const transporter = nodemailer_1.default.createTransport({
                    host: mailHost.value(),
                    port: Number(mailPort.value()),
                    secure: Number(mailPort.value()) === 465,
                    auth: {
                        user: mailUser.value(),
                        pass: mailPass.value(),
                    },
                });
                await transporter.sendMail({
                    from: mailUser.value(),
                    to: alertTo.value(),
                    subject: `Low Rating Alert (${rating}/5) - Sarovar Royalee`,
                    text: [
                        `Rating: ${rating}`,
                        `Name: ${name}`,
                        `Phone: ${phone}`,
                        `Email: ${email || "N/A"}`,
                        `Reason: ${reason}`,
                        `Comments: ${comments || "N/A"}`,
                    ].join("\n"),
                });
            }
            res.status(200).json({ ok: true });
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Failed to submit feedback");
        }
    });
});
exports.incrementRating = (0, https_1.onRequest)(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== "POST") {
                res.status(405).send("Method not allowed");
                return;
            }
            const rating = Number(req.body?.rating);
            if (!rating || rating < 1 || rating > 5) {
                res.status(400).send("Invalid rating");
                return;
            }
            const ref = db.collection("analytics").doc("ratings");
            await ref.set({ [rating]: admin.firestore.FieldValue.increment(1), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
            res.status(200).json({ ok: true });
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Failed to increment rating");
        }
    });
});
exports.getFeedback = (0, https_1.onRequest)(async (req, res) => {
    return corsHandler(req, res, async () => {
        try {
            if (req.method !== "POST") {
                res.status(405).send("Method not allowed");
                return;
            }
            if (req.headers["x-admin-key"] !== adminKey.value()) {
                res.status(401).send("Unauthorized");
                return;
            }
            const ratingFilter = req.body?.rating ? Number(req.body.rating) : undefined;
            let query = db.collection("feedback").orderBy("timestamp", "desc").limit(200);
            if (ratingFilter && [1, 2, 3].includes(ratingFilter)) {
                query = db.collection("feedback").where("rating", "==", ratingFilter).orderBy("timestamp", "desc");
            }
            const snapshot = await query.get();
            const entries = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    rating: data.rating,
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    reason: data.reason,
                    comments: data.comments,
                    timestamp: data.timestamp?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
                };
            });
            res.status(200).json({ entries });
        }
        catch (error) {
            console.error(error);
            res.status(500).send("Failed to fetch feedback");
        }
    });
});
//# sourceMappingURL=index.js.map