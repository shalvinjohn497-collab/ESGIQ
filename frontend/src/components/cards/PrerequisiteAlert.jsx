import { AlertCircle } from 'lucide-react';

export default function PrerequisiteAlert({ failedChecks = [] }) {
    if (!failedChecks || failedChecks.length === 0) return null;

    return (
        <div className="mt-4 p-3 bg-rose-50 border border-rose-100 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-rose-500" />
                <span className="text-sm font-semibold text-rose-700">Prerequisites Unmet</span>
            </div>
            <ul className="list-disc pl-5 text-xs text-rose-600 space-y-1">
                {failedChecks.map((check, i) => (
                    <li key={i}>{check}</li>
                ))}
            </ul>
        </div>
    );
}
