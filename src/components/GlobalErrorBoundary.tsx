import {
  PORTAL_DASHBOARD_PATH,
  PORTAL_REPORT_LIBRARY_PATH,
} from "@/pages/portal/portalPaths";
import React from "react";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  message: string;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return typeof error === "string" ? error : "Onbekende runtime-fout.";
}

export default class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, message: getErrorMessage(error) };
  }

  componentDidCatch(error: unknown) {
    // Keep console signal available for local debugging without crashing the full app shell.
    console.error("[GlobalErrorBoundary]", error);
  }

  componentDidMount() {
    if (typeof window === "undefined") return;

    window.addEventListener("error", this.handleWindowError);
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    if (typeof window === "undefined") return;

    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  private handleWindowError = (event: ErrorEvent) => {
    const message = getErrorMessage(event.error || event.message);
    this.setState({ hasError: true, message });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    const message = getErrorMessage(event.reason);
    this.setState({ hasError: true, message });
  };

  private handleRetry = () => {
    this.setState({ hasError: false, message: "" });
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-cyntra-primary text-cyntra-secondary flex items-center justify-center px-6">
        <div className="max-w-xl rounded-2xl border divider-cyntra bg-cyntra-card p-8 space-y-4">
          <h1 className="text-2xl font-semibold text-cyntra-gold">Dashboard tijdelijk herstelscherm</h1>
          <p className="text-cyntra-secondary">
            Er ging iets mis tijdens het laden. Het platform blijft beschikbaar via een veilige fallback.
          </p>
          <p className="text-xs text-cyntra-secondary break-words">
            Fout: {this.state.message || "Onbekende fout"}
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={this.handleRetry} className="btn-cyntra-primary text-xs uppercase tracking-wider">
              Herladen
            </button>
            <a href={PORTAL_DASHBOARD_PATH} className="btn-cyntra-secondary text-xs uppercase tracking-wider">
              Naar dashboard
            </a>
            <a href={PORTAL_REPORT_LIBRARY_PATH} className="btn-cyntra-secondary text-xs uppercase tracking-wider">
              Naar rapporten
            </a>
          </div>
        </div>
      </div>
    );
  }
}
