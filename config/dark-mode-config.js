/**
 * 다크모드 설정 파일
 * 
 * 🎯 목적:
 * - 다크모드 색상 및 스타일 중앙 관리
 * - 일관된 다크모드 테마 적용
 * - 쉬운 테마 커스터마이징
 * 
 * @version 1.0.0
 * @since 2024-12-29
 */

export const darkModeConfig = {
    // 기본 색상 팔레트
    colors: {
        // 배경 색상
        background: {
            primary: '#1a1a1a',      // 메인 배경
            secondary: '#2d2d2d',    // 카드/컨테이너 배경
            tertiary: '#3a3a3a',     // 호버/액티브 배경
            overlay: 'rgba(0, 0, 0, 0.7)', // 오버레이 배경
        },
        
        // 텍스트 색상
        text: {
            primary: '#f7fafc',      // 주요 텍스트
            secondary: '#a0aec0',    // 보조 텍스트
            muted: '#718096',        // 비활성 텍스트
            inverse: '#1a202c',      // 반전 텍스트
        },
        
        // 테두리 색상
        border: {
            primary: '#4a5568',      // 주요 테두리
            secondary: '#718096',    // 보조 테두리
            muted: '#a0aec0',        // 비활성 테두리
            focus: '#4dabf7',        // 포커스 테두리
        },
        
        // 상태 색상
        status: {
            success: '#48bb78',      // 성공
            warning: '#ed8936',      // 경고
            error: '#f56565',        // 오류
            info: '#4299e1',         // 정보
        },
        
        // 브랜드 색상
        brand: {
            primary: '#4dabf7',      // 주요 브랜드 색상
            secondary: '#667eea',    // 보조 브랜드 색상
            accent: '#9f7aea',       // 강조 색상
        }
    },
    
    // 그림자 설정
    shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px rgba(0, 0, 0, 0.3)',
        lg: '0 10px 15px rgba(0, 0, 0, 0.4)',
        xl: '0 20px 25px rgba(0, 0, 0, 0.5)',
        '2xl': '0 25px 50px rgba(0, 0, 0, 0.6)',
    },
    
    // 애니메이션 설정
    animations: {
        duration: {
            fast: '0.15s',
            normal: '0.3s',
            slow: '0.5s',
        },
        easing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        }
    },
    
    // 컴포넌트별 설정
    components: {
        // 버튼
        button: {
            primary: {
                background: '#4dabf7',
                color: '#ffffff',
                border: '1px solid #4dabf7',
                hover: {
                    background: '#4299e1',
                    transform: 'translateY(-1px)',
                }
            },
            secondary: {
                background: 'transparent',
                color: '#4dabf7',
                border: '1px solid #4dabf7',
                hover: {
                    background: '#4dabf7',
                    color: '#ffffff',
                }
            }
        },
        
        // 카드
        card: {
            background: '#2d2d2d',
            border: '1px solid #4a5568',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            hover: {
                transform: 'translateY(-2px)',
                boxShadow: '0 10px 15px rgba(0, 0, 0, 0.4)',
            }
        },
        
        // 입력 필드
        input: {
            background: '#2d2d2d',
            color: '#f7fafc',
            border: '1px solid #4a5568',
            borderRadius: '8px',
            padding: '12px 16px',
            focus: {
                borderColor: '#4dabf7',
                boxShadow: '0 0 0 3px rgba(77, 171, 247, 0.1)',
            }
        },
        
        // 모달
        modal: {
            background: '#2d2d2d',
            border: '1px solid #4a5568',
            borderRadius: '16px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.6)',
            overlay: 'rgba(0, 0, 0, 0.7)',
        },
        
        // 네비게이션
        navigation: {
            background: '#2d2d2d',
            border: '1px solid #4a5568',
            boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.3)',
            item: {
                color: '#a0aec0',
                hover: {
                    color: '#4dabf7',
                    background: '#3a3a3a',
                },
                active: {
                    color: '#4dabf7',
                    background: '#3a3a3a',
                }
            }
        }
    },
    
    // 페이지별 설정
    pages: {
        home: {
            cardBackground: '#2d2d2d',
            cardBorder: '#4a5568',
            titleColor: '#f7fafc',
            subtitleColor: '#a0aec0',
        },
        search: {
            inputBackground: '#2d2d2d',
            inputBorder: '#4a5568',
            resultBackground: '#2d2d2d',
            resultBorder: '#4a5568',
        },
        calendar: {
            gridBackground: '#2d2d2d',
            dayBackground: '#3a3a3a',
            todayBackground: '#4dabf7',
            selectedBackground: '#667eea',
        },
        myLogs: {
            profileBackground: '#2d2d2d',
            statsBackground: '#3a3a3a',
            cardBackground: '#2d2d2d',
            menuBackground: '#2d2d2d',
        }
    },
    
    // 접근성 설정
    accessibility: {
        // 고대비 모드
        highContrast: {
            background: {
                primary: '#000000',
                secondary: '#1a1a1a',
            },
            text: {
                primary: '#ffffff',
                secondary: '#ffffff',
            },
            border: {
                primary: '#ffffff',
                secondary: '#ffffff',
            }
        },
        
        // 애니메이션 감소
        reducedMotion: {
            duration: '0.01s',
            easing: 'linear',
        }
    },
    
    // 자동 수정 설정
    autoFix: {
        enabled: true,
        contrastThreshold: 4.5, // WCAG AA 기준
        brightnessThreshold: 128,
        autoConvertColors: true,
        autoConvertShadows: true,
    },
    
    // 검증 규칙
    validation: {
        requiredProperties: [
            'background-color',
            'color',
            'border-color'
        ],
        optionalProperties: [
            'box-shadow',
            'text-shadow',
            'outline'
        ],
        forbiddenValues: [
            'transparent',
            'inherit',
            'initial',
            'unset'
        ]
    }
};

// CSS 변수 생성 함수
export function generateCSSVariables(config = darkModeConfig) {
    const variables = {};
    
    // 색상 변수 생성
    Object.entries(config.colors).forEach(([category, colors]) => {
        Object.entries(colors).forEach(([name, value]) => {
            const varName = `--dark-${category}-${name}`;
            variables[varName] = value;
        });
    });
    
    // 그림자 변수 생성
    Object.entries(config.shadows).forEach(([name, value]) => {
        variables[`--dark-shadow-${name}`] = value;
    });
    
    // 애니메이션 변수 생성
    Object.entries(config.animations.duration).forEach(([name, value]) => {
        variables[`--dark-duration-${name}`] = value;
    });
    
    Object.entries(config.animations.easing).forEach(([name, value]) => {
        variables[`--dark-easing-${name}`] = value;
    });
    
    return variables;
}

// CSS 변수를 CSS 문자열로 변환
export function generateCSSString(config = darkModeConfig) {
    const variables = generateCSSVariables(config);
    let css = ':root.dark {\n';
    
    Object.entries(variables).forEach(([name, value]) => {
        css += `    ${name}: ${value};\n`;
    });
    
    css += '}\n';
    
    return css;
}

// 컴포넌트별 CSS 생성
export function generateComponentCSS(componentName, config = darkModeConfig) {
    const component = config.components[componentName];
    if (!component) return '';
    
    let css = `.dark .${componentName} {\n`;
    
    Object.entries(component).forEach(([property, value]) => {
        if (typeof value === 'string' || typeof value === 'number') {
            css += `    ${property}: ${value};\n`;
        }
    });
    
    css += '}\n';
    
    // 호버 상태
    if (component.hover) {
        css += `.dark .${componentName}:hover {\n`;
        Object.entries(component.hover).forEach(([property, value]) => {
            css += `    ${property}: ${value};\n`;
        });
        css += '}\n';
    }
    
    // 액티브 상태
    if (component.active) {
        css += `.dark .${componentName}.active {\n`;
        Object.entries(component.active).forEach(([property, value]) => {
            css += `    ${property}: ${value};\n`;
        });
        css += '}\n';
    }
    
    return css;
}

// 페이지별 CSS 생성
export function generatePageCSS(pageName, config = darkModeConfig) {
    const page = config.pages[pageName];
    if (!page) return '';
    
    let css = `.dark .${pageName}-container {\n`;
    
    Object.entries(page).forEach(([property, value]) => {
        css += `    ${property}: ${value};\n`;
    });
    
    css += '}\n';
    
    return css;
}

// 전체 다크모드 CSS 생성
export function generateFullDarkModeCSS(config = darkModeConfig) {
    let css = '';
    
    // 기본 변수
    css += generateCSSString(config);
    css += '\n';
    
    // 컴포넌트별 CSS
    Object.keys(config.components).forEach(component => {
        css += generateComponentCSS(component, config);
        css += '\n';
    });
    
    // 페이지별 CSS
    Object.keys(config.pages).forEach(page => {
        css += generatePageCSS(page, config);
        css += '\n';
    });
    
    return css;
}

// 설정 검증
export function validateConfig(config = darkModeConfig) {
    const errors = [];
    
    // 필수 섹션 확인
    const requiredSections = ['colors', 'shadows', 'animations', 'components'];
    requiredSections.forEach(section => {
        if (!config[section]) {
            errors.push(`필수 섹션 누락: ${section}`);
        }
    });
    
    // 색상 형식 검증
    if (config.colors) {
        Object.entries(config.colors).forEach(([category, colors]) => {
            Object.entries(colors).forEach(([name, value]) => {
                if (typeof value !== 'string') {
                    errors.push(`잘못된 색상 형식: ${category}.${name}`);
                }
            });
        });
    }
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}

export default darkModeConfig;
