import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', labelKey: 'languages.en' },
  { code: 'hi', labelKey: 'languages.hi' },
  { code: 'te', labelKey: 'languages.te' },
]

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation()
  const currentLanguage = i18n.resolvedLanguage || 'en'

  function handleChange(event) {
    i18n.changeLanguage(event.target.value)
  }

  return (
    <label className="language-switcher">
      <span>{t('languageSwitcher.label')}</span>
      <select
        aria-label={t('languageSwitcher.ariaLabel')}
        value={currentLanguage}
        onChange={handleChange}
      >
        {LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {t(language.labelKey)}
          </option>
        ))}
      </select>
    </label>
  )
}
