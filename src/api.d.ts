export interface RequestToPay {
  amount: string
  currency: string
  externalId: string
  payer: {
    partyIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE'
    partyId: string
  }
  payerMessage: string
  payeeNote: string
}

export interface SuccessfulRequestToPay {
  amount: string
  currency: string
  financialTransactionId: string
  externalId: string
  payer: {
    partyIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE'
    partyId: string
  }
  status: 'SUCCESSFUL'
}

export interface UnsuccessfulRequestToPay {
  amount: string
  currency: string
  externalId: string
  payer: {
    partyIdType: 'MSISDN' | 'EMAIL' | 'PARTY_CODE'
    partyId: string
  }
  status: 'FAILED'
  reason: {
    code: string
    message: string
  }
}

export interface PaymentRequestOptions {
  info: RequestToPay
  subscriptionKey: string
  apiToken: string
  targetEnv: string
  cbUrl: string | undefined
}

export interface StatusRequestParams {
  transactionId: string
  subscriptionKey: string
  apiToken: string
  targetEnv: string
}
