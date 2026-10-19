import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Boxes, DollarSign, Layers } from 'lucide-react';
import { getDashboardSummary } from '../services/dashboardService';
import { PageHeader } from 'components/ui/PageHeader';
import { Tabs, TabItem } from 'components/ui/Tabs';
import OpportunitiesTab from '../components/analytics/OpportunitiesTab';
import PricesTab from '../components/analytics/PricesTab';
import StockTab from '../components/analytics/StockTab';
import CatalogTab from '../components/analytics/CatalogTab';

type TabId = 'oportunidades' | 'precios' | 'stock' | 'catalogo';

const TABS: TabItem<TabId>[] = [
  { id: 'oportunidades', label: 'Oportunidades', icon: <Layers /> },
  { id: 'precios', label: 'Precios', icon: <DollarSign /> },
  { id: 'stock', label: 'Stock', icon: <Boxes /> },
  { id: 'catalogo', label: 'Catálogo', icon: <BookOpen /> },
];

const AnalyticsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('oportunidades');

  const { data: summary, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Oportunidades de compra, precios, disponibilidad y catálogo"
      />

      <Tabs tabs={TABS} active={activeTab} onChange={setActiveTab} label="Secciones de Analytics">
        {activeTab === 'oportunidades' && (
          <OpportunitiesTab summary={summary} isLoading={isLoading} isError={isError} onRetry={() => refetch()} />
        )}
        {activeTab === 'precios' && <PricesTab />}
        {activeTab === 'stock' && <StockTab />}
        {activeTab === 'catalogo' && <CatalogTab />}
      </Tabs>
    </>
  );
};

export default AnalyticsPage;
