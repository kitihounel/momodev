import { https } from "follow-redirects"
import { config } from "dotenv"
import { join, dirname } from "path"

config({
  path: join(dirname(module.filename), "..", ".env")
})

function createToken(): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = `${process.env.API_USER}:${process.env.API_KEY}`

    const options = {
      auth,
      hostname: "sandbox.momodeveloper.mtn.com",
      path: "/collection/token",
      method: "post",
      headers: {
        "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
      },
      rejectUnauthorized: false,
      beforeRedirect: (options) => {
        options.auth = auth
        options.headers = {
          "Ocp-Apim-Subscription-Key": process.env.SUBSCRIPTION_KEY,
        }
      }
    }

    const req = https.request(options, (res) => {
      res.setEncoding("utf8")
      let body = ""
      res.on("data", chunk => body += chunk)
      res.on("end", () => resolve({
        statusCode: res.statusCode,
        body
      }))
    })

    req.on("error", e => reject(e.message))
    req.end()
  })
}

async function main() {
  try {
    let obj = await createToken()
    if (obj.statusCode == 200) {
      const data = JSON.parse(obj.body)
      console.log(`TOKEN=${data.access_token}`)
    } else {
      process.exitCode = 1
      console.log(`Token request failed with status code ${obj.statusCode}`)
      console.log(`Response body: ${obj.body}`)
    }
  } catch (error) {
    process.exitCode = 1
    console.log("Token request failed:", error)
  }
}

main()
