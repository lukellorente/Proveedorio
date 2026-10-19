import { Component, ErrorInfo, ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { EmptyState } from './EmptyState';
import { Button } from './Button';

interface Props {
    children?: ReactNode;
    fallbackMessage?: string;
    onRetry?: () => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    resetError = () => {
        this.setState({ hasError: false, error: null });
        if (this.props.onRetry) {
            this.props.onRetry();
        }
    };

    public render() {
        if (this.state.hasError) {
            return (
                <EmptyState
                    tone="error"
                    title={this.props.fallbackMessage || 'Ocurrió un error inesperado al cargar esta sección.'}
                    description={this.state.error?.message}
                    action={this.props.onRetry && (
                        <Button variant="secondary" size="sm" icon={<RotateCcw />} onClick={this.resetError}>
                            Reintentar
                        </Button>
                    )}
                />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
