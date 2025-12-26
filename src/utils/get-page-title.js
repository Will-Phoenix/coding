import defaultSettings from '@/settings'
import i18n from '@/lang'

const title = defaultSettings.title

/**
 *
 * @param key i18n的key
 * @param fullName 真实title(低优先级)
 */
export default function getPageTitle(key, fullName) {
  const realTitle = title
  const hasKey = i18n.te(`route.${key}`)
  if (hasKey) {
    const pageName = i18n.t(`route.${key}`)
    return `${pageName} - ${realTitle}`
  }
  return fullName ? `${fullName} - ${realTitle}` : realTitle
}
