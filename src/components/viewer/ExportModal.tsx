import React, { useState } from 'react';

interface ExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (fps: number) => void;
    format: 'gif' | 'zip';
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, onConfirm, format }) => {
    // GIF 최적화 FPS 단계 (Low -> High 순서로 뒤집음)
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

    const steps = gifSteps; // GIF용 단계만 유지
    const [stepIndex, setStepIndex] = useState(7); // GIF 기본값 (30 FPS)
    const [zipFps, setZipFps] = useState(30);      // ZIP 기본값

    if (!isOpen) return null;

    const isGif = format === 'gif';
    const currentStep = steps[stepIndex] || steps[0];

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ height: 'auto', maxWidth: '400px', padding: '30px' }}>
                <div className="modal-header">
                    <h3 style={{ margin: 0 }}>{format.toUpperCase()} 내보내기 설정</h3>
                </div>

                <div style={{ padding: '24px 0', display: 'flex', flexDirection: 'column', gap: '20px', zIndex: 1 }}>
                    <p className="modal-body-text">
                        {isGif ? '사도의 움직이는 이미지를 생성합니다.' : '사도의 개별 프레임을 압축 파일(.zip)로 생성합니다.'}
                        <br />
                        {isGif && (
                            <span style={{ fontSize: '0.85rem', color: '#666' }}>
                                ※ GIF 포맷 최적화 값으로 고정됩니다. (최대 50 FPS)
                            </span>
                        )}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                            <label className="modal-label">프레임 (FPS):</label>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--tc-green-dark)', lineHeight: 1 }}>
                                    {isGif ? currentStep.display : zipFps}
                                </div>
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            {isGif ? (
                                <input
                                    type="range"
                                    value={stepIndex}
                                    onChange={(e) => setStepIndex(parseInt(e.target.value))}
                                    className="tc-slider"
                                    style={{ "--p": `${(stepIndex / (steps.length - 1)) * 100}%` } as React.CSSProperties}
                                    min="0"
                                    max={steps.length - 1}
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
                        onClick={() => onConfirm(isGif ? currentStep.actual : zipFps)}
                    >
                        추출 시작
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;