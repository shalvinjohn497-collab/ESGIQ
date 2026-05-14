import React, { useState, useEffect } from 'react';
import { useAssessmentStore } from '../../store/assessment.store';
import { putGovernanceFlags } from '../../services/api/governance';
import { hydrateFromApi } from '../../services/api/assessment';
import Tabs from '../../components/ui/Tabs';
import Input from '../../components/ui/Input';
import Slider from '../../components/ui/Slider';
import Toggle from '../../components/ui/Toggle';
import Button from '../../components/ui/Button';
import useToast from '../../hooks/useToast';

const GovernanceQuestionnaire = ({ assessmentId }) => {
    const { flags, setFlags } = useAssessmentStore();
    const [formState, setFormState] = useState(flags || {});
    const { showToast } = useToast();

    useEffect(() => {
        if (flags) {
            setFormState(flags);
        }
    }, [flags]);

    const handleInputChange = (key, value) => {
        setFormState((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const updatedFlags = await putGovernanceFlags(assessmentId, formState);
            hydrateFromApi(updatedFlags);
            setFlags(updatedFlags);
            showToast('Governance data saved successfully!', 'success');
        } catch (error) {
            showToast('Failed to save governance data.', 'error');
        }
    };

    const sections = [
        {
            title: 'Organization Profile',
            content: (
                <div>
                    <Input
                        label="Built-up Area (sqft)"
                        type="number"
                        value={formState.area || ''}
                        onChange={(e) => handleInputChange('area', Number(e.target.value))}
                        required
                    />
                    <Input
                        label="Number of Employees"
                        type="number"
                        value={formState.employees || ''}
                        onChange={(e) => handleInputChange('employees', Number(e.target.value))}
                        required
                    />
                    <Input
                        label="Average Daily Occupancy"
                        type="number"
                        value={formState.occupancy || ''}
                        onChange={(e) => handleInputChange('occupancy', Number(e.target.value))}
                    />
                    <Input
                        label="Operating Hours per Day"
                        type="number"
                        value={formState.operatingHours || ''}
                        onChange={(e) => handleInputChange('operatingHours', Number(e.target.value))}
                    />
                </div>
            ),
        },
        {
            title: 'Energy',
            content: (
                <div>
                    <Slider
                        label="LED Coverage %"
                        min={0}
                        max={100}
                        value={formState.ledPct || 0}
                        onChange={(value) => handleInputChange('ledPct', value)}
                    />
                    <Input
                        label="HVAC/Equipment Type"
                        type="select"
                        options={['modern', 'moderate', 'old']}
                        value={formState.hvacEfficient || ''}
                        onChange={(e) => handleInputChange('hvacEfficient', e.target.value)}
                    />
                    <Toggle
                        label="Energy Monitoring System (BMS/EMS)"
                        checked={formState.hasBMS || false}
                        onChange={(checked) => handleInputChange('hasBMS', checked)}
                    />
                    <Input
                        label="Power Factor"
                        type="number"
                        step="0.01"
                        min={0}
                        max={1}
                        value={formState.powerFactor || ''}
                        onChange={(e) => handleInputChange('powerFactor', Number(e.target.value))}
                    />
                </div>
            ),
        },
        {
            title: 'Water',
            content: (
                <div>
                    <Toggle
                        label="Source-wise water split documented"
                        checked={formState.wSplit || false}
                        onChange={(checked) => handleInputChange('wSplit', checked)}
                    />
                    <Toggle
                        label="STP/ETP available and operational"
                        checked={formState.hasSTP || false}
                        onChange={(checked) => handleInputChange('hasSTP', checked)}
                    />
                    <Toggle
                        label="Rainwater harvesting system operational"
                        checked={formState.rainwater || false}
                        onChange={(checked) => handleInputChange('rainwater', checked)}
                    />
                    <Toggle
                        label="Water quality testing conducted"
                        checked={formState.wAudit || false}
                        onChange={(checked) => handleInputChange('wAudit', checked)}
                    />
                    <Toggle
                        label="Leakage monitoring system in place"
                        checked={formState.leakage || false}
                        onChange={(checked) => handleInputChange('leakage', checked)}
                    />
                </div>
            ),
        },
        {
            title: 'Waste',
            content: (
                <div>
                    <Slider
                        label="Waste Segregation %"
                        min={0}
                        max={100}
                        value={formState.wSegregate || 0}
                        onChange={(value) => handleInputChange('wSegregate', value)}
                    />
                    <Slider
                        label="Recycling/Recovery Rate %"
                        min={0}
                        max={100}
                        value={formState.recyclingPct || 0}
                        onChange={(value) => handleInputChange('recyclingPct', value)}
                    />
                    <Toggle
                        label="Authorized vendor for all hazardous/biomedical waste"
                        checked={formState.authVendor || false}
                        onChange={(checked) => handleInputChange('authVendor', checked)}
                    />
                    <Toggle
                        label="Hazardous/biomedical handling procedures documented"
                        checked={formState.hazHandling || false}
                        onChange={(checked) => handleInputChange('hazHandling', checked)}
                    />
                    <Toggle
                        label="Waste audit records maintained"
                        checked={formState.wasteAudit || false}
                        onChange={(checked) => handleInputChange('wasteAudit', checked)}
                    />
                </div>
            ),
        },
        {
            title: 'Governance',
            content: (
                <div>
                    <Toggle
                        label="Sustainability/environmental policy in place"
                        checked={formState.policy || false}
                        onChange={(checked) => handleInputChange('policy', checked)}
                    />
                    <Toggle
                        label="ESG owner/designated responsible person assigned"
                        checked={formState.esgOwner || false}
                        onChange={(checked) => handleInputChange('esgOwner', checked)}
                    />
                    <Toggle
                        label="Monthly utility review conducted"
                        checked={formState.monthlyRev || false}
                        onChange={(checked) => handleInputChange('monthlyRev', checked)}
                    />
                    <Toggle
                        label="SOP documentation available"
                        checked={formState.sops || false}
                        onChange={(checked) => handleInputChange('sops', checked)}
                    />
                    <Toggle
                        label="Internal audits conducted within 12 months"
                        checked={formState.audits || false}
                        onChange={(checked) => handleInputChange('audits', checked)}
                    />
                    <Toggle
                        label="Compliance register maintained"
                        checked={formState.compliance || false}
                        onChange={(checked) => handleInputChange('compliance', checked)}
                    />
                    <Toggle
                        label="Indoor air quality monitoring operational"
                        checked={formState.iaqMonitoring || false}
                        onChange={(checked) => handleInputChange('iaqMonitoring', checked)}
                    />
                </div>
            ),
        },
    ];

    return (
        <div>
            <Tabs sections={sections} />
            <Button onClick={handleSave}>Save</Button>
        </div>
    );
};

export default GovernanceQuestionnaire;