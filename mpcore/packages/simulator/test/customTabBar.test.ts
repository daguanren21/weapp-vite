import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { createBrowserHeadlessSession, createBrowserVirtualFiles } from '../src/browser'
import { createHeadlessSession } from '../src/runtime'

const CUSTOM_TAB_BAR_FILES: Array<[string, string]> = [
  ['app.json', JSON.stringify({
    pages: [
      'pages/home/index',
      'pages/profile/index',
      'pages/detail/index',
    ],
    tabBar: {
      custom: true,
      list: [
        { pagePath: 'pages/home/index', text: 'Home' },
        { pagePath: 'pages/profile/index', text: 'Profile' },
      ],
    },
  })],
  ['app.js', 'App({})'],
  ['pages/home/index.js', `
Page({
  options: {
    multipleSlots: true,
  },
  readCustomTabBar() {
    const tabBar = this.getTabBar()
    return {
      exists: Boolean(tabBar),
      label: tabBar?.data.label ?? null,
      ready: tabBar?.data.ready ?? null,
    }
  },
})
`],
  ['pages/home/index.wxml', '<view id="home-page">home</view>'],
  ['pages/profile/index.js', 'Page({})'],
  ['pages/profile/index.wxml', '<view id="profile-page">profile</view>'],
  ['pages/detail/index.js', 'Page({})'],
  ['pages/detail/index.wxml', '<view id="detail-page">detail</view>'],
  ['custom-tab-bar/index.js', `
Component({
  data: {
    label: 'custom tab bar mounted',
    ready: false,
  },
  lifetimes: {
    ready() {
      this.setData({ ready: true })
    },
  },
})
`],
  ['custom-tab-bar/index.json', JSON.stringify({ component: true })],
  ['custom-tab-bar/index.wxml', '<view id="custom-tab-bar">{{label}}:{{ready}}</view>'],
]

describe('custom tab bar runtime', () => {
  const tempDirs: string[] = []

  afterEach(() => {
    for (const tempDir of tempDirs.splice(0)) {
      fs.rmSync(tempDir, { force: true, recursive: true })
    }
  })

  it('mounts the custom component for a tab page in the Node runtime', () => {
    const projectPath = fs.mkdtempSync(path.join(os.tmpdir(), 'headless-custom-tab-bar-'))
    tempDirs.push(projectPath)
    fs.writeFileSync(path.join(projectPath, 'project.config.json'), JSON.stringify({
      appid: 'wx123',
      miniprogramRoot: 'dist',
    }))
    for (const [filePath, source] of CUSTOM_TAB_BAR_FILES) {
      const targetPath = path.join(projectPath, 'dist', filePath)
      fs.mkdirSync(path.dirname(targetPath), { recursive: true })
      fs.writeFileSync(targetPath, source)
    }

    const session = createHeadlessSession({ projectPath })
    const page = session.reLaunch('/pages/home/index')
    session.renderCurrentPage()
    const rendered = session.renderCurrentPage()

    expect(page.readCustomTabBar()).toEqual({
      exists: true,
      label: 'custom tab bar mounted',
      ready: true,
    })
    expect(page.options).toEqual({})
    expect(rendered.wxml).toContain('id="custom-tab-bar"')
    expect(rendered.wxml).toContain('custom tab bar mounted:true')

    const detailPage = session.reLaunch('/pages/detail/index')
    expect(session.renderCurrentPage().wxml).not.toContain('id="custom-tab-bar"')
    expect(detailPage.getTabBar?.()).toBeNull()
  })

  it('mounts the custom component for a tab page in the browser runtime', () => {
    const files = createBrowserVirtualFiles(CUSTOM_TAB_BAR_FILES)
    const session = createBrowserHeadlessSession({ files })
    const page = session.reLaunch('/pages/home/index')
    session.renderCurrentPage()
    const rendered = session.renderCurrentPage()

    expect(page.readCustomTabBar()).toEqual({
      exists: true,
      label: 'custom tab bar mounted',
      ready: true,
    })
    expect(page.options).toEqual({})
    expect(rendered.wxml).toContain('id="custom-tab-bar"')
    expect(rendered.wxml).toContain('custom tab bar mounted:true')

    const detailPage = session.reLaunch('/pages/detail/index')
    expect(session.renderCurrentPage().wxml).not.toContain('id="custom-tab-bar"')
    expect(detailPage.getTabBar?.()).toBeNull()
  })
})
