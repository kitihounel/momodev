import { request } from "https"
import { config } from "dotenv"
import { v4 as uuidv4 } from "uuid"
import { join, dirname } from "path"

config({
  path: join(dirname(module.filename), "..", ".env")
})

const payload = {
  externalId: "1",
  currency: "EUR",
  amount: "100",
  payer: {
    partyId: "22966778899",
    partyIdType: "MSISDN",
  },
  payerMessage: "Yello",
  payeeNote: "Yello"
}

function requestPayment(): Promise<any> {
  const transactionId = uuidv4()
  const url = "https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay"
  const options = {
    method: "post",
    headers: {
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      "X-Reference-Id": transactionId,
      "Authorization": `Bearer ${process.env.TOKEN}`,
      "X-Target-Environment": "sandbox",
    }
  }

  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => resolve({
        statusCode: res.statusCode,
        headers: res.headers,
        body,
        transactionId
      }))
    })

    req.on("error", e => reject(e.message))
    req.write(JSON.stringify(payload))
    req.end()
  })
}

function getPaymentStatus(transactionId: string): Promise<any> {
  const url = `https://sandbox.momodeveloper.mtn.com/collection/v1_0/requesttopay/${transactionId}`
  const options = {
    method: "get",
    headers: {
      "Authorization": `Bearer ${process.env.TOKEN}`,
      "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      "X-Target-Environment": "sandbox",
    }
  }

  return new Promise((resolve, reject) => {
    const req = request(url, options, (res) => {
      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body
      }))
    })
    req.on("error", e => reject(e.message))
    req.end()
  })
}

async function main() {
  let result

  try {
    result = await requestPayment()
    if (result.statusCode != 202) {
      console.error(`Payment request failed with status code ${result.statusCode}`)
      console.log(`Response body: ${result.responseBody}`)
      console.log(result)
      return
    }
  } catch (error) {
    console.log(`Error while making payment request: ${error}`)
    return
  }

  console.log(`RequestToPay with ID ${result.transactionId} successfully done`)
  console.log("Waiting 10s before status check...")
  setTimeout(async () => {
    let obj = await getPaymentStatus(result.transactionId)
    if (obj.statusCode != 200) {
      console.log(`Status request ended with ${obj.statusCode} status code`)
      return
    }
    console.log("Payment status request successful")
    console.log("Transaction status", JSON.parse(obj.body))
  }, 10000)
}

main()
