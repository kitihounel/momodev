import { createUser, getApiKey, getCredentials } from './sandbox'
import { config } from 'dotenv'
import { join } from 'path'

const uuidv4Regex = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
let sandboxUser: string | undefined
let subscriptionKey: string | undefined
let cbHost: string | undefined 

beforeAll(() => {
  config({ path: join(module.path, '..', '.env') })
  subscriptionKey = process.env.SUBSCRIPTION_KEY
  cbHost = process.env.CB_HOST
})

test('create sandbox user', async () => {  
  const user = await createUser(subscriptionKey, cbHost)
  expect(user).toMatch(uuidv4Regex)
  sandboxUser = user
})

test('get sandbox user API key', async () => {
  const key = await getApiKey(subscriptionKey, sandboxUser)
  expect(typeof key).toEqual('string')
})

test('get sandbox credentials', async () => {
  const credentials = await getCredentials(subscriptionKey, cbHost)
  expect(credentials).toMatchObject({
    user: expect.stringMatching(uuidv4Regex),
    apiKey: expect.any(String)
  })
})

test('create sandbox user with invalid subscription key should fail', async () => {
  expect.assertions(1)
  return createUser('ABCDEF', cbHost).catch(e => expect(e.name).toMatch('Error'))
})

test('get API key with wrong subscription key should fail', async () => {
  expect.assertions(1)
  return getApiKey('ABCDEF', sandboxUser).catch(e => expect(e.name).toMatch('Error'))
})

test('get API key with invalid user should fail', async () => {
  expect.assertions(1)
  return getApiKey(subscriptionKey, 'john-doe').catch(e => expect(e.name).toMatch('Error'))
})
