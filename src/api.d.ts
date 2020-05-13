export interface PaymentRequestPayload {
  amount: string,
  currency: "EUR",
  externalId: string,
  payer: {
    partyIdType: "MSISDN" | "EMAIL" | "PARTY_CODE"
    partyId: string
  },
  payerMessage: string,
  payeeNote: string
}

export interface PaymentRequestResult {
  statusCode: number
  responseBody: string
  transactionId: string
}

export interface PaymentStatusResponse {
  statusCode: number
  data?: any
}
