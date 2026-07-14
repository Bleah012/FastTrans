import test from "node:test";
import assert from "node:assert/strict";
import {
  ACCEPTED_OFFERS_STORAGE_KEY,
  OFFERS_STORAGE_KEY,
  applyOfferDecision,
  buildOfferFromRequest,
  getOfferStatus,
} from "./offerManagement.js";

test("buildOfferFromRequest creates a client-ready offer payload", () => {
  const request = {
    id: "REQ-1",
    client: "user-1",
    clientName: "Jane Doe",
    clientEmail: "jane@example.com",
    pickupLocation: "Nairobi",
    destination: "Mombasa",
    packageType: "General Goods",
    weight: 3200,
    pickupDate: "2026-07-10",
    pickupTime: "08:00",
  };

  const offer = buildOfferFromRequest(request, {
    offerAmount: "9000",
    serviceFee: "500",
    discount: "0",
    vehicleType: "Truck",
    distance: "485 km",
    duration: "7h 20m",
    notes: "Fast delivery",
  });

  assert.equal(offer.status, "sent");
  assert.equal(offer.schedulingStatus, "waiting for client");
  assert.equal(offer.offerAmount, 9000);
  assert.equal(offer.clientEmail, "jane@example.com");
  assert.equal(offer.route, "Nairobi to Mombasa");
});

test("applyOfferDecision marks accepted offers ready for scheduling", () => {
  const offers = [{ id: "OFFER-1", status: "sent", schedulingStatus: "waiting for client" }];

  const result = applyOfferDecision(offers, "OFFER-1", "accepted");

  assert.equal(result.updatedOffer.status, "accepted");
  assert.equal(result.updatedOffer.schedulingStatus, "ready for scheduling");
  assert.equal(result.shouldPersistAcceptedOffer, true);
  assert.equal(result.acceptedOffer.schedulingStatus, "ready for scheduling");
  assert.equal(result.acceptedOffer.offerId, "OFFER-1");
});

test("storage keys and status helpers expose the offer lifecycle", () => {
  assert.equal(OFFERS_STORAGE_KEY, "fasttrans-generated-offers");
  assert.equal(ACCEPTED_OFFERS_STORAGE_KEY, "fasttrans-accepted-offers");
  assert.equal(getOfferStatus({ status: "accepted" }), "accepted");
  assert.equal(getOfferStatus({}), "sent");
});
