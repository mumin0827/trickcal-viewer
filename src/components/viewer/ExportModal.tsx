import React, { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (format: 'gif' | 'zip' | 'png', fps: number, resolution: number) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedFormat, setSelectedFormat] = useState<'gif' | 'zip' | 'png'>('gif');
    const [resolution, setResolution] = useState(1024);

    const gifSteps = [
        { actual: 1,  display: 1,  label: '1.00s' },
        { actual: 2,  display: 2,  label: '0.50s' },
        { actual: 5,  display: 5,  label: '0.20s' },
        { actual: 10, display: 10, label: '0.10s' },
        { actual: 14, display: 15, label: '0.07s' },
        { actual: 20, display: 20, label: '0.05s' },
        { actual: 25, display: 25, label: '0.04s' },
        { actual: 33, display: 30, label: '0.03s' },
        { actual: 50, display: 50, label: '0.02s' }
    ];

    const [stepIndex, setStepIndex] = useState(7);
    const [zipFps, setZipFps] = useState(30);

    if (!isOpen) return null;

    const currentStep = gifSteps[stepIndex] || gifSteps[0];

    const handleConfirm = () => {
        const fps = selectedFormat === 'gif' ? currentStep.actual : zipFps;
        onConfirm(selectedFormat, fps, resolution);
    };

    const resolutionPresets = [
        { label: '낮음', value: 512, desc: '512px' },
        { label: '중간', value: 1024, desc: '1024px' },
        { label: '높음', value: 1536, desc: '1536px' }
    ];

    return (
        <div className="modal-overlay">
            <div className="modal-content export-modal">
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>내보내기 설정</h3>
                </div>

                <div className="export-format-tabs" style={{ display: 'flex', gap: '10px', marginTop: '10px', borderBottom: '1px solid var(--header-border)', paddingBottom: '20px' }}>
                    {(['gif', 'zip', 'png'] as const).map((fmt) => (
                        <button
                            key={fmt}
                            onClick={() => setSelectedFormat(fmt)}
                            className={selectedFormat === fmt ? "record-btn active" : "record-btn"}
                            style={{
                                flex: 1,
                                justifyContent: 'center',
                                background: selectedFormat === fmt ? 'var(--tc-green)' : 'var(--btn-bg)',
                                borderColor: selectedFormat === fmt ? 'var(--tc-green-dark)' : 'var(--btn-border)',
                                color: selectedFormat === fmt ? '#fff' : 'var(--btn-text)',
                                textTransform: 'uppercase',
                                fontSize: '0.9rem',
                                height: '44px',
                                boxShadow: selectedFormat === fmt ? 'none' : 'var(--tc-btn-shadow)',
                                transform: selectedFormat === fmt ? 'translateY(2px)' : 'none'
                            }}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>

                <div className="export-modal-body" style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 1 }}>
                    <p className="modal-body-text" style={{ minHeight: '36px', fontSize: '0.9rem' }}>
                        {selectedFormat === 'gif' && '사도의 움직이는 이미지를 생성합니다.'}
                        {selectedFormat === 'zip' && '사도의 개별 프레임을 압축 파일(.zip)로 생성합니다.'}
                        {selectedFormat === 'png' && '현재 모션의 첫 프레임을 이미지로 저장합니다.'}

                        {selectedFormat === 'gif' && (
                            <>
                                <br />
                                <span style={{ fontSize: '0.8rem', color: '#666' }}>
                                    ※ GIF 포맷 최적화 값으로 고정됩니다. (최대 50 FPS)
                                </span>
                            </>
                        )}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label className="modal-label">해상도:</label>
                        </div>
                        <div className="resolution-options" style={{ display: 'flex', gap: '10px' }}>
                            {resolutionPresets.map((preset) => (
                                <button
                                    key={preset.value}
                                    onClick={() => setResolution(preset.value)}
                                    className={resolution === preset.value ? "record-btn active" : "record-btn"}
                                    style={{
                                        flex: 1,
                                        flexDirection: 'column',
                                        height: 'auto',
                                        padding: '8px 4px',
                                        background: resolution === preset.value ? 'var(--tc-green)' : 'var(--btn-bg)',
                                        borderColor: resolution === preset.value ? 'var(--tc-green-dark)' : 'var(--btn-border)',
                                        color: resolution === preset.value ? '#fff' : 'var(--btn-text)',
                                        boxShadow: resolution === preset.value ? 'none' : 'var(--tc-btn-shadow)',
                                        transform: resolution === preset.value ? 'translateY(2px)' : 'none'
                                    }}
                                >
                                    <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>
                                        {preset.label}
                                    </span>
                                    <span style={{
                                        fontSize: '0.7rem',
                                        opacity: resolution === preset.value ? 0.9 : 0.6,
                                        color: resolution === preset.value ? '#fff' : 'var(--text-sub)'
                                    }}>
                                        {preset.desc}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedFormat !== 'png' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label className="modal-label">프레임 (FPS):</label>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--tc-green-dark)', lineHeight: 1 }}>
                                        {selectedFormat === 'gif' ? currentStep.display : zipFps}
                                    </div>
                                </div>
                            </div>

                            <div className="export-fps-slider" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                {selectedFormat === 'gif' ? (
                                    <input
                                        type="range"
                                        value={stepIndex}
                                        onChange={(e) => setStepIndex(parseInt(e.target.value))}
                                        className="tc-slider"
                                        style={{ "--p": `${(stepIndex / (gifSteps.length - 1)) * 100}%` } as React.CSSProperties}
                                        min="0"
                                        max={gifSteps.length - 1}
                                        step="1"
                                    />
                                ) : (
                                    <input
                                        type="range"
                                        value={zipFps}
                                        onChange={(e) => setZipFps(parseInt(e.target.value))}
                                        className="tc-slider"
                                        style={{ "--p": `${((zipFps - 1) / 59) * 100}%` } as React.CSSProperties}
                                        min="1"
                                        max="60"
                                        step="1"
                                    />
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px', zIndex: 1 }}>
                    <button 
                        className="cancel-modal-btn" 
                        onClick={onClose}
                        style={{ alignSelf: 'auto' }}
                    >
                        취소
                    </button>
                    <button 
                        className="close-modal-btn" 
                        onClick={handleConfirm}
                        style={{ alignSelf: 'auto', marginTop: 0 }}
                    >
                        내보내기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
