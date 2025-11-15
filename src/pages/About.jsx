import React from 'react';
import { t } from '../i18n/strings';

export default function About(){
  const steps = t('about.steps') || [];
  return (
    <main className="container py-12 prose dark:prose-invert max-w-3xl">
      <h1>{t('about.title')}</h1>
      <p><strong>{t('layout.brand')}</strong> {t('about.intro')}</p>
      <h3>{t('about.contactTitle')}</h3>
      <ul>
        <li>{t('about.contact.email')}</li>
        <li>{t('about.contact.facebook')}</li>
      </ul>
      <h3>{t('about.tipsTitle')}</h3>
      <ol>
        {steps.map((item) => <li key={item}>{item}</li>)}
      </ol>
    </main>
  );
}
