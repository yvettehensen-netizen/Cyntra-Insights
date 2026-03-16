import React from "react";
import {
  PORTAL_DASHBOARD_PATH,
  PORTAL_REPORT_LIBRARY_PATH,
} from "@/pages/portal/portalPaths";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

export default class PortalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      message: "",
    };
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : "Onbekende portal-fout.",
    };
  }

  componentDidCatch(error: unknown) {
    console.error("[PortalErrorBoundary]", error);
  }

  private handleRetry = () => {
    this.setState({ hasError: false, message: "" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="portal-theme portal-shell min-h-screen">
        <main className="portal-main flex items-center justify-center px-6 py-12">
          <div className="portal-card max-w-2xl p-8">
            <p className="portal-kicker">Portal recovery</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">
              De portal-shell is hersteld voordat het scherm leeg kon vallen.
            </h1>
            <p className="mt-4 text-sm leading-7 text-slate-300">
              Een pagina binnen de portal crashte tijdens renderen. De shell blijft actief en biedt
              een gecontroleerde herstelroute in plaats van een wit of zwart scherm.
            </p>
            <p className="mt-4 break-words rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-xs text-slate-400">
              Fout: {this.state.message || "Onbekende fout"}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={this.handleRetry} className="portal-button-primary">
                Portal herladen
              </button>
              <a href={PORTAL_DASHBOARD_PATH} className="portal-button-secondary">
                Naar dashboard
              </a>
              <a href={PORTAL_REPORT_LIBRARY_PATH} className="portal-button-secondary">
                Naar rapporten
              </a>
            </div>
          </div>
        </main>
      </div>
    );
  }
}
