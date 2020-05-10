const { v4: uuidv4 } = require("uuid")
const https = require("https")
const dotenv = require("dotenv")

dotenv.config()

function createApiUser() {
  return new Promise((resolve, reject) => {
    const user = uuidv4()
    const url = "https://sandbox.momodeveloper.mtn.com/v1_0/apiuser"
    const options = {
      method: "post",
      headers: {
        "content-type": "application/json",
        "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
        "X-Reference-Id": user
      }
    }

    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299)
        reject(`Request rejected with status code: ${res.statusCode}`)

      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => resolve(user))
    })

    req.on("error", e => reject(e.message))
    req.write(`{"providerCallbackHost": "example.com"}`)
    req.end()
  })
}

function getApiKey(user) {
  return new Promise((resolve, reject) => {
    const url = `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${user}/apikey`
    const options = {
      method: "post",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
        "X-Reference-Id": user
      }
    }

    const req = https.request(url, options, (res) => {
      if (res.statusCode < 200 || res.statusCode > 299)
          reject(`Request rejected with status code: ${res.statusCode}`)
      
      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => {
        try {
          resolve(JSON.parse(body).apiKey)
        } catch {
          reject("Invalid server response")
        }
      })
    })
  
    req.on("error", e => reject(e.message))
    req.end()
  })
}

async function main() {
  try {
    let user = await createApiUser()
    let key = await getApiKey(user)
    console.log(`USER_UUID=${user}`)
    console.log(`API_KEY=${key}`)
  } catch (error) {
    process.exitCode = 1
    console.log("Something went wrong.", error)
  }
}

main()
