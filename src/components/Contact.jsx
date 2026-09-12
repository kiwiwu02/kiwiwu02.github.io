import { useEffect, useRef, useState } from 'react'
import Pet from './Pet'
import Reveal from './Reveal'
import { GitHubIcon } from './icons'
import { profile } from '../data'

function MailIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4.5 7 7.5 5.5L19.5 7" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M7.2 3.5 5.5 4.7c-.7.5-.9 1.4-.6 2.2 2.1 5.9 6.3 10.1 12.2 12.2.8.3 1.7 0 2.2-.6l1.2-1.7c.4-.6.2-1.5-.4-1.9l-2.6-1.7c-.6-.4-1.4-.3-1.8.3l-.8 1c-2.3-1.2-4.2-3.1-5.4-5.4l1-.8c.6-.5.7-1.3.3-1.8L9.1 3.9c-.4-.6-1.3-.8-1.9-.4Z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg className="contact-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="m5 12 4 4L19 6" />
    </svg>
  )
}

function WeChatIcon() {
  return (
    <svg className="contact-social-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <path d="M10.2 4C5.12 4 1 7.24 1 11.24c0 2.24 1.31 4.24 3.45 5.43L3.3 20l4.14-2.08c.86.22 1.78.34 2.76.34.25 0 .5-.01.75-.03-.07-.3-.1-.61-.1-.93 0-3.52 3.4-6.38 7.59-6.38.21 0 .42.01.62.02C17.77 6.94 14.38 4 10.2 4Zm-3.05 6.48a1.02 1.02 0 1 1 0-2.04 1.02 1.02 0 0 1 0 2.04Zm6.1 0a1.02 1.02 0 1 1 0-2.04 1.02 1.02 0 0 1 0 2.04Z" />
      <path d="M23 15.35c0-3.03-3.2-5.49-7.14-5.49-3.95 0-7.15 2.46-7.15 5.49s3.2 5.48 7.15 5.48c.73 0 1.43-.09 2.08-.25L17 22l2.64-1.34C21.6 19.72 23 17.68 23 15.35Zm-9.52-.85a.82.82 0 1 1 0-1.64.82.82 0 0 1 0 1.64Zm4.76 0a.82.82 0 1 1 0-1.64.82.82 0 0 1 0 1.64Z" />
    </svg>
  )
}

function BilibiliIcon() {
  return (
    <svg className="contact-social-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="3" y="6" width="18" height="14" rx="4" />
      <path d="M8 6 6 3M16 6l2-3M8.5 12.5h.01M15.5 12.5h.01M8.5 16c1.3 1 5.7 1 7 0" />
    </svg>
  )
}

const FOOTER_INTENT_EDGE = 140

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value)
    return
  }

  const textarea = document.createElement('textarea')
  textarea.value = value
  textarea.setAttribute('readonly', '')
  textarea.style.position = 'fixed'
  textarea.style.opacity = '0'
  document.body.appendChild(textarea)
  textarea.select()
  const copied = document.execCommand('copy')
  textarea.remove()

  if (!copied) throw new Error('Copy failed')
}

function CopyContactButton({ kind, value, displayValue = value, Icon, copied, onCopy, className = '' }) {
  const isCopied = copied === kind
  const label = kind === 'email' ? '邮箱' : '电话'

  return (
    <button
      type="button"
      className={`btn btn-ghost copy-contact-button ${className}`.trim()}
      onClick={() => onCopy(kind, value)}
      aria-label={`${isCopied ? '已复制' : '复制'}${label} ${value}`}
      title={isCopied ? '已复制' : `点击复制${label} · ${kind === 'email' ? 'mailto' : 'tel'}`}
      data-copy-hint={isCopied ? '✓ 已复制' : `复制${label}`}
    >
      {isCopied ? <CheckIcon /> : <Icon />}
      {displayValue}
    </button>
  )
}

export default function Contact() {
  const [email, phone] = profile.contacts
  const [copied, setCopied] = useState('')
  const [footerIntent, setFooterIntent] = useState(false)
  const copyTimer = useRef(0)
  const petRef = useRef(null)
  const contactActionsRef = useRef(null)
  const isContactCopied = copied === 'email' || copied === 'phone'

  useEffect(() => {
    const section = document.getElementById('contact')
    if (!section || typeof IntersectionObserver !== 'function') return undefined

    let dwellTimer = 0
    let entered = false
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        // 停留 1.5s 才算"准备联系"，快速滚过不触发
        dwellTimer = setTimeout(() => {
          if (!entered) {
            entered = true
            petRef.current?.enter()
          }
        }, 1500)
      } else {
        clearTimeout(dwellTimer)
      }
    }, { threshold: 0.35 })

    observer.observe(section)
    return () => {
      observer.disconnect()
      clearTimeout(dwellTimer)
    }
  }, [])

  const handleCopy = async (kind, value) => {
    try {
      await copyText(value)
      setCopied(kind)
      window.clearTimeout(copyTimer.current)
      copyTimer.current = window.setTimeout(() => setCopied(''), 1600)
    } catch {
      setCopied('')
    }
  }

  const handleFooterPointerMove = (event) => {
    if (event.pointerType !== 'mouse') return
    setFooterIntent(window.innerHeight - event.clientY <= FOOTER_INTENT_EDGE)
  }

  const handleFooterPointerLeave = (event) => {
    if (event.pointerType === 'mouse') setFooterIntent(false)
  }

  return (
    <section
      className={`contact${footerIntent ? ' has-footer-intent' : ''}`}
      id="contact"
      data-snap-page="contact"
      onPointerMove={handleFooterPointerMove}
      onPointerLeave={handleFooterPointerLeave}
    >
      <div className="contact-glow" />
      <div className="shell contact-inner">
        <Reveal>
          <h2 className="contact-title">
            <span className="hover-accent contact-title-line">正在<em>寻找 2027 届秋招</em>机会</span><br />
            <span className="hover-accent contact-title-line">聚焦 <em>AI Agent / 大模型应用</em>方向</span>
          </h2>
          <p className="contact-sub contact-sub-desktop hover-accent">
            如果你正在寻找 AI Agent / 大模型应用方向的工程师，或者也对 Agent 架构、RAG 与 AI 产品工程化感兴趣，欢迎联系我。
          </p>
          <p className="contact-sub contact-sub-mobile hover-accent">
            如果你正在寻找 Agent / 大模型应用方向的工程师，或者对 Agent、RAG 与 AI 产品工程化感兴趣，欢迎联系我。
          </p>
        </Reveal>

        <Reveal delay="d1">
          <div className="contact-actions" ref={contactActionsRef}>
            <CopyContactButton kind="email" value={email.v} Icon={MailIcon} copied={copied} onCopy={handleCopy} />
            <CopyContactButton className="mobile-phone-copy" kind="phone" value={phone.v} displayValue={`+86 ${phone.v}`} Icon={PhoneIcon} copied={copied} onCopy={handleCopy} />
            <a className="btn btn-ghost mobile-phone-link" href={`tel:+86${phone.v.replace(/\D/g, '')}`} aria-label={`拨打电话 +86 ${phone.v}`}>
              <PhoneIcon />
              +86 {phone.v}
            </a>
            <a className="btn btn-ghost" href="https://github.com/kiwiwu02" target="_blank" rel="noopener noreferrer"><GitHubIcon />github.com/kiwiwu02</a>
          </div>
          <span className={`copy-feedback ${isContactCopied ? 'is-visible' : ''}`} role="status" aria-live="polite">
            {isContactCopied ? '已复制' : ''}
          </span>
        </Reveal>

        <Reveal className="contact-pet" delay="d2">
          <Pet ref={petRef} mode="embed" profile="contact" bubbleTargetRef={contactActionsRef} height="clamp(198px, 21.6vw, 291px)" />
        </Reveal>
      </div>

      <div className="contact-foot" onFocusCapture={() => setFooterIntent(true)}>
        <span className="hover-accent">© 2026 {profile.latin.toUpperCase()}</span>
        <span className="hover-accent">DESIGNED &amp; BUILT BY KIWI</span>
        <span className="contact-socials" aria-label="社交媒体">
          <button
            type="button"
            className="contact-social copy-contact-button"
            onClick={() => handleCopy('wechat', 'Kiwi20020103')}
            aria-label="复制微信号 Kiwi20020103"
            title={copied === 'wechat' ? '已复制' : '点击复制微信号'}
            data-copy-hint={copied === 'wechat' ? '✓ 已复制' : '复制微信号'}
          >
            <WeChatIcon />
          </button>
          <span className="contact-social-divider" aria-hidden="true">｜</span>
          <a className="contact-social contact-social-tooltip" href="https://space.bilibili.com/1100964937?spm_id_from=333.1007.0.0" target="_blank" rel="noopener noreferrer" aria-label="打开哔哩哔哩主页" title="打开哔哩哔哩主页" data-hover-hint="打开哔哩哔哩主页">
            <BilibiliIcon />
          </a>
          <span className="contact-social-divider" aria-hidden="true">｜</span>
          <a className="contact-social contact-social-tooltip" href="https://github.com/kiwiwu02" target="_blank" rel="noopener noreferrer" aria-label="打开 GitHub 主页" title="打开 GitHub 主页" data-hover-hint="打开 GitHub 主页">
            <GitHubIcon className="contact-social-icon contact-social-icon-github" />
          </a>
          <span className={`footer-copy-feedback ${copied === 'wechat' ? 'is-visible' : ''}`} role="status" aria-live="polite">
            {copied === 'wechat' ? '已复制' : ''}
          </span>
        </span>
      </div>
    </section>
  )
}
