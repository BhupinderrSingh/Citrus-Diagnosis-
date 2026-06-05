import { useOutletContext } from 'react-router-dom';
import CitriScanDashboard from '../components/CitriScanDashboard';

export default function DiagnosisPage() {
  const { user, onSignOut } = useOutletContext();
  return <CitriScanDashboard user={user} onSignOut={onSignOut} />;
}
