// ✅ Copy-paste ready JavaScript (CommonJS-friendly too)
// Email-client safe (tables + inline CSS), user-friendly UI, secure escaping
// Works in Node.js (Express/Nest/etc). If you use ESM, just use export instead of module.exports.

const BRAND = {
  name: "Rudraksha",
  primary: "#8B5CF6", // Vibrant Violet
  primaryDark: "#7C3AED",
  accent: "#F59E0B", // Warm Amber
  bg: "#FAFAFA",
  white: "#FFFFFF",
  text: "#1F2937",
  muted: "#6B7280",
  border: "#E5E7EB",
  success: "#10B981",
  error: "#EF4444",
};

const STYLES = `
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
    .container { max-width: 600px; margin: 0 auto; background-color: ${BRAND.white}; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    .content { padding: 40px 30px; }
    .footer { padding: 30px; text-align: center; background-color: ${BRAND.bg}; border-top: 1px solid ${BRAND.border}; }
    .btn { display: inline-block; padding: 14px 28px; background-color: ${BRAND.primary}; color: ${BRAND.white} !important; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
    .text-sm { font-size: 14px; color: ${BRAND.muted}; }
    .text-lg { font-size: 18px; font-weight: 600; color: ${BRAND.text}; }
    .h1 { font-size: 24px; font-weight: 700; color: ${BRAND.white}; margin: 0; }
    .divider { height: 1px; background-color: ${BRAND.border}; margin: 24px 0; }
`;

function safeText(v) {
  const s = String(v ?? "");
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNPR(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "0";
  try {
    return new Intl.NumberFormat("en-US").format(n);
  } catch (e) {
    return String(n);
  }
}

function getTotalAmount(order) {
  // supports your previous typo totalAmout
  return Number(order?.totalAmount ?? order?.totalAmout ?? 0);
}

function getShippingFee(order) {
  return Number(order?.shippingFee ?? 0);
}

function calcEstimatedDelivery(order) {
  const createdAt = order?.createdAt ? new Date(order.createdAt) : new Date();
  const days =
    order?.shippingLocation === "insideKathmandu"
      ? 3
      : order?.shippingLocation === "outsideKathmandu"
        ? 7
        : 14;

  const d = new Date(createdAt);
  d.setDate(d.getDate() + days);
  return d;
}

function bulletproofButton(href, label, color) {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto;">
      <tr>
        <td align="center" bgcolor="${color}" style="border-radius:8px;">
          <a href="${safeText(href)}"
             style="display:inline-block;padding:14px 22px;font-family:Segoe UI,Arial,sans-serif;
             font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:8px;">
            ${safeText(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

function wrapper({ title, preheader, body, footerNote }) {
  return `
  <!doctype html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="x-apple-disable-message-reformatting" />
    <title>${safeText(title)}</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      ${STYLES}
      @media only screen and (max-width: 600px) {
        .container { width: 100% !important; border-radius: 0 !important; }
        .content { padding: 30px 20px !important; }
      }
    </style>
  </head>
  <body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:'Inter', sans-serif;">
    <div style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
      ${safeText(preheader)}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
    </div>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};">
      <tr>
        <td align="center" style="padding:40px 10px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="container" style="max-width:600px;background-color:${BRAND.white};border-radius:16px;overflow:hidden;border:1px solid ${BRAND.border};">
            ${body}
            <tr>
              <td class="footer">
                <p style="margin:0;font-size:14px;line-height:21px;color:${BRAND.muted};">
                  ${footerNote
      ? footerNote
      : `&copy; ${new Date().getFullYear()} <strong>${safeText(BRAND.name)}</strong>. All rights reserved.`
    }
                </p>
                <div style="margin-top:20px;">
                    <a href="#" style="text-decoration:none;margin:0 10px;color:${BRAND.muted};font-size:12px;">Privacy Policy</a>
                    <a href="#" style="text-decoration:none;margin:0 10px;color:${BRAND.muted};font-size:12px;">Terms of Service</a>
                </div>
              </td>
            </tr>
          </table>
          <p style="margin:24px 0 0 0;font-size:12px;color:${BRAND.muted};text-align:center;">
              Sent by ${safeText(BRAND.name)} • Kathmandu, Nepal
          </p>
        </td>
      </tr>
    </table>
  </body>
  </html>
    `;
}

// ------------------------------------------------------------
// ✅ ORDER CONFIRMATION TEMPLATE
// ------------------------------------------------------------
export function getOrderConfirmationTemplate(order) {
  const products = Array.isArray(order?.products) ? order.products : [];
  const totalAmount = getTotalAmount(order);
  const shippingFee = getShippingFee(order);
  const subtotal = Math.max(totalAmount - shippingFee, 0);

  const estimatedDelivery = calcEstimatedDelivery(order);
  const orderDate = order?.createdAt ? new Date(order.createdAt) : new Date();

  const productRows =
    products.length > 0
      ? products
        .map((item) => {
          const name = safeText(item?.name || "Product");
          const variant = item?.variant ? safeText(item.variant) : "";
          const size = item?.size ? safeText(item.size) : "";
          const qty = Number(item?.quantity ?? 1);
          const price = Number(item?.price ?? 0);
          const lineTotal = Number(item?.total ?? price * qty);

          return `
              <tr>
                <td style="padding:16px 0;border-bottom:1px solid ${BRAND.border};">
                  <div style="font-weight:600;color:${BRAND.text};font-size:15px;">${name}</div>
                  ${variant || size ? `<div style="font-size:13px;color:${BRAND.muted};margin-top:2px;">${[variant, size].filter(Boolean).join(" • ")}</div>` : ""}
                </td>
                <td style="padding:16px 10px;border-bottom:1px solid ${BRAND.border};text-align:center;color:${BRAND.text};font-size:14px;">
                  ×${qty}
                </td>
                <td style="padding:16px 0;border-bottom:1px solid ${BRAND.border};text-align:right;color:${BRAND.text};font-size:15px;font-weight:600;">
                  Rs. ${formatNPR(lineTotal)}
                </td>
              </tr>
            `;
        })
        .join("")
      : `
              <tr>
                <td colspan="3" style="padding:24px 0;text-align:center;color:${BRAND.muted};font-size:14px;">
                  No items found for this order.
                </td>
              </tr>
            `;

  const address = order?.deliveryAddress || {};
  const fullname = safeText(order?.fullname || "Customer");
  const city = safeText(address?.city || "");
  const street = safeText(address?.street || "");
  const paymentMethod = safeText(order?.paymentMethod || "N/A");
  const paymentStatus = safeText(order?.paymentStatus || "Pending");
  const paymentColor = order?.paymentStatus === "Paid" ? BRAND.success : BRAND.accent;

  const orderId = safeText(order?.orderId || "—");
  const trackUrl = safeText(order?.trackUrl || "#");

  return wrapper({
    title: "Order Confirmed",
    preheader: `We've received your order ${orderId}. Estimated delivery: ${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
    body: `
      <tr>
        <td class="content">
          <p style="margin:0 0 20px 0;font-size:16px;line-height:24px;color:${BRAND.text};">
            Hello <strong>${fullname}</strong>,
          </p>
          <p style="margin:0 0 30px 0;font-size:15px;line-height:24px;color:${BRAND.muted};">
            Your order has been successfully placed with <strong>${paymentMethod}</strong> (Status: <strong>${paymentStatus}</strong>). We're currently processing it and will notify you as soon as it's shipped.
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};border-radius:12px;margin-bottom:30px;">
            <tr>
              <td style="padding:24px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-bottom:12px;">
                       <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};margin-bottom:4px;">Order Number</div>
                       <div style="font-size:16px;font-weight:700;color:${BRAND.text};">${orderId}</div>
                    </td>
                    <td style="padding-bottom:12px;text-align:right;">
                       <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};margin-bottom:4px;">Order Date</div>
                       <div style="font-size:15px;color:${BRAND.text};">${orderDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</div>
                    </td>
                  </tr>
                  <tr>
                    <td style="border-top:1px solid ${BRAND.border};padding-top:12px;">
                       <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};margin-bottom:4px;">Estimated Delivery</div>
                       <div style="font-size:15px;font-weight:600;color:${BRAND.primary};">${estimatedDelivery.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</div>
                    </td>
                    <td style="border-top:1px solid ${BRAND.border};padding-top:12px;text-align:right;">
                       <div style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};margin-bottom:4px;">Status</div>
                       <div style="font-size:14px;font-weight:700;color:${paymentColor};text-transform:uppercase;">${paymentStatus}</div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <div style="font-size:18px;font-weight:700;color:${BRAND.text};margin-bottom:16px;">Order Summary</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
            <thead>
              <tr>
                <th align="left" style="padding-bottom:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};border-bottom:1px solid ${BRAND.border};">Items</th>
                <th align="center" style="padding-bottom:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};border-bottom:1px solid ${BRAND.border};">Qty</th>
                <th align="right" style="padding-bottom:12px;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:${BRAND.muted};border-bottom:1px solid ${BRAND.border};">Price</th>
              </tr>
            </thead>
            <tbody>
              ${productRows}
            </tbody>
          </table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:30px;">
            <tr>
              <td style="padding:6px 0;font-size:15px;color:${BRAND.muted};">Subtotal</td>
              <td style="padding:6px 0;font-size:15px;color:${BRAND.text};text-align:right;">Rs. ${formatNPR(subtotal)}</td>
            </tr>
            ${shippingFee ? `
            <tr>
              <td style="padding:6px 0;font-size:15px;color:${BRAND.muted};">Shipping Fee</td>
              <td style="padding:6px 0;font-size:15px;color:${BRAND.text};text-align:right;">Rs. ${formatNPR(shippingFee)}</td>
            </tr>
            ` : ""}
            ${order?.discountAmount ? `
            <tr>
              <td style="padding:6px 0;font-size:15px;color:${BRAND.success};">Discount</td>
              <td style="padding:6px 0;font-size:15px;color:${BRAND.success};text-align:right;">- Rs. ${formatNPR(order.discountAmount)}</td>
            </tr>
            ` : ""}
            <tr>
              <td style="padding:16px 0 0 0;border-top:2px solid ${BRAND.text};font-size:18px;font-weight:700;color:${BRAND.text};">Total</td>
              <td style="padding:16px 0 0 0;border-top:2px solid ${BRAND.text};font-size:20px;font-weight:800;color:${BRAND.primary};text-align:right;">Rs. ${formatNPR(totalAmount)}</td>
            </tr>
          </table>

          <p style="text-align:center;font-size:14px;color:${BRAND.muted};margin:30px 0;">
            ${trackUrl !== "#" ? `You can track your order here: <br/><a href="${trackUrl}" style="color:${BRAND.primary};font-weight:600;">${trackUrl}</a>` : ""}
          </p>

          <div style="background-color:#FFFBEB;border:1px solid #FEF3C7;border-radius:12px;padding:20px;text-align:center;">
            <p style="margin:0;font-size:14px;color:#92400E;line-height:21px;">
              <strong>Shipping to:</strong><br/>
              ${street}${city ? `, ${city}` : ""}<br/>
              Phone: ${order?.phone || "N/A"}
            </p>
          </div>
        </td>
      </tr>
    `,
  });
}

// ------------------------------------------------------------
// ✅ ORDER STATUS UPDATE TEMPLATE
// ------------------------------------------------------------
export function getOrderStatusUpdateTemplate(order) {
  const status = String(order?.orderStatus || "Updated");

  let statusColor = BRAND.text;
  let statusIcon = "📦";
  let statusMessage = "Your order status has been updated.";
  let statusBg = BRAND.bg;

  if (status === "Delivered") {
    statusColor = BRAND.success;
    statusIcon = "🎉";
    statusMessage = "Great news! Your order has been delivered.";
    statusBg = "#ECFDF5";
  } else if (status === "Cancelled") {
    statusColor = BRAND.error;
    statusIcon = "✕";
    statusMessage = "Your order has been cancelled.";
    statusBg = "#FEF2F2";
  } else if (status === "Shipped") {
    statusColor = "#3B82F6"; // Blue
    statusIcon = "🚚";
    statusMessage = "Your order is on its way!";
    statusBg = "#EFF6FF";
  } else if (status === "Processing") {
    statusColor = BRAND.accent;
    statusIcon = "⏳";
    statusMessage = "We're preparing your order for shipment.";
    statusBg = "#FFFBEB";
  }

  const fullname = safeText(order?.fullname || "Customer");
  const orderId = safeText(order?.orderId || "—");
  const totalAmount = getTotalAmount(order);
  const paymentMethod = safeText(order?.paymentMethod || "N/A");
  const city = safeText(order?.deliveryAddress?.city || "");
  const viewUrl = safeText(order?.viewUrl || "#");

  return wrapper({
    title: "Order Status Updated",
    preheader: `Order ${orderId}: ${status}.`,
    body: `
      <tr>
        <td class="content">
          <p style="margin:0 0 16px 0;font-size:16px;color:${BRAND.text};">
            Hello <strong>${fullname}</strong>,
          </p>
          <p style="margin:0 0 30px 0;font-size:15px;line-height:24px;color:${BRAND.muted};">
            Your order status has been updated to <strong>${status}</strong>. ${safeText(statusMessage)}
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BRAND.border};border-radius:12px;margin-bottom:30px;overflow:hidden;">
            <tr>
              <td style="padding:20px;background-color:${BRAND.bg};border-bottom:1px solid ${BRAND.border};">
                 <div style="font-weight:700;color:${BRAND.text};">Order Details</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Order Number</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;font-weight:600;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Total Amount</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;font-weight:600;">Rs. ${formatNPR(totalAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Payment Method</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Shipping to</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;max-width:200px;">${city}${order?.deliveryAddress?.street ? `, ${safeText(order.deliveryAddress.street)}` : ""}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;color:${BRAND.muted};">Phone</td>
                    <td style="font-size:14px;color:${BRAND.text};text-align:right;">${safeText(order?.phone || "N/A")}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

        </td>
      </tr>
    `,
  });
}

// ------------------------------------------------------------
// ✅ PAYMENT STATUS UPDATE TEMPLATE
// ------------------------------------------------------------
export function getPaymentStatusUpdateTemplate(order) {
  const status = String(order?.paymentStatus || "Updated");
  const totalAmount = getTotalAmount(order);
  const orderId = safeText(order?.orderId || "—");
  const fullname = safeText(order?.fullname || "Customer");
  const paymentMethod = safeText(order?.paymentMethod || "N/A");

  let statusColor = BRAND.text;
  let statusIcon = "💳";
  let statusMessage = "Your payment status has been updated.";
  let statusBg = BRAND.bg;

  if (status === "Paid") {
    statusColor = BRAND.success;
    statusIcon = "💰";
    statusMessage = "Payment successful! We've received your payment.";
    statusBg = "#ECFDF5";
  } else if (status === "Failed") {
    statusColor = BRAND.error;
    statusIcon = "⚠️";
    statusMessage = "Your last payment attempt was unsuccessful.";
    statusBg = "#FEF2F2";
  } else if (status === "Refunded") {
    statusColor = "#3B82F6"; // Blue
    statusIcon = "🔄";
    statusMessage = "Your payment has been successfully refunded.";
    statusBg = "#EFF6FF";
  }

  return wrapper({
    title: "Payment Status Updated",
    preheader: `Update for Order ${orderId}: Payment is ${status}.`,
    body: `
      <tr>
        <td class="content">
          <p style="margin:0 0 16px 0;font-size:16px;color:${BRAND.text};">
            Hello <strong>${fullname}</strong>,
          </p>
          <p style="margin:0 0 30px 0;font-size:15px;line-height:24px;color:${BRAND.muted};">
            The payment status for your order has been updated to <strong>${status}</strong>. ${safeText(statusMessage)}
          </p>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid ${BRAND.border};border-radius:12px;margin-bottom:30px;overflow:hidden;">
            <tr>
              <td style="padding:20px;background-color:${BRAND.bg};border-bottom:1px solid ${BRAND.border};">
                 <div style="font-weight:700;color:${BRAND.text};">Transaction Summary</div>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Order Number</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;font-weight:600;">${orderId}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Amount Paid</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;font-weight:600;">Rs. ${formatNPR(totalAmount)}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Payment Method</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;">${paymentMethod}</td>
                  </tr>
                  <tr>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.muted};">Shipping to</td>
                    <td style="padding-bottom:10px;font-size:14px;color:${BRAND.text};text-align:right;max-width:200px;">${safeText(order?.deliveryAddress?.city || "")}${order?.deliveryAddress?.street ? `, ${safeText(order.deliveryAddress.street)}` : ""}</td>
                  </tr>
                  <tr>
                    <td style="font-size:14px;color:${BRAND.muted};">Phone</td>
                    <td style="font-size:14px;color:${BRAND.text};text-align:right;">${safeText(order?.phone || "N/A")}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="text-align:center;font-size:14px;color:${BRAND.muted};">
            If you have any questions regarding this transaction, please contact our support team.
          </p>
        </td>
      </tr>
    `,
  });
}

// ------------------------------------------------------------
export function getOtpTemplate(otp, type) {
  const purpose = safeText(type || "your request");
  const code = safeText(otp || "");

  return wrapper({
    title: "Verification Code",
    preheader: `Your verification code for ${purpose}: ${code}.`,
    body: `
      <tr>
        <td class="content" style="text-align:center;">
          <p style="margin:0 0 10px 0;font-size:16px;color:${BRAND.text};">
            Hello,
          </p>
          <p style="margin:0 0 30px 0;font-size:15px;line-height:24px;color:${BRAND.muted};">
            You've requested a verification code for <strong>${purpose}</strong>. Please use the code below to proceed.
          </p>

          <div style="background-color:${BRAND.bg};border:2px dashed ${BRAND.primary};border-radius:16px;padding:30px;margin-bottom:30px;">
            <div style="font-size:12px;text-transform:uppercase;letter-spacing:2px;color:${BRAND.muted};margin-bottom:16px;">Your Secure Code</div>
            <div style="font-size:42px;font-weight:800;color:${BRAND.primary};letter-spacing:10px;">${code}</div>
          </div>

          <p style="margin:0 0 30px 0;font-size:14px;color:${BRAND.muted};">
            This code will expire in 10 minutes. For your security, never share this code with anyone.
          </p>

          <div style="background-color:#F9FAFB;border-radius:12px;padding:16px;">
            <p style="margin:0;font-size:13px;color:${BRAND.muted};line-height:20px;">
              Didn't request this? You can safely ignore this email. Someone may have entered your email address by mistake.
            </p>
          </div>
        </td>
      </tr>
    `,
  });
}


