import { describe, it, expect } from 'vitest'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js'
import { createServer } from '../../mcp/server.ts'

/** A text content block, the only kind the chocobo server returns. */
type TextBlock = { type: string; text: string }

/** Connect a fresh client to a fresh server over a linked in-memory transport pair. */
async function connectedClient(): Promise<Client> {
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair()
  const server = createServer()
  const client = new Client({ name: 'smoke-test', version: '0.0.0' })
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)])
  return client
}

describe('mcp server', () => {
  it('lists the chocobo_odds tool', async () => {
    const client = await connectedClient()
    const { tools } = await client.listTools()
    expect(tools.map((tool) => tool.name)).toContain('chocobo_odds')
  })

  it('returns odds and advice for a fresh chocobo', async () => {
    const client = await connectedClient()
    const result = await client.callTool({
      name: 'chocobo_odds',
      arguments: { rank: 1, values: [55, 55, 55, 55, 55], dumpIndex: 1 },
    })
    const blocks = result.content as TextBlock[]
    expect(blocks[0].text).toContain('Four maxed')
    const payload = JSON.parse(blocks[1].text)
    expect(payload.fourFixedDump).toBeCloseTo(0.023015, 4)
  }, 20000)

  it('flags invalid input as an error', async () => {
    const client = await connectedClient()
    const result = await client.callTool({
      name: 'chocobo_odds',
      arguments: { rank: 1, values: [50, 55, 55, 55, 55], dumpIndex: 1 }, // 50 is below the 55 floor
    })
    expect(result.isError).toBe(true)
  })

  it('serves the research and paper resources', async () => {
    const client = await connectedClient()
    const research = await client.readResource({ uri: 'chocobo://research' })
    expect((research.contents[0] as { text: string }).text).toContain('Chocobo Racing')
    const paper = await client.readResource({ uri: 'chocobo://paper' })
    expect((paper.contents[0] as { text: string }).text).toContain('Perfecting a Final Chocobo')
  })

  it('lists both resources', async () => {
    const client = await connectedClient()
    const { resources } = await client.listResources()
    const uris = resources.map((resource) => resource.uri)
    expect(uris).toContain('chocobo://research')
    expect(uris).toContain('chocobo://paper')
  })
})
