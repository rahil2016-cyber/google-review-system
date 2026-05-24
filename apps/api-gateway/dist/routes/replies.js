import { Router } from "express";
import { z } from "zod";
export const repliesRouter = Router();
const suggestSchema = z.object({
    businessName: z.string().default("our team"),
    customerName: z.string().optional(),
    rating: z.number().int().min(1).max(5),
    reason: z.string().optional(),
    comments: z.string().optional(),
    tone: z.enum(["professional", "friendly"]).default("professional"),
});
repliesRouter.post("/suggest", (req, res) => {
    const parsed = suggestSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: "VALIDATION_ERROR", message: parsed.error.issues[0]?.message });
        return;
    }
    const { businessName, customerName, rating, reason, comments, tone } = parsed.data;
    const namePart = customerName ? ` ${customerName}` : "";
    let reply = "";
    if (rating <= 3) {
        reply =
            tone === "friendly"
                ? `Hi${namePart}, thank you for sharing your feedback. We are sorry your experience was not up to the mark. We have noted your concern${reason ? ` about ${reason.toLowerCase()}` : ""} and our team at ${businessName} will work on this immediately. Please give us one more chance to serve you better.`
                : `Dear${namePart}, thank you for your feedback. We sincerely apologize that your experience did not meet expectations. We have recorded your concern${reason ? ` regarding ${reason.toLowerCase()}` : ""}${comments ? ` (${comments.slice(0, 120)})` : ""} and the ${businessName} team will take corrective action. We value your input and hope to serve you better on your next visit.`;
    }
    else {
        reply =
            tone === "friendly"
                ? `Hi${namePart}, thank you so much for your kind review. We're delighted you had a great experience with ${businessName}. Your support means a lot to us, and we look forward to welcoming you again soon!`
                : `Dear${namePart}, thank you for your positive review. We are pleased to know you had a great experience with ${businessName}. Your encouragement motivates our team to maintain high standards. We look forward to serving you again.`;
    }
    res.json({ reply });
});
