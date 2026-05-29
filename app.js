const express = require("express");
const path = require("path");
require("dotenv").config();

const { initializeApp, applicationDefault, cert, getApps } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const app = express();
const MERCADO_PAGO_API_URL = "https://api.mercadopago.com/v1/payments";
const MERCADO_PAGO_MERCHANT_ORDER_URL = "https://api.mercadopago.com/merchant_orders";

function mapMercadoPagoStatus(status) {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "approved") {
        return "ok";
    }
    if (["pending", "in_process", "authorized", "in_process"].includes(normalized)) {
        return "pending";
    }
    if (["rejected", "cancelled", "refunded", "charged_back"].includes(normalized)) {
        return "failed";
    }
    return normalized || "pending";
}

function getFirebaseCredential() {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
        const serviceAccount = JSON.parse(
            Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, "base64").toString("utf8")
        );
        return cert(serviceAccount);
    }

    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        const serviceAccountPath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
        return cert(require(serviceAccountPath));
    }

    return applicationDefault();
}

if (!getApps().length) {
    initializeApp({
        credential: getFirebaseCredential(),
        projectId: process.env.FIREBASE_PROJECT_ID || "ibnov-fabbd"
    });
}

const db = getFirestore();

app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.post(["/api/doacoes/pix", "/doacoes/pix"], async (req, res) => {
    try {
        const nome = String(req.body.nome || "").trim();
        const email = String(req.body.email || "").trim();
        const mensagem = String(req.body.mensagem || "").trim();
        const valor = Number(req.body.valor);

        if (!nome || !email || !Number.isFinite(valor) || valor <= 0) {
            return res.status(400).json({
                error: "Informe nome, email e um valor de doacao valido."
            });
        }

        if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
            return res.status(500).json({
                error: "Token do Mercado Pago nao configurado no servidor."
            });
        }

        const doacaoRef = db.collection("doacoes").doc();
        const doacaoId = doacaoRef.id;

        await doacaoRef.set({
            nome,
            email,
            valor,
            mensagem,
            dataHora: FieldValue.serverTimestamp(),
            status: "pendente",
            transactionId: "",
            metodoPagamento: "pix"
        });

        const body = {
            transaction_amount: valor,
            description: `Doacao IBNOV - ${nome}`,
            payment_method_id: "pix",
            payer: {
                email,
                first_name: nome
            },
            external_reference: doacaoId,
            metadata: {
                doacaoId,
                nome,
                mensagem
            }
        };

        const rawBaseUrl = process.env.PUBLIC_BASE_URL?.trim() || `${req.get("x-forwarded-proto") || req.protocol}://${req.get("host")}`;
        const publicBaseUrl = rawBaseUrl ? rawBaseUrl.replace(/\/+$/, "") : "";

        if (publicBaseUrl) {
            body.notification_url = `${publicBaseUrl}/api/mercadopago/webhook`;
            console.log("Mercado Pago notification_url:", body.notification_url);
        } else {
            console.warn("PUBLIC_BASE_URL não definido e host não disponível. Webhook do Mercado Pago pode falhar.");
        }

        const mpResponse = await fetch(MERCADO_PAGO_API_URL, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
                "X-Idempotency-Key": doacaoId
            },
            body: JSON.stringify(body)
        });

        const payment = await mpResponse.json();

        if (!mpResponse.ok) {
            await doacaoRef.update({
                status: "erro",
                erroMercadoPago: payment.message || "Erro ao criar pagamento Pix"
            });

            return res.status(mpResponse.status).json({
                error: payment.message || "Erro ao criar pagamento Pix."
            });
        }

        const paymentStatus = mapMercadoPagoStatus(payment.status);

        console.log("Mercado Pago create payment:", {
            paymentId: payment.id,
            paymentStatus: payment.status,
            mappedStatus: paymentStatus,
            externalReference: doacaoId
        });

        await doacaoRef.update({
            transactionId: String(payment.id),
            status: paymentStatus
        });
        const transactionData = payment.point_of_interaction?.transaction_data || {};

        return res.status(201).json({
            doacaoId,
            transactionId: String(payment.id),
            status: paymentStatus,
            qrCode: transactionData.qr_code,
            qrCodeBase64: transactionData.qr_code_base64,
            ticketUrl: transactionData.ticket_url
        });
    } catch (error) {
        console.error("Erro ao criar Pix:", error);
        return res.status(500).json({ error: "Erro interno ao criar Pix." });
    }
});

app.post(["/api/mercadopago/webhook", "/mercadopago/webhook"], async (req, res) => {
    try {
        const body = req.body || {};
        const eventType = body?.type || body?.topic || req.query.type || req.query.topic;
        const normalizedEventType = String(eventType || "").toLowerCase();
        const acceptedEvents = [
            "payment",
            "payment.created",
            "payment.updated",
            "merchant_order",
            "merchant_order.created",
            "merchant_order.updated"
        ];
        const eventId = body?.data?.id || body?.data?.object?.id || body?.id || req.query.id || req.query["data.id"];
        const isMerchantOrderEvent = normalizedEventType.includes("merchant_order");

        console.log("Mercado Pago webhook received", {
            eventType: normalizedEventType,
            eventId,
            isMerchantOrderEvent,
            body: body
        });

        res.sendStatus(200);

        if (!eventId || (normalizedEventType && !acceptedEvents.includes(normalizedEventType))) {
            console.warn("Webhook ignorado: evento não suportado ou id ausente", {
                eventType: normalizedEventType,
                eventId
            });
            return;
        }

        let payment;

        if (isMerchantOrderEvent) {
            const moResponse = await fetch(`${MERCADO_PAGO_MERCHANT_ORDER_URL}/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
                }
            });

            if (!moResponse.ok) {
                console.error("Erro ao consultar merchant order:", await moResponse.text());
                return;
            }

            const merchantOrder = await moResponse.json();
            payment = Array.isArray(merchantOrder.payments)
                ? merchantOrder.payments.find((p) => p?.id)
                : null;

            if (!payment) {
                console.warn("Nenhum pagamento encontrado em merchant order", {
                    merchantOrderId: eventId,
                    merchantOrder
                });
                return;
            }
        } else {
            const mpResponse = await fetch(`${MERCADO_PAGO_API_URL}/${eventId}`, {
                headers: {
                    Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
                }
            });

            if (!mpResponse.ok) {
                console.error("Erro ao consultar pagamento:", await mpResponse.text());
                return;
            }

            payment = await mpResponse.json();
        }

        const doacaoId = payment.external_reference || payment.metadata?.doacaoId;

        if (!doacaoId) {
            console.error("Pagamento sem external_reference:", payment.id || eventId);
            return;
        }

        const updatedStatus = mapMercadoPagoStatus(payment.status);

        console.log("Mercado Pago webhook update:", {
            paymentId: payment.id,
            eventType,
            paymentStatus: payment.status,
            mappedStatus: updatedStatus,
            doacaoId
        });

        await db.collection("doacoes").doc(doacaoId).set({
            nome: payment.metadata?.nome || payment.payer?.first_name || "",
            valor: Number(payment.transaction_amount || 0),
            mensagem: payment.metadata?.mensagem || "",
            dataHora: FieldValue.serverTimestamp(),
            status: updatedStatus,
            transactionId: String(payment.id),
            metodoPagamento: "pix"
        }, { merge: true });
    } catch (error) {
        console.error("Erro no webhook Mercado Pago:", error);
    }
});

module.exports = app;
