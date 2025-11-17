import { Toaster } from 'react-hot-toast';
import { useSessionWatcher } from '../hooks/useSessionWatcher';

export default function AppToaster(){
  useSessionWatcher();
  return <Toaster position="top-center" toastOptions={{ duration: 3000 }} />;
}
