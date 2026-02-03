import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

interface AnalyticsEvent {
  event_type: string;
  page_path?: string;
  analysis_type?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface AnalyticsContextType {
  trackEvent: (event: AnalyticsEvent) => Promise<void>;
  trackPageView: (path: string) => Promise<void>;
  trackAnalysisStart: (analysisType: string) => Promise<void>;
  trackPurchase: (analysisType: string, value: number) => Promise<void>;
  trackButtonClick: (buttonName: string, location: string) => Promise<void>;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionId] = useState(() => crypto.randomUUID());

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
    }
  }

  async function trackEvent(event: AnalyticsEvent) {
    try {
      const { error } = await supabase.from('analytics_events').insert({
        user_id: userId,
        session_id: sessionId,
        event_type: event.event_type,
        page_path: event.page_path,
        analysis_type: event.analysis_type,
        value: event.value,
        metadata: event.metadata,
        created_at: new Date().toISOString()
      });

      if (error) {
        console.error('Analytics tracking error:', error);
      }
    } catch (err) {
      console.error('Failed to track event:', err);
    }
  }

  async function trackPageView(path: string) {
    await trackEvent({
      event_type: 'page_view',
      page_path: path
    });
  }

  async function trackAnalysisStart(analysisType: string) {
    await trackEvent({
      event_type: 'analysis_start',
      analysis_type: analysisType
    });
  }

  async function trackPurchase(analysisType: string, value: number) {
    await trackEvent({
      event_type: 'purchase',
      analysis_type: analysisType,
      value
    });
  }

  async function trackButtonClick(buttonName: string, location: string) {
    await trackEvent({
      event_type: 'button_click',
      metadata: { buttonName, location }
    });
  }

  return (
    <AnalyticsContext.Provider
      value={{
        trackEvent,
        trackPageView,
        trackAnalysisStart,
        trackPurchase,
        trackButtonClick
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within AnalyticsProvider');
  }
  return context;
}
