import React, { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (format: 'gif' | 'zip' | 'png', fps: number) => void;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedFormat, setSelectedFormat] = useState<'gif' | 'zip' | 'png'>('gif');

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

    const [stepIndex, setStepIndex] = useState(7); // GIF 기본값 (30 FPS)
    const [zipFps, setZipFps] = useState(30);      // ZIP 기본값

    if (!isOpen) return null;

    const currentStep = gifSteps[stepIndex] || gifSteps[0];

    const handleConfirm = () => {
        const fps = selectedFormat === 'gif' ? currentStep.actual : zipFps;
        onConfirm(selectedFormat, fps);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ height: 'auto', maxWidth: '400px', padding: '30px' }}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>내보내기 설정</h3>
                </div>

                {/* Format Selection Tabs */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px', borderBottom: '1px solid var(--header-border)', paddingBottom: '20px' }}>
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
                                fontSize: '1rem',
                                height: '48px',
                                boxShadow: selectedFormat === fmt ? 'none' : 'var(--tc-btn-shadow)',
                                transform: selectedFormat === fmt ? 'translateY(2px)' : 'none'
                            }}
                        >
                            {fmt}
                        </button>
                    ))}
                </div>

                <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1 }}>
                    <p className="modal-body-text" style={{ minHeight: '40px' }}>
                        {selectedFormat === 'gif' && '사도의 움직이는 이미지를 생성합니다.'}
                        {selectedFormat === 'zip' && '사도의 개별 프레임을 압축 파일(.zip)로 생성합니다.'}
                        {selectedFormat === 'png' && '현재 모션의 첫 프레임을 이미지로 저장합니다.'}
                        
                        {selectedFormat === 'gif' && (
                            <>
                                <br />
                                <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                    ※ GIF 포맷 최적화 값으로 고정됩니다. (최대 50 FPS)
                                </span>
                            </>
                        )}
                    </p>

                    {selectedFormat !== 'png' && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                <label className="modal-label">프레임 (FPS):</label>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--tc-green-dark)', lineHeight: 1 }}>
                                        {selectedFormat === 'gif' ? currentStep.display : zipFps}
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
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
                    >
                        취소
                    </button>
                    <button 
                        className="close-modal-btn" 
                        onClick={handleConfirm}
                    >
                        내보내기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;
