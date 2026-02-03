import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import MainNavbar from '../components/MainNavbar';
import Footer from '../layouts/Footer';
import { DollarSign, TrendingUp, ShoppingCart, Users, Calendar } from 'lucide-react';

interface SalesMetrics {
  totalRevenue: number;
  revenueThisMonth: number;
  purchasesCount: number;
  purchasesThisMonth: number;
  avgOrderValue: number;
  conversionRate: number;
  revenueByProduct: Record<string, number>;
  revenueByDay: Array<{ date: string; revenue: number }>;
}

export default function SalesDashboard() {
  const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  async function loadMetrics() {
    try {
      const now = new Date();
      const startDate = getStartDate(timeRange);

      const { data: purchases, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'purchase')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const purchasesThisMonth = purchases?.filter(
        p => new Date(p.created_at) >= monthStart
      ) || [];

      const totalRevenue = purchases?.reduce((sum, p) => sum + (p.value || 0), 0) || 0;
      const revenueThisMonth = purchasesThisMonth.reduce((sum, p) => sum + (p.value || 0), 0);

      const revenueByProduct: Record<string, number> = {};
      purchases?.forEach(p => {
        const type = p.analysis_type || 'unknown';
        revenueByProduct[type] = (revenueByProduct[type] || 0) + (p.value || 0);
      });

      const { data: pageViews } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'page_view')
        .gte('created_at', startDate.toISOString());

      const uniqueVisitors = new Set(pageViews?.map(v => v.session_id)).size;
      const conversionRate = uniqueVisitors > 0
        ? (purchases?.length || 0) / uniqueVisitors * 100
        : 0;

      const revenueByDay = groupRevenueByDay(purchases || []);

      setMetrics({
        totalRevenue,
        revenueThisMonth,
        purchasesCount: purchases?.length || 0,
        purchasesThisMonth: purchasesThisMonth.length,
        avgOrderValue: purchases?.length ? totalRevenue / purchases.length : 0,
        conversionRate,
        revenueByProduct,
        revenueByDay
      });
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  }

  function getStartDate(range: string): Date {
    const now = new Date();
    switch (range) {
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90d':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(2024, 0, 1);
    }
  }

  function groupRevenueByDay(purchases: any[]) {
    const grouped: Record<string, number> = {};
    purchases.forEach(p => {
      const date = new Date(p.created_at).toLocaleDateString('nl-NL');
      grouped[date] = (grouped[date] || 0) + (p.value || 0);
    });
    return Object.entries(grouped).map(([date, revenue]) => ({ date, revenue }));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f] flex items-center justify-center">
        <div className="text-white">Metrics laden...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0a0f] via-[#2d1319] to-[#1a0a0f]">
      <MainNavbar />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-white">Sales Dashboard</h1>
          <div className="flex gap-2">
            {['7d', '30d', '90d', 'all'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range as any)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  timeRange === range
                    ? 'bg-[#D6B48E] text-black'
                    : 'bg-[#1A1A1A] text-gray-400 hover:text-white'
                }`}
              >
                {range === 'all' ? 'Alles' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* KEY METRICS */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#1A1A1A]/80 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Totale Omzet</span>
              <DollarSign size={20} className="text-[#D6B48E]" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{metrics?.totalRevenue.toLocaleString('nl-NL')}
            </div>
            <div className="text-sm text-gray-500">
              Deze maand: €{metrics?.revenueThisMonth.toLocaleString('nl-NL')}
            </div>
          </div>

          <div className="bg-[#1A1A1A]/80 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Verkopen</span>
              <ShoppingCart size={20} className="text-[#D6B48E]" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {metrics?.purchasesCount}
            </div>
            <div className="text-sm text-gray-500">
              Deze maand: {metrics?.purchasesThisMonth}
            </div>
          </div>

          <div className="bg-[#1A1A1A]/80 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Gem. Orderwaarde</span>
              <TrendingUp size={20} className="text-[#D6B48E]" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              €{metrics?.avgOrderValue.toFixed(0)}
            </div>
            <div className="text-sm text-gray-500">Per analyse</div>
          </div>

          <div className="bg-[#1A1A1A]/80 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400 text-sm">Conversie</span>
              <Users size={20} className="text-[#D6B48E]" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {metrics?.conversionRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-500">Bezoekers → Klanten</div>
          </div>
        </div>

        {/* REVENUE BY PRODUCT */}
        <div className="bg-[#1A1A1A]/80 backdrop-blur border border-white/10 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Omzet per Product</h2>
          <div className="space-y-4">
            {Object.entries(metrics?.revenueByProduct || {})
              .sort(([, a], [, b]) => b - a)
              .map(([type, revenue]) => (
                <div key={type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="text-white font-semibold capitalize mb-2">{type}</div>
                    <div className="w-full bg-[#0E0E0E] rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D6B48E] to-[#c9a778] transition-all"
                        style={{
                          width: `${(revenue / metrics.totalRevenue) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="ml-6 text-right">
                    <div className="text-xl font-bold text-white">€{revenue.toLocaleString('nl-NL')}</div>
                    <div className="text-sm text-gray-400">
                      {((revenue / metrics.totalRevenue) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* REVENUE TIMELINE */}
        <div className="bg-[#1A1A1A]/80 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Calendar size={24} className="text-[#D6B48E]" />
            Omzet per Dag
          </h2>
          <div className="space-y-3">
            {metrics?.revenueByDay.map(({ date, revenue }) => (
              <div key={date} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{date}</span>
                <span className="text-white font-semibold">€{revenue.toLocaleString('nl-NL')}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
