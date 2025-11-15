import React from 'react'
import { t } from '../i18n/strings'

export default function Footer(){
  return (
    <footer className="mt-16 border-t bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="container py-8 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} {t('layout.footer')}
      </div>
    </footer>
  )
}
