import { request } from "https"
import { config } from "dotenv"
import { v4 as uuidv4 } from "uuid"
import { join, dirname } from "path"

config({
  path: join(dirname(module.filename), "..", ".env")
})

function createApiUser(): Promise<string> {
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

    const req = request(url, options, (res) => {
      if (res.statusCode != 201)
        reject(`Request failed with status code ${res.statusCode}`)

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

function getApiKey(user): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = `https://sandbox.momodeveloper.mtn.com/v1_0/apiuser/${user}/apikey`
    const options = {
      method: "post",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
        "X-Reference-Id": user
      }
    }

    const req = request(url, options, (res) => {
      if (res.statusCode != 201)
          reject(`Request failed with status code ${res.statusCode}`)

      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => {
        try {
          resolve(JSON.parse(body).apiKey)
        } catch {
          reject("Invalid JSON returned by server")
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
    console.log(`API_USER=${user}`)
    console.log(`API_KEY=${key}`)
  } catch (error) {
    process.exitCode = 1
    console.log("User and token generation failed:", error)
  }
}

main()
