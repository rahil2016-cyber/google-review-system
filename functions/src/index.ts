import * as admin from "firebase-admin";
import { onRequest } from "firebase-functions/v2/https";
import { defineString } from "firebase-functions/params";
import cors from "cors";
import nodemailer from "nodemailer";

admin.initializeApp();
const db = admin.firestore();
const corsHandler = cors({ origin: true });

const mailHost = defineString("MAIL_HOST");
const mailPort = defineString("MAIL_PORT");
const mailUser = defineString("MAIL_USER");
const mailPass = defineString("MAIL_PASS");
const alertTo = defineString("ALERT_TO_EMAIL");
const adminKey = defineString("ADMIN_KEY");

type FeedbackInput = {
  rating: number;
  name: string;
  phone: string;
  email?: string;
  reason: string;
  comments: string;
};

export const submitFeedback = onRequest(async (req, res) => {
  return corsHandler(req, res, async () => {
    try {
      if (req.method !== "POST") {
        res.status(405).send("Method not allowed");
        return;
      }

      const { rating, name, phone, email, reason, comments } = req.body as FeedbackInput;
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
        const transporter = nodemailer.createTransport({
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
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to submit feedback");
    }
  });
});

export const incrementRating = onRequest(async (req, res) => {
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
      await ref.set(
        { [rating]: admin.firestore.FieldValue.increment(1), updatedAt: admin.firestore.FieldValue.serverTimestamp() },
        { merge: true }
      );

      res.status(200).json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to increment rating");
    }
  });
});

export const getFeedback = onRequest(async (req, res) => {
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
      let query: FirebaseFirestore.Query = db.collection("feedback").orderBy("timestamp", "desc").limit(200);
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
    } catch (error) {
      console.error(error);
      res.status(500).send("Failed to fetch feedback");
    }
  });
});
