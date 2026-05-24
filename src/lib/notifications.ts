type AlertPayload = {
  businessName: string;
  restaurantName: string;
  rating: number;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  feedbackMessage?: string | null;
};

export async function sendLowRatingAlerts(payload: AlertPayload): Promise<void> {
  const whatsappNumber = process.env.WHATSAPP_ALERT_NUMBER;
  const alertEmail = process.env.ALERT_EMAIL_TO;

  const text = [
    `Low rating alert — ${payload.businessName}`,
    `Restaurant: ${payload.restaurantName}`,
    `Rating: ${payload.rating}/5`,
    `Customer: ${payload.customerName}`,
    `Phone: ${payload.customerPhone ?? "N/A"}`,
    `Email: ${payload.customerEmail ?? "N/A"}`,
    `Message: ${payload.feedbackMessage ?? "N/A"}`,
  ].join("\n");

  if (whatsappNumber) {
    const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;
    console.info("[whatsapp-alert]", url);
  }

  if (alertEmail && process.env.SMTP_HOST) {
    console.info("[email-alert]", alertEmail, text);
  }
}
