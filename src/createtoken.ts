import { request } from "https"
import { config } from "dotenv"
import { join, dirname } from "path"

config({
  path: join(dirname(module.filename), "..", ".env")
})

function createToken(): Promise<any> {
  return new Promise((resolve, reject) => {
    const url = "https://sandbox.momodeveloper.mtn.com/collection/token"
    const buf = Buffer.from(`${process.env.API_USER}:${process.env.API_KEY}`)
    const auth = `Basic ${buf.toString("base64")}`

    const options = {
      method: "post",
      headers: {
        "Authorization": auth,
        "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      }
    }

    const req = request(url, options, (res) => {
      if (res.statusCode != 200)
        reject(`Request failed with status code ${res.statusCode}`)

      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => resolve(body))
    })

    req.on("error", e => reject(e.message))
    req.end()
  })
}

async function main() {
  try {
    let obj = await createToken()
    console.log(`TOKEN=${obj}`)
  } catch (error) {
    process.exitCode = 1
    console.log("Token generation failed:", error)
  }
}

main()
