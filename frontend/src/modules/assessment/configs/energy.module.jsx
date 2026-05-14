import { C } from '@/theme/colors';
import { Zap, Droplets, Fuel, Trash2, Wind, Truck, Shield } from 'lucide-react';

export const UPLOAD_CATEGORIES = [
    { id: 'electricity', label: 'Electricity', icon: <Zap size={22} color={C.amber} />, iconComponent: Zap, months: 12, total: 12, c: C.amber, desc: 'Upload electricity bills' },
    { id: 'water', label: 'Water', icon: <Droplets size={22} color={C.blue} />, iconComponent: Droplets, months: 12, total: 12, c: C.blue, desc: 'Upload water bills' },
    { id: 'fuel', label: 'Fuel', icon: <Fuel size={22} color={C.orange} />, iconComponent: Fuel, months: 12, total: 12, c: C.orange, desc: 'Upload fuel / DG invoices' },
    { id: 'waste', label: 'Waste', icon: <Trash2 size={22} color={C.green} />, iconComponent: Trash2, months: 12, total: 12, c: C.green, desc: 'Upload waste records' },
    { id: 'refrigerants', label: 'Refrigerants', icon: <Wind size={22} color={C.violet} />, iconComponent: Wind, months: 8, total: 12, c: C.violet, desc: 'Upload AC/refrigerant data', optional: true },
    { id: 'transport', label: 'Transport', icon: <Truck size={22} color={C.rose} />, iconComponent: Truck, months: 6, total: 12, c: C.rose, desc: 'Upload transport data', optional: true },
    { id: 'governance', label: 'Governance', icon: <Shield size={22} color={C.green} />, iconComponent: Shield, months: null, total: null, pct: 85, c: C.green, desc: 'Upload policies & docs', optional: true },
];

export default UPLOAD_CATEGORIES;