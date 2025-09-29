// Dados da aplicação
const appData = {
    "conceito": {
        "definicao": "Título de crédito é o documento necessário ao exercício do direito literal e autônomo nele contido (art. 887, CC)",
        "legislacao": [
            {"titulo": "Letra de Câmbio e Nota Promissória", "lei": "Decreto 57.663/66", "base": "Lei Uniforme de Genebra"},
            {"titulo": "Duplicata", "lei": "Lei 5.474/68", "caracteristica": "Título causal"},
            {"titulo": "Cheque", "lei": "Lei 7.357/85", "caracteristica": "Ordem de pagamento à vista"},
            {"titulo": "Código Civil", "aplicacao": "Subsidiária", "artigos": "887-926"}
        ]
    },
    "questoes": [
        {
            "pergunta": "Qual título de crédito é causal e só pode ser emitido para representar obrigação de compra e venda mercantil ou prestação de serviços?",
            "opcoes": ["Cheque", "Letra de câmbio", "Nota promissória", "Duplicata mercantil"],
            "resposta": 3,
            "explicacao": "A duplicata é título causal, vinculada a operação comercial específica"
        },
        {
            "pergunta": "O princípio que estabelece que só vale o que está escrito no título é:",
            "opcoes": ["Cartularidade", "Literalidade", "Autonomia", "Abstração"],
            "resposta": 1,
            "explicacao": "Literalidade determina que apenas o que está expresso no documento tem validade cambial"
        },
        {
            "pergunta": "Quantos sujeitos tem uma nota promissória?",
            "opcoes": ["1", "2", "3", "4"],
            "resposta": 1,
            "explicacao": "Nota promissória é promessa de pagamento com dois sujeitos: emitente e beneficiário"
        },
        {
            "pergunta": "O endosso que transfere apenas para cobrança é o:",
            "opcoes": ["Em branco", "Em preto", "Mandato", "Caução"],
            "resposta": 2,
            "explicacao": "Endosso-mandato é impróprio, serve apenas para procuração de cobrança"
        },
        {
            "pergunta": "Qual título NÃO admite aceite?",
            "opcoes": ["Letra de câmbio", "Duplicata", "Cheque", "Todos admitem"],
            "resposta": 2,
            "explicacao": "Cheque é ordem de pagamento à vista, não admite aceite"
        }
    ]
};

// Estado da aplicação
let appState = {
    currentSection: 'conceito',
    completedSections: new Set(),
    currentQuizQuestion: 0,
    quizScore: 0,
    quizAnswered: false,
    searchResults: [],
    sidebarOpen: false
};

// Seções disponíveis
const sections = [
    'conceito', 'caracteristicas', 'principios', 'classificacao', 
    'especies', 'operacoes', 'quiz', 'resumo'
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateProgress();
    setupCompletionStatus();
    initializeQuiz();
});

function initializeApp() {
    // Aplicar tema inicial
    const currentTheme = document.documentElement.getAttribute('data-color-scheme') || 'light';
    updateThemeIcon(currentTheme);
    
    // Mostrar seção inicial
    showSection(appState.currentSection);
    updateNavigation();
    updateProgress();
}

function setupEventListeners() {
    // Navegação do menu
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.dataset.section;
            showSection(section);
        });
    });

    // Toggle do sidebar (mobile)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            appState.sidebarOpen = !appState.sidebarOpen;
            sidebar.classList.toggle('active', appState.sidebarOpen);
        });
    }

    // Fechar sidebar ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        
        if (window.innerWidth <= 1024 && appState.sidebarOpen && sidebar && sidebarToggle) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                appState.sidebarOpen = false;
                sidebar.classList.remove('active');
            }
        }
    });

    // Toggle de tema
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Busca
    const searchBtn = document.getElementById('search-btn');
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const closeSearch = document.getElementById('close-search');

    if (searchBtn) {
        searchBtn.addEventListener('click', openSearch);
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', closeSearchModal);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', performSearch);
    }
    
    if (searchOverlay) {
        searchOverlay.addEventListener('click', (e) => {
            if (e.target === searchOverlay) {
                closeSearchModal();
            }
        });
    }

    // Botões de navegação anterior/próximo
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', goToPreviousSection);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', goToNextSection);
    }

    // Botão voltar ao topo
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.addEventListener('click', scrollToTop);
    }

    // Mostrar/ocultar botão voltar ao topo
    window.addEventListener('scroll', () => {
        const backToTop = document.getElementById('back-to-top');
        if (backToTop) {
            const shouldShow = window.scrollY > 200;
            backToTop.classList.toggle('hidden', !shouldShow);
        }
    });

    // Botões de marcar como concluído
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const section = btn.dataset.section;
            toggleSectionCompletion(section);
        });
    });

    // Cards colapsáveis
    document.querySelectorAll('.card-toggle').forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = toggle.dataset.target;
            const content = document.getElementById(targetId);
            const card = toggle.closest('.collapsible-card');
            const icon = toggle.querySelector('.toggle-icon');
            
            if (content && card) {
                const isActive = content.classList.contains('active');
                content.classList.toggle('active', !isActive);
                card.classList.toggle('active', !isActive);
            }
        });
    });

    // Quiz
    setupQuizListeners();

    // Atalhos de teclado
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function showSection(sectionId) {
    // Esconder todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar seção selecionada
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        appState.currentSection = sectionId;
    }

    // Atualizar navegação
    updateNavigation();
    
    // Scroll para o topo
    scrollToTop();
    
    // Fechar sidebar em mobile
    if (window.innerWidth <= 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            appState.sidebarOpen = false;
        }
    }
}

function updateNavigation() {
    // Atualizar links ativos
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === appState.currentSection) {
            link.classList.add('active');
        }
    });

    // Atualizar botões anterior/próximo
    const currentIndex = sections.indexOf(appState.currentSection);
    const prevBtn = document.getElementById('prev-section');
    const nextBtn = document.getElementById('next-section');

    if (prevBtn) {
        prevBtn.disabled = currentIndex <= 0;
        prevBtn.style.opacity = currentIndex <= 0 ? '0.5' : '1';
    }

    if (nextBtn) {
        nextBtn.disabled = currentIndex >= sections.length - 1;
        nextBtn.style.opacity = currentIndex >= sections.length - 1 ? '0.5' : '1';
    }
}

function updateProgress() {
    const totalSections = sections.length;
    const completedCount = appState.completedSections.size;
    const progressPercentage = (completedCount / totalSections) * 100;

    const progressFill = document.getElementById('progress-fill');
    const progressText = document.getElementById('progress-text');

    if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
    }

    if (progressText) {
        progressText.textContent = `${Math.round(progressPercentage)}% concluído`;
    }

    // Atualizar botões de conclusão
    document.querySelectorAll('.complete-btn').forEach(btn => {
        const section = btn.dataset.section;
        const isCompleted = appState.completedSections.has(section);
        
        btn.classList.toggle('completed', isCompleted);
        btn.innerHTML = isCompleted 
            ? '<i class="fas fa-check"></i> Concluído'
            : '<i class="fas fa-check"></i> Marcar como Concluído';
    });
}

function toggleSectionCompletion(section) {
    if (appState.completedSections.has(section)) {
        appState.completedSections.delete(section);
    } else {
        appState.completedSections.add(section);
    }
    
    updateProgress();
    updateCompletionStatus();
}

function setupCompletionStatus() {
    const completionContainer = document.getElementById('completion-status');
    if (!completionContainer) return;

    const sectionNames = {
        'conceito': 'Conceito e Legislação',
        'caracteristicas': 'Características Cambiais',
        'principios': 'Princípios CALIA',
        'classificacao': 'Classificação',
        'especies': 'Espécies Principais',
        'operacoes': 'Operações Cambiais',
        'quiz': 'Quiz Interativo',
        'resumo': 'Resumo Final'
    };

    completionContainer.innerHTML = sections.map(section => {
        const isCompleted = appState.completedSections.has(section);
        return `
            <div class="completion-item ${isCompleted ? 'completed' : ''}">
                <i class="fas ${isCompleted ? 'fa-check-circle' : 'fa-circle'}"></i>
                <span>${sectionNames[section]}</span>
            </div>
        `;
    }).join('');
}

function updateCompletionStatus() {
    setupCompletionStatus();
}

function goToPreviousSection() {
    const currentIndex = sections.indexOf(appState.currentSection);
    if (currentIndex > 0) {
        showSection(sections[currentIndex - 1]);
    }
}

function goToNextSection() {
    const currentIndex = sections.indexOf(appState.currentSection);
    if (currentIndex < sections.length - 1) {
        showSection(sections[currentIndex + 1]);
    }
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-color-scheme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-color-scheme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const themeIcon = document.querySelector('#theme-toggle i');
    if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
}

function openSearch() {
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    
    if (searchOverlay) {
        searchOverlay.classList.remove('hidden');
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
}

function closeSearchModal() {
    const searchOverlay = document.getElementById('search-overlay');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (searchOverlay) {
        searchOverlay.classList.add('hidden');
    }
    
    if (searchInput) {
        searchInput.value = '';
    }
    
    if (searchResults) {
        searchResults.innerHTML = '';
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.toLowerCase().trim();

    if (!query) {
        searchResults.innerHTML = '';
        return;
    }

    const results = [];
    
    // Buscar em todas as seções
    document.querySelectorAll('.content-section').forEach(section => {
        const sectionId = section.id;
        const sectionTitle = section.querySelector('.section-header h2')?.textContent || '';
        const sectionText = section.textContent.toLowerCase();
        
        if (sectionText.includes(query)) {
            const paragraphs = section.querySelectorAll('p, li, h3, h4, h5');
            paragraphs.forEach(p => {
                const text = p.textContent.toLowerCase();
                if (text.includes(query)) {
                    results.push({
                        section: sectionId,
                        title: sectionTitle,
                        content: p.textContent.substring(0, 150) + '...',
                        element: p
                    });
                }
            });
        }
    });

    // Mostrar resultados
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="search-result-item">Nenhum resultado encontrado</div>';
    } else {
        searchResults.innerHTML = results.slice(0, 10).map(result => `
            <div class="search-result-item" onclick="goToSearchResult('${result.section}')">
                <div class="search-result-title">${result.title}</div>
                <div class="search-result-content">${result.content}</div>
            </div>
        `).join('');
    }
}

function goToSearchResult(sectionId) {
    closeSearchModal();
    showSection(sectionId);
}

// Quiz
function initializeQuiz() {
    appState.currentQuizQuestion = 0;
    appState.quizScore = 0;
    appState.quizAnswered = false;
    
    if (appData.questoes && appData.questoes.length > 0) {
        displayQuestion();
    }
}

function setupQuizListeners() {
    const nextBtn = document.getElementById('quiz-next');
    const restartBtn = document.getElementById('quiz-restart');
    const startOverBtn = document.getElementById('quiz-start-over');

    if (nextBtn) {
        nextBtn.addEventListener('click', nextQuestion);
    }
    
    if (restartBtn) {
        restartBtn.addEventListener('click', restartQuiz);
    }
    
    if (startOverBtn) {
        startOverBtn.addEventListener('click', restartQuiz);
    }
}

function displayQuestion() {
    const question = appData.questoes[appState.currentQuizQuestion];
    if (!question) return;

    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('quiz-options');
    const counter = document.getElementById('quiz-counter');
    const progressBar = document.getElementById('quiz-progress');
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next');

    // Atualizar pergunta
    if (questionText) {
        questionText.textContent = question.pergunta;
    }

    // Atualizar contador
    if (counter) {
        counter.textContent = `Questão ${appState.currentQuizQuestion + 1} de ${appData.questoes.length}`;
    }

    // Atualizar barra de progresso
    if (progressBar) {
        const progress = ((appState.currentQuizQuestion) / appData.questoes.length) * 100;
        progressBar.style.width = `${progress}%`;
    }

    // Criar opções
    if (optionsContainer) {
        optionsContainer.innerHTML = question.opcoes.map((opcao, index) => `
            <button class="quiz-option" onclick="selectAnswer(${index})" data-index="${index}">
                ${opcao}
            </button>
        `).join('');
    }

    // Resetar feedback e botões
    if (feedback) {
        feedback.classList.remove('show', 'correct', 'incorrect');
        feedback.innerHTML = '';
    }

    if (nextBtn) {
        nextBtn.classList.add('hidden');
    }

    appState.quizAnswered = false;
}

// Tornar função global para onclick
window.selectAnswer = function(selectedIndex) {
    if (appState.quizAnswered) return;

    const question = appData.questoes[appState.currentQuizQuestion];
    const options = document.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quiz-feedback');
    const nextBtn = document.getElementById('quiz-next');
    const correctIndex = question.resposta;

    appState.quizAnswered = true;

    // Marcar opções
    options.forEach((option, index) => {
        option.disabled = true;
        if (index === correctIndex) {
            option.classList.add('correct');
        } else if (index === selectedIndex && index !== correctIndex) {
            option.classList.add('incorrect');
        }
        if (index === selectedIndex) {
            option.classList.add('selected');
        }
    });

    // Mostrar feedback
    const isCorrect = selectedIndex === correctIndex;
    if (isCorrect) {
        appState.quizScore++;
    }

    if (feedback) {
        feedback.innerHTML = `
            <strong>${isCorrect ? 'Correto!' : 'Incorreto!'}</strong><br>
            ${question.explicacao}
        `;
        feedback.classList.add('show', isCorrect ? 'correct' : 'incorrect');
    }

    // Mostrar botão próximo ou resultado
    if (appState.currentQuizQuestion < appData.questoes.length - 1) {
        if (nextBtn) {
            nextBtn.classList.remove('hidden');
        }
    } else {
        setTimeout(showQuizResult, 1500);
    }
};

function nextQuestion() {
    appState.currentQuizQuestion++;
    if (appState.currentQuizQuestion < appData.questoes.length) {
        displayQuestion();
    } else {
        showQuizResult();
    }
}

function showQuizResult() {
    const questionContainer = document.querySelector('.quiz-question');
    const resultContainer = document.getElementById('quiz-result');
    const scoreElement = document.getElementById('quiz-score');
    const progressBar = document.getElementById('quiz-progress');

    // Esconder pergunta
    if (questionContainer) {
        questionContainer.style.display = 'none';
    }

    // Mostrar resultado
    if (resultContainer) {
        resultContainer.classList.remove('hidden');
    }

    // Atualizar pontuação
    const percentage = Math.round((appState.quizScore / appData.questoes.length) * 100);
    let performanceText = '';
    let performanceClass = '';

    if (percentage >= 80) {
        performanceText = 'Excelente! 🎉';
        performanceClass = 'success';
    } else if (percentage >= 60) {
        performanceText = 'Bom trabalho! 👍';
        performanceClass = 'warning';
    } else {
        performanceText = 'Continue estudando! 📚';
        performanceClass = 'error';
    }

    if (scoreElement) {
        scoreElement.innerHTML = `
            <div class="status status--${performanceClass}">
                ${performanceText}
            </div>
            <div style="margin-top: 16px;">
                <strong>${appState.quizScore} de ${appData.questoes.length} corretas</strong><br>
                <span style="font-size: 18px;">${percentage}%</span>
            </div>
        `;
    }

    // Completar barra de progresso
    if (progressBar) {
        progressBar.style.width = '100%';
    }

    // Marcar quiz como concluído se pontuação for boa
    if (percentage >= 60) {
        appState.completedSections.add('quiz');
        updateProgress();
        updateCompletionStatus();
    }
}

function restartQuiz() {
    const questionContainer = document.querySelector('.quiz-question');
    const resultContainer = document.getElementById('quiz-result');

    // Mostrar pergunta, esconder resultado
    if (questionContainer) {
        questionContainer.style.display = 'block';
    }
    if (resultContainer) {
        resultContainer.classList.add('hidden');
    }

    // Resetar estado
    initializeQuiz();
}

// Tornar função global para onclick
window.goToSearchResult = function(sectionId) {
    closeSearchModal();
    showSection(sectionId);
};

// Atalhos de teclado
function handleKeyboardShortcuts(e) {
    // ESC para fechar busca
    if (e.key === 'Escape') {
        const searchOverlay = document.getElementById('search-overlay');
        if (searchOverlay && !searchOverlay.classList.contains('hidden')) {
            closeSearchModal();
        }
    }
    
    // Ctrl/Cmd + K para abrir busca
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        openSearch();
    }
    
    // Setas para navegação
    if (e.altKey) {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            goToPreviousSection();
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            goToNextSection();
        }
    }
}

// Gerenciamento de eventos de redimensionamento
window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.remove('active');
            appState.sidebarOpen = false;
        }
    }
});

// Log de inicialização
console.log('🎓 Aplicação Títulos de Crédito carregada com sucesso!');