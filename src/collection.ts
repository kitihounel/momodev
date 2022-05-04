import { https } from 'follow-redirects'
import { request } from 'https'
import { v4 as uuidv4 } from 'uuid'

import { PaymentRequestOptions, StatusRequestParams } from './api'
import { getApiHostname } from "./config"
import {
  InvalidDataError, ServerInternalError, ResourceNotFoundError, InvalidDataReceivedError
} from './errors'

export function getToken(subscriptionKey: string, user: string, apiKey: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const auth = `${user}:${apiKey}`
    const options = {
      auth,
      hostname: getApiHostname(),
      path: '/collection/token',
      method: 'post',
      headers: {
        'Ocp-Apim-Subscription-Key': subscriptionKey,
      },
      rejectUnauthorized: false,
      beforeRedirect: (options) => {
        options.auth = auth
        options.headers = {
          'Ocp-Apim-Subscription-Key': subscriptionKey,
        }
      }
    }

    const req = https.request(options, (resp) => {
      resp.setEncoding('utf8')
      let body = ''
      resp.on('data', chunk => body += chunk)
      resp.on('end', () => {
        try {
          const info = JSON.parse(body)
          resolve({
            token: info.access_token,
            tokenType: info.token_type,
            expiresIn: info.expires_in
          })
        } catch (error) {
          reject(new InvalidDataReceivedError(`Invalid JSON received from server: ${body}`))
        }
      })
    })

    req.on('error', e => reject(e.message))
    req.end()
  })
}

export function makeRequest(options: PaymentRequestOptions): Promise<string> {
  const transactionId = uuidv4()
  const headers = {
    'Content-Type': 'application/json',
    'Ocp-Apim-Subscription-Key': options.subscriptionKey,
    'X-Reference-Id': transactionId,
    'Authorization': `Bearer ${options.apiToken}`,
    'X-Target-Environment': options.targetEnv,
  }

  if (options.cbUrl)
    headers['X-Callback-Url'] = options.cbUrl

  const reqOptions = {
    hostname: getApiHostname(),
    path: '/collection/v1_0/requesttopay',
    method: 'post',
    headers
  }

  return new Promise((resolve, reject) => {
    const req = request(reqOptions, (resp) => {
      resp.setEncoding('utf8')

      let body = ''      
      resp.on('data', chunk => body += chunk)

      resp.on('end', () => {
        if (resp.statusCode === 202)
          resolve(transactionId)
        else if (resp.statusCode === 404)
          reject(new InvalidDataError('Invalid data supplied'))
        else if (resp.statusCode === 409)
          reject('Duplicated transaction id')
        else if (resp.statusCode === 500)
          reject(new ServerInternalError('Server internal error'))
        else
          reject(new Error('Request failed for an unknown reason'))
      })

      req.on('error', e => reject(e.message))
      req.write(JSON.stringify(options.info))
      req.end()
    })
  })
}

export function getRequestStatus(params: StatusRequestParams): Promise<any> {
  const reqOptions = {
    hostname: getApiHostname(),
    path: `/collection/v1_0/requesttopay/${params.transactionId}`,
    method: 'get',
    headers: {
      'Ocp-Apim-Subscription-Key': params.subscriptionKey,
      'Authorization': `Bearer ${params.apiToken}`,
      'X-Target-Environment': params.targetEnv,
    }
  }
  
  return new Promise((resolve, reject) => {
    const req = request(reqOptions, (resp) => {
      resp.setEncoding('utf8')
      let body = ''
      resp.on('data', chunk => body += chunk)
      resp.on('end', () => {
        if (resp.statusCode === 200) {
          try {
            resolve(JSON.parse(body))
          } catch (error) {
            reject(new InvalidDataReceivedError(`Invalid JSON received from server: ${body}`))
          }
        } else if (resp.statusCode === 400) {
          reject(new InvalidDataError('Invalid data supplied'))
        } else if (resp.statusCode === 404) {
          reject(new ResourceNotFoundError('Requested transaction not found'))
        } else if (resp.statusCode === 500) {
          reject(new ServerInternalError('Server internal error'))
        } else {
          reject(new Error('Request failed for an unknown reason'))
        }
      })
    })

    req.on('error', e => reject(e.message))
    req.end()
  })
}
