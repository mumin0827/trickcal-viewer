import { useTranslation } from 'react-i18next';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FallbackProps } from 'react-error-boundary';

const ErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    const { t } = useTranslation();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    return (
        <div className="flex flex-col items-center justify-center min-h-[60dvh] w-full p-6 text-center animate-in fade-in duration-500">
            <div className="flex flex-col items-center p-10 bg-tc-panel/40 backdrop-blur-sm rounded-3xl border-2 border-dashed border-tc-green/30 max-w-md w-full">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <AlertTriangle className="w-10 h-10" />
                </div>
                
                <h2 className="text-2xl font-bold text-text-main mb-2">
                    {t('common.errorTitle')}
                </h2>
                
                <p className="text-text-sub mb-6 break-words font-medium">
                    {errorMessage || t('common.errorMessage')}
                </p>

                <Button 
                    onClick={resetErrorBoundary}
                    className="gap-2 bg-tc-green hover:bg-tc-green-dark text-white rounded-full px-8 py-6 h-auto text-lg shadow-tc-btn transition-all active:scale-95"
                >
                    <RefreshCcw className="w-5 h-5" />
                    {t('common.retry')}
                </Button>
                
                <div className="mt-8 pt-6 border-t border-tc-green/10 w-full opacity-50">
                    <p className="text-[10px] text-text-disabled uppercase tracking-widest mb-1">오류 로그 (Error Log)</p>
                    <code className="text-[10px] text-text-disabled block overflow-hidden text-ellipsis italic">
                        {errorStack?.split('\n')[0]}
                    </code>
                </div>
            </div>
        </div>
    );
};

export default ErrorFallback;