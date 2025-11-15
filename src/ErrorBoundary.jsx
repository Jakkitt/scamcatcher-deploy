import React from 'react';
import toast from 'react-hot-toast';
import { t } from './i18n/strings';

export default class ErrorBoundary extends React.Component{
  constructor(props){ super(props); this.state = { hasError:false, error:null }; }
  static getDerivedStateFromError(error){ return { hasError:true, error }; }
  componentDidCatch(error){ console.error(error); toast.error(error?.message || t('error.toast')); }
  render(){
    if (this.state.hasError){
      return <div className="container py-20 text-center">{t('error.fallback')}</div>;
    }
    return this.props.children;
  }
}
