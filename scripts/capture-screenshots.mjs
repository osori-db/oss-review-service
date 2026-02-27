import puppeteer from 'puppeteer'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const SCREENSHOT_DIR = path.join(__dirname, '..', 'docs', 'screenshots')
const BASE_URL = 'http://127.0.0.1:3000'

// 실제 토큰은 환경변수에서 가져옴
const AUTH_TOKEN = process.env.AUTH_TOKEN || ''

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function capture(page, filename, options = {}) {
  const filepath = path.join(SCREENSHOT_DIR, filename)
  await page.screenshot({ path: filepath, fullPage: false, ...options })
  console.log(`  Saved: ${filename}`)
}

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 1280, height: 800 },
  })

  const page = await browser.newPage()

  // 1. 토큰 인증 전 화면 (메인 페이지)
  console.log('1. 토큰 인증 전 화면')
  await page.goto(BASE_URL, { waitUntil: 'networkidle2' })
  await delay(1000)
  await capture(page, '01-auth-before.png')

  // 2. 토큰 입력 후 인증 완료 → OSS 목록 화면
  if (AUTH_TOKEN) {
    console.log('2. 토큰 인증 진행')
    await page.type('input[type="password"]', AUTH_TOKEN)
    await delay(300)
    await capture(page, '02-auth-input.png')

    await page.click('button[type="submit"]')
    await delay(3000)
    await capture(page, '03-oss-list.png')

    // 3. OSS 상세 + 버전 목록 화면
    console.log('3. OSS 상세 + 버전 목록')
    const firstLink = await page.$('table tbody tr td a')
    if (firstLink) {
      await firstLink.click()
      await delay(3000)
      await page.evaluate(() => window.scrollTo(0, 0))
      await delay(500)
      await capture(page, '04-oss-detail.png')

      // 스크롤 내려서 버전 목록 보이게
      await page.evaluate(() => window.scrollTo(0, 300))
      await delay(500)
      await capture(page, '05-version-list.png')

      // 4. OSS 리뷰 모달
      console.log('4. OSS 리뷰 모달')
      await page.evaluate(() => window.scrollTo(0, 0))
      await delay(300)
      const ossReviewBtn = await page.waitForSelector('button', { timeout: 3000 })
      // "리뷰 하기" 버튼 찾기 (OssDetail 쪽)
      const buttons = await page.$$('button')
      for (const btn of buttons) {
        const text = await page.evaluate((el) => el.textContent, btn)
        if (text?.trim() === '리뷰 하기') {
          await btn.click()
          break
        }
      }
      await delay(1000)
      await capture(page, '06-oss-review-modal.png')

      // 모달 닫기 (ESC)
      await page.keyboard.press('Escape')
      await delay(500)

      // 5. 버전 선택 + 삭제 버튼
      console.log('5. 버전 선택 + 삭제 버튼')
      await page.evaluate(() => window.scrollTo(0, 300))
      await delay(300)
      const checkboxes = await page.$$('tbody input[type="checkbox"]')
      if (checkboxes.length >= 2) {
        await checkboxes[0].click()
        await delay(200)
        await checkboxes[1].click()
        await delay(500)
      }
      await capture(page, '07-version-select-delete.png')

      // 선택 해제
      if (checkboxes.length >= 2) {
        await checkboxes[0].click()
        await delay(200)
        await checkboxes[1].click()
        await delay(300)
      }

      // 6. 버전 리뷰 모달
      console.log('6. 버전 리뷰 모달')
      const versionReviewBtns = await page.$$('table tbody button')
      if (versionReviewBtns.length > 0) {
        await versionReviewBtns[0].click()
        await delay(1000)
        await capture(page, '08-version-review-modal.png')
      }
    }
  } else {
    console.log('AUTH_TOKEN이 설정되지 않았습니다. 인증 전 화면만 캡처합니다.')
  }

  await browser.close()
  console.log('\nDone!')
}

main().catch(console.error)
