export const OFFERS_STORAGE_KEY = "fasttrans-generated-offers";
export const ACCEPTED_OFFERS_STORAGE_KEY = "fasttrans-accepted-offers";

export function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

export function buildOfferFromRequest(request, offerForm) {
  return {
    id: `OFFER-${Date.now()}`,
    requestId: request.id,
    client: request.client,
    clientName: request.clientName,
    clientEmail: request.clientEmail,
    pickupLocation: request.pickupLocation,
    destination: request.destination,
    route: `${request.pickupLocation} to ${request.destination}`,
    packageType: request.packageType,
    weight: request.weight,
    pickupDate: request.pickupDate,
    pickupTime: request.pickupTime,
    offerAmount: Number(offerForm.offerAmount),
    serviceFee: Number(offerForm.serviceFee) || 0,
    discount: Number(offerForm.discount) || 0,
    vehicleType: offerForm.vehicleType,
    distance: offerForm.distance,
    duration: offerForm.duration,
    notes: offerForm.notes,
    status: "sent",
    schedulingStatus: "waiting for client",
    createdAt: new Date().toISOString(),
  };
}

export function getOfferStatus(offer) {
  return offer?.status || "sent";
}

export function applyOfferDecision(offers, offerId, status) {
  const selected = offers.find(
    (offer) => offer.id === offerId || offer.offerId === offerId,
  );

  if (!selected) {
    return { updatedOffer: null, shouldPersistAcceptedOffer: false };
  }

  const updatedOffer = {
    ...selected,
    status,
    schedulingStatus:
      status === "accepted" ? "ready for scheduling" : "not scheduled",
    respondedAt: new Date().toISOString(),
  };

  const nextOffers = offers.map((offer) =>
    offer.id === offerId || offer.offerId === offerId ? updatedOffer : offer,
  );

  const shouldPersistAcceptedOffer = status === "accepted";
  const acceptedOffer = shouldPersistAcceptedOffer
    ? {
        ...updatedOffer,
        offerId: updatedOffer.id || updatedOffer.offerId,
        status: "accepted",
        schedulingStatus: "ready for scheduling",
        acceptedAt: new Date().toISOString(),
      }
    : null;

  return {
    updatedOffer,
    nextOffers,
    shouldPersistAcceptedOffer,
    acceptedOffer,
  };
}

export function persistAcceptedOffer(acceptedOffer, existingAcceptedOffers = []) {
  const availabilityOffer = {
    ...acceptedOffer,
    offerId: acceptedOffer.id || acceptedOffer.offerId,
    status: "accepted",
    schedulingStatus: "ready for scheduling",
    acceptedAt: new Date().toISOString(),
  };

  return [
    availabilityOffer,
    ...existingAcceptedOffers.filter(
      (savedOffer) =>
        savedOffer.id !== availabilityOffer.id &&
        savedOffer.offerId !== availabilityOffer.offerId,
    ),
  ];
}
