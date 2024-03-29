import { request } from 'https'
import { v4 as uuidv4 } from 'uuid'

const sandboxHost = 'sandbox.momodeveloper.mtn.com'

export function createUser(subscriptionKey: string, cbHost: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const user = uuidv4()
    const options = {
      hostname: sandboxHost,
      path: '/v1_0/apiuser',
      method: 'post',
      headers: {
        'content-type': 'application/json',
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'X-Reference-Id': user
      }
    }

    const req = request(options, (resp) => {
      if (resp.statusCode !== 201)
        reject(new Error(`Sandbox user creation failed with status code ${resp.statusCode}`))
      resp.setEncoding('utf8')
      let body = ''
      resp.on('data', chunk => body += chunk)
      resp.on('end', () => resolve(user))
    })

    req.on('error', e => reject(e))
    req.write(JSON.stringify({ providerCallbackHost: cbHost}))
    req.end()
  })
}

export function getApiKey(subscriptionKey: string, user: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: sandboxHost,
      path: `/v1_0/apiuser/${user}/apikey`,
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
        'X-Reference-Id': user
      }
    }

    const req = request(options, (resp) => {
      if (resp.statusCode !== 201)
        reject(new Error(`Sandbox API key retrieval failed with status code ${resp.statusCode}`))
      resp.setEncoding('utf8')
      let body = ''
      resp.on('data', chunk => body += chunk)
      resp.on('end', () => {
        try {
          resolve(JSON.parse(body).apiKey)
        } catch {
          reject(new Error('Invalid JSON returned by server'))
        }
      })
    })
  
    req.on('error', e => reject(e))
    req.end()
  })
}

export async function getCredentials(subscriptionKey: string, cbHost: string) {
  const user = await createUser(subscriptionKey, cbHost)
  const apiKey = await getApiKey(subscriptionKey, user)
  return {
    user,
    apiKey
  }
}
