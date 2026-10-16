import type { CleanupReport, R2BucketLike } from 'opennext-r2-janitor'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { cleanup, resolveBuildId } = vi.hoisted(() => ({
  cleanup: vi.fn(),
  resolveBuildId: vi.fn(),
}))

vi.mock('opennext-r2-janitor', () => ({
  cleanupOpenNextR2Cache: cleanup,
  resolveBuildIdFromWorker: resolveBuildId,
}))

import { parseJanitorOptions, runR2Janitor } from './r2Janitor'

const bucket = {} as R2BucketLike

const report = (overrides: Partial<CleanupReport> = {}): CleanupReport => ({
  dryRun: true,
  currentBuildId: 'cur',
  prefix: 'incremental-cache/',
  buildIds: 3,
  kept: [{ buildId: 'cur', reason: 'current' }],
  deleted: [{ buildId: 'old', objects: 2 }],
  pending: false,
  subrequests: 4,
  ...overrides,
})

describe('parseJanitorOptions', () => {
  it('defaults to a dry run that keeps 14 days', () => {
    expect(parseJanitorOptions({})).toEqual({ dryRun: true, keepDays: 14, warnings: [] })
  })

  it('only the exact string "false" turns the dry run off', () => {
    expect(parseJanitorOptions({ JANITOR_DRY_RUN: 'false' }).dryRun).toBe(false)
  })

  it.each([
    'true',
    'False',
    'FALSE',
    'no',
    '0',
    '',
    ' false',
    'false ',
    'off',
  ])('keeps the dry run for JANITOR_DRY_RUN=%j', (value) => {
    expect(parseJanitorOptions({ JANITOR_DRY_RUN: value }).dryRun).toBe(true)
  })

  it.each([
    ['30', 30],
    ['0', 0],
    ['7.5', 7.5],
  ])('reads JANITOR_KEEP_DAYS=%s', (value, expected) => {
    expect(parseJanitorOptions({ JANITOR_KEEP_DAYS: value })).toMatchObject({
      keepDays: expected,
      warnings: [],
    })
  })

  it.each([
    'abc',
    '-1',
    '',
    '  ',
    'Infinity',
    'NaN',
  ])('falls back to 14 and warns for JANITOR_KEEP_DAYS=%j', (value) => {
    const result = parseJanitorOptions({ JANITOR_KEEP_DAYS: value })
    expect(result.keepDays).toBe(14)
    expect(result.warnings).toHaveLength(1)
  })
})

describe('runR2Janitor', () => {
  let log: ReturnType<typeof vi.spyOn>
  let error: ReturnType<typeof vi.spyOn>
  let warn: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    cleanup.mockReset()
    resolveBuildId.mockReset()
    log = vi.spyOn(console, 'log').mockImplementation(() => {})
    error = vi.spyOn(console, 'error').mockImplementation(() => {})
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('cleans the bound bucket for the current build and logs the report', async () => {
    resolveBuildId.mockResolvedValue('cur')
    cleanup.mockResolvedValue(report())
    const assets = { fetch: vi.fn() }

    const result = await runR2Janitor({ NEXT_INC_CACHE_R2_BUCKET: bucket, ASSETS: assets })

    expect(resolveBuildId).toHaveBeenCalledWith({ assets })
    expect(cleanup).toHaveBeenCalledWith({
      bucket,
      currentBuildId: 'cur',
      dryRun: true,
      keepDays: 14,
    })
    expect(result).toEqual(report())
    expect(log).toHaveBeenCalledTimes(1)
    const message = String(log.mock.calls[0]?.[0])
    expect(message.startsWith('[r2-janitor] ')).toBe(true)
    expect(JSON.parse(message.slice('[r2-janitor] '.length))).toEqual(report())
    expect(error).not.toHaveBeenCalled()
  })

  it('passes dryRun: false only when explicitly configured', async () => {
    resolveBuildId.mockResolvedValue('cur')
    cleanup.mockResolvedValue(report({ dryRun: false }))

    await runR2Janitor({
      NEXT_INC_CACHE_R2_BUCKET: bucket,
      JANITOR_DRY_RUN: 'false',
      JANITOR_KEEP_DAYS: '30',
    })

    expect(cleanup).toHaveBeenCalledWith(expect.objectContaining({ dryRun: false, keepDays: 30 }))
  })

  it('logs an aborted run as an error', async () => {
    resolveBuildId.mockResolvedValue('cur')
    cleanup.mockResolvedValue(
      report({ aborted: { reason: 'current-build-not-found', detail: 'no folder' } }),
    )

    await runR2Janitor({ NEXT_INC_CACHE_R2_BUCKET: bucket })

    expect(error).toHaveBeenCalledTimes(1)
    expect(String(error.mock.calls[0]?.[0])).toContain('current-build-not-found')
    expect(log).not.toHaveBeenCalled()
  })

  it('does nothing when the R2 binding is missing', async () => {
    expect(await runR2Janitor({})).toBeNull()

    expect(resolveBuildId).not.toHaveBeenCalled()
    expect(cleanup).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('does nothing when the current build ID cannot be determined', async () => {
    resolveBuildId.mockResolvedValue(null)

    expect(await runR2Janitor({ NEXT_INC_CACHE_R2_BUCKET: bucket })).toBeNull()

    expect(cleanup).not.toHaveBeenCalled()
    expect(error).toHaveBeenCalledTimes(1)
  })

  it('logs and rethrows a failure so the cron run counts as failed', async () => {
    resolveBuildId.mockResolvedValue('cur')
    cleanup.mockRejectedValue(new Error('R2 is down'))

    await expect(runR2Janitor({ NEXT_INC_CACHE_R2_BUCKET: bucket })).rejects.toThrow('R2 is down')

    expect(String(error.mock.calls[0]?.[0])).toContain('R2 is down')
  })

  it('surfaces an invalid JANITOR_KEEP_DAYS as a warning and still runs with 14', async () => {
    resolveBuildId.mockResolvedValue('cur')
    cleanup.mockResolvedValue(report())

    await runR2Janitor({ NEXT_INC_CACHE_R2_BUCKET: bucket, JANITOR_KEEP_DAYS: 'soon' })

    expect(warn).toHaveBeenCalledTimes(1)
    expect(cleanup).toHaveBeenCalledWith(expect.objectContaining({ keepDays: 14 }))
  })
})
