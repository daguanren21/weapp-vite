import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  callRoutePageMethod,
  closeSharedMiniProgram,
  delay,
  getSharedMiniProgram,
  PREPARE_GITHUB_ISSUES_BUILD_TIMEOUT,
  prepareGithubIssuesBuild,
  relaunchPage,
  releaseSharedMiniProgram,
} from './github-issues.runtime.shared'

const ISSUE_PAGE_PATH = '/pages/issue-380/index'
const RUNTIME_TIMEOUT = 20_000

interface Issue380RuntimeProbe {
  hasTabBar: boolean
  tabBarRuntime?: {
    layoutWrapperDetected?: boolean
    ready?: boolean
    rendered?: boolean
    route?: {
      fullPath?: string
      hash?: string
      path?: string
      query?: Record<string, string>
    }
  }
}

async function waitForCustomTabBarRuntime(miniProgram: unknown) {
  const startedAt = Date.now()
  let latest: Issue380RuntimeProbe | undefined

  while (Date.now() - startedAt <= RUNTIME_TIMEOUT) {
    latest = await callRoutePageMethod<Issue380RuntimeProbe>(
      miniProgram,
      ISSUE_PAGE_PATH,
      '_runE2E',
    ).catch(() => undefined)
    if (
      latest?.hasTabBar === true
      && latest.tabBarRuntime?.ready === true
      && latest.tabBarRuntime?.rendered === true
    ) {
      return latest
    }
    await delay(220)
  }

  throw new Error(`Timed out waiting for custom tab bar runtime: ${JSON.stringify(latest)}`)
}

describe.sequential('e2e app: github-issues / issue #380 custom tab bar', () => {
  beforeAll(async () => {
    await prepareGithubIssuesBuild()
  }, PREPARE_GITHUB_ISSUES_BUILD_TIMEOUT)

  afterAll(async () => {
    await closeSharedMiniProgram()
  }, 30_000)

  it('renders custom-tab-bar for Taro #18415 without the default page layout', async (ctx) => {
    const miniProgram = await getSharedMiniProgram(ctx)
    try {
      const issuePage = await relaunchPage(miniProgram, ISSUE_PAGE_PATH, undefined, 45_000, {
        readiness: 'route',
      })
      if (!issuePage) {
        throw new Error('Failed to launch issue-380 page')
      }

      const runtimeResult = await waitForCustomTabBarRuntime(await getSharedMiniProgram(ctx))
      expect(runtimeResult).toMatchObject({
        hasTabBar: true,
        tabBarRuntime: {
          layoutWrapperDetected: false,
          ready: true,
          rendered: true,
          route: {
            fullPath: '/pages/issue-380/index',
            hash: '',
            path: 'pages/issue-380/index',
            query: {},
          },
        },
      })
    }
    finally {
      await releaseSharedMiniProgram(miniProgram)
    }
  })
})
