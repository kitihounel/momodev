import { PaymentRequestPayload, PaymentRequestResult, PaymentStatusResponse } from "./api"
import { request } from "https"
import { config } from "dotenv"
import { v4 as uuidv4 } from "uuid"
import { join, dirname } from "path"

config({
  path: join(dirname(module.filename), "..", ".env")
})

const targetEnv = "sandbox"

function requestPayment(partyId: string): Promise<PaymentRequestResult> {
  const transactionId = uuidv4()
  const url = "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay"
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.API_KEY,
      "X-Reference-Id": transactionId,
      "X-Target-Environment": targetEnv,
    }
  }
  const payload: PaymentRequestPayload = {
    amount: "100",
    currency: "EUR",
    externalId: "1",
    payer: {
      partyIdType: "MSISDN",
      partyId,
    },
    payerMessage: "Yello",
    payeeNote: "Yello"
  }

  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      console.log(res.headers)
      let result = {
        statusCode: res.statusCode,
        responseBody: "",
        transactionId
      }

      res.setEncoding("utf8")
      res.on("data", chunk => result.responseBody += chunk)
      res.on("end", () => resolve(result))
    })

    req.on("error", e => reject(e.message))
    req.write(JSON.stringify(payload))
    req.end()
  })
}

function getPaymentStatus(transactionId: string): Promise<PaymentStatusResponse> {
  const url = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${transactionId}`
  const options = {
    method: "get",
    headers: {
      "Ocp-Apim-Subscription-Key": process.env.API_KEY,
      "X-Target-Environment": targetEnv,
    }
  }

  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      let body = ""
      res.setEncoding("utf8")
      res.on("data", chunk => body += chunk)
      res.on("end", () => {
        let result: PaymentStatusResponse = {
          statusCode: res.statusCode
        }
        try {
          let data = JSON.parse(body)
          result.data = data
        } catch (error) {
        }
        resolve(result)
      })
    })

    req.on("error", e => reject(e.message))
    req.end()
  })
}

async function main() {
  const partyId = "46733123455"
  let result

  try {
    result = await requestPayment(partyId)
    if (result.statusCode != 202) {
      console.error(`Payment request failed with status code ${result.statusCode}`)
      console.log(`Response body: ${result.responseBody}`)
      return
    }
  } catch (error) {
    console.log(`Error while making payment request: ${error}`)
    return
  }

  setInterval(() => {
    let promise = getPaymentStatus(result.transactionId)
    promise.then(obj => {
      switch (obj.statusCode) {
      case 202:
        console.log("Payment status request successful")
        console.log("Transcation status:", JSON.stringify(obj.data, null, 2))
        break;
      case 400:
        console.log("Payment status request rejected with 400 as status code")
        break
      case 404:
        console.log(`Transaction with ID ${result.transactionId} not found`)
        break;
      case 500:
        console.log("Payment status request failed due to server error.")
        break;
       default:
         console.log(`Payment status request ended with ${obj.statusCode} as status code`)
      }
    }).catch(error => {
      console.log("Status check failed", error)
    })
  }, 10000)
}

main()
