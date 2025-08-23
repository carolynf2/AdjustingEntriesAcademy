class AdjustingEntriesAcademy {
    constructor() {
        this.currentSection = 'overview';
        this.currentLesson = 'accrued-revenue';
        this.score = 0;
        this.totalQuestions = 0;
        this.completedLessons = new Set();
        this.challengeStartTime = null;
        this.challengeQuestions = [];
        this.challengeCurrentIndex = 0;
        this.challengeCorrect = 0;
        
        this.accounts = {
            assets: ['Cash', 'Accounts Receivable', 'Interest Receivable', 'Prepaid Insurance', 'Prepaid Rent', 'Office Supplies', 'Equipment', 'Accumulated Depreciation - Equipment'],
            liabilities: ['Accounts Payable', 'Interest Payable', 'Salaries Payable', 'Unearned Revenue', 'Unearned Service Revenue'],
            equity: ['Owner\'s Capital', 'Retained Earnings'],
            revenues: ['Service Revenue', 'Interest Revenue', 'Rent Revenue'],
            expenses: ['Salary Expense', 'Interest Expense', 'Insurance Expense', 'Rent Expense', 'Supplies Expense', 'Depreciation Expense']
        };
        
        this.lessonData = this.initializeLessonData();
        this.practiceProblems = this.initializePracticeProblems();
        
        this.init();
    }

    init() {
        this.bindEvents();
        this.showSection('overview');
        this.updateProgress();
        this.populateAccountSelectors();
    }

    bindEvents() {
        // Navigation buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showSection(e.target.dataset.section);
            });
        });
        
        // Lesson buttons
        document.querySelectorAll('.lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showLesson(e.target.dataset.lesson);
            });
        });
        
        // Practice controls
        document.getElementById('newPractice').addEventListener('click', () => this.generatePracticeProble());
        document.getElementById('showHint').addEventListener('click', () => this.showHint());
        
        // Entry builder
        document.getElementById('debitAccount').addEventListener('change', () => this.updateJournalPreview());
        document.getElementById('creditAccount').addEventListener('change', () => this.updateJournalPreview());
        document.getElementById('entryAmount').addEventListener('input', () => this.updateJournalPreview());
    }

    showSection(sectionName) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');
        
        // Update sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName).classList.add('active');
        
        this.currentSection = sectionName;
        
        // Load section content
        if (sectionName === 'lessons') {
            this.showLesson(this.currentLesson);
        } else if (sectionName === 'practice') {
            this.generatePracticeProble();
        }
    }

    showLesson(lessonType) {
        this.currentLesson = lessonType;
        
        // Update lesson buttons
        document.querySelectorAll('.lesson-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lesson="${lessonType}"]`).classList.add('active');
        
        // Display lesson content
        const lesson = this.lessonData[lessonType];
        const contentDiv = document.getElementById('lessonContent');
        
        contentDiv.innerHTML = `
            <div class="lesson-step">
                <h4>📚 What is ${lesson.title}?</h4>
                <p>${lesson.definition}</p>
            </div>
            
            <div class="lesson-step">
                <h4>🎯 When to Use</h4>
                <p>${lesson.when}</p>
            </div>
            
            <div class="lesson-step">
                <h4>💡 How to Identify</h4>
                <p>${lesson.identify}</p>
            </div>
            
            <div class="example-box">
                <h5>📝 Example Scenario</h5>
                <p>${lesson.example.scenario}</p>
                
                <div class="journal-entry">
                    <h5>Journal Entry:</h5>
                    <table class="journal-table">
                        <thead>
                            <tr>
                                <th>Account</th>
                                <th>Debit</th>
                                <th>Credit</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>${lesson.example.debitAccount}</td>
                                <td>$${lesson.example.amount}</td>
                                <td></td>
                            </tr>
                            <tr>
                                <td style="padding-left: 30px;">${lesson.example.creditAccount}</td>
                                <td></td>
                                <td>$${lesson.example.amount}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                
                <p style="margin-top: 15px;"><strong>Explanation:</strong> ${lesson.example.explanation}</p>
            </div>
            
            <div class="lesson-step">
                <h4>🔍 Key Points to Remember</h4>
                <ul>
                    ${lesson.keyPoints.map(point => `<li>${point}</li>`).join('')}
                </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <button class="cta-button" onclick="academy.completeLesson('${lessonType}')">
                    Mark Lesson Complete ✓
                </button>
            </div>
        `;
    }

    completeLesson(lessonType) {
        this.completedLessons.add(lessonType);
        this.score += 10;
        this.totalQuestions++;
        this.updateProgress();
        this.showNotification(`Great job! You completed the ${this.lessonData[lessonType].title} lesson!`, 'success');
    }

    generatePracticeProble() {
        const practiceType = document.getElementById('practiceType').value;
        let availableProblems;
        
        if (practiceType === 'all') {
            availableProblems = Object.values(this.practiceProblems).flat();
        } else {
            availableProblems = this.practiceProblems[practiceType] || [];
        }
        
        if (availableProblems.length === 0) {
            this.showNotification('No practice problems available for this type', 'error');
            return;
        }
        
        const problem = availableProblems[Math.floor(Math.random() * availableProblems.length)];
        this.currentPracticeProble = problem;
        
        const practiceArea = document.getElementById('practiceArea');
        practiceArea.innerHTML = `
            <div class="practice-problem">
                <div class="problem-scenario">
                    <h4>📋 Scenario</h4>
                    <p>${problem.scenario}</p>
                </div>
                
                <div class="problem-question">
                    <h4>❓ Question</h4>
                    <p>${problem.question}</p>
                </div>
                
                <div class="answer-options">
                    ${problem.options.map((option, index) => `
                        <div class="answer-option" onclick="academy.selectAnswer(${index})">
                            ${option}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="cta-button" onclick="academy.checkAnswer()">
                        Check Answer
                    </button>
                    <button class="cta-button" onclick="academy.openEntryBuilder()" style="margin-left: 15px; background: var(--warning-color);">
                        Build Entry
                    </button>
                </div>
                
                <div id="hintArea" style="display: none; margin-top: 20px;">
                    <div class="example-box">
                        <h5>💡 Hint</h5>
                        <p>${problem.hint}</p>
                    </div>
                </div>
            </div>
        `;
        
        this.selectedAnswer = null;
    }

    selectAnswer(index) {
        // Clear previous selections
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        
        // Select current answer
        document.querySelectorAll('.answer-option')[index].classList.add('selected');
        this.selectedAnswer = index;
    }

    checkAnswer() {
        if (this.selectedAnswer === null) {
            this.showNotification('Please select an answer first', 'error');
            return;
        }
        
        const isCorrect = this.selectedAnswer === this.currentPracticeProble.correct;
        
        // Update visual feedback
        document.querySelectorAll('.answer-option').forEach((opt, index) => {
            if (index === this.currentPracticeProble.correct) {
                opt.classList.add('correct');
            } else if (index === this.selectedAnswer && !isCorrect) {
                opt.classList.add('incorrect');
            }
        });
        
        // Update score
        this.totalQuestions++;
        if (isCorrect) {
            this.score += 5;
        }
        
        this.updateProgress();
        
        // Show feedback
        const feedbackTitle = isCorrect ? '🎉 Correct!' : '❌ Incorrect';
        const feedbackContent = `
            <div class="feedback-${isCorrect ? 'correct' : 'incorrect'}">
                <h4>${feedbackTitle}</h4>
                <p><strong>Your answer:</strong> ${this.currentPracticeProble.options[this.selectedAnswer]}</p>
                <p><strong>Correct answer:</strong> ${this.currentPracticeProble.options[this.currentPracticeProble.correct]}</p>
                <div class="feedback-explanation">
                    <p><strong>Explanation:</strong> ${this.currentPracticeProble.explanation}</p>
                </div>
            </div>
        `;
        
        this.showFeedback(feedbackTitle, feedbackContent);
    }

    showHint() {
        const hintArea = document.getElementById('hintArea');
        hintArea.style.display = hintArea.style.display === 'none' ? 'block' : 'none';
    }

    openEntryBuilder() {
        if (!this.currentPracticeProble) {
            this.showNotification('Please generate a practice problem first', 'error');
            return;
        }
        
        document.getElementById('entryBuilderModal').style.display = 'block';
        this.populateAccountSelectors();
        this.clearEntryBuilder();
    }

    closeEntryBuilder() {
        document.getElementById('entryBuilderModal').style.display = 'none';
    }

    populateAccountSelectors() {
        const debitSelect = document.getElementById('debitAccount');
        const creditSelect = document.getElementById('creditAccount');
        
        // Clear existing options
        debitSelect.innerHTML = '<option value="">Select Debit Account</option>';
        creditSelect.innerHTML = '<option value="">Select Credit Account</option>';
        
        // Add all accounts
        Object.values(this.accounts).flat().forEach(account => {
            debitSelect.innerHTML += `<option value="${account}">${account}</option>`;
            creditSelect.innerHTML += `<option value="${account}">${account}</option>`;
        });
    }

    updateJournalPreview() {
        const debitAccount = document.getElementById('debitAccount').value;
        const creditAccount = document.getElementById('creditAccount').value;
        const amount = parseFloat(document.getElementById('entryAmount').value) || 0;
        
        const preview = document.getElementById('journalPreview');
        
        if (debitAccount || creditAccount || amount > 0) {
            preview.innerHTML = `
                ${debitAccount ? `
                    <tr>
                        <td>${debitAccount}</td>
                        <td>$${amount.toFixed(2)}</td>
                        <td></td>
                    </tr>
                ` : ''}
                ${creditAccount ? `
                    <tr>
                        <td style="padding-left: 30px;">${creditAccount}</td>
                        <td></td>
                        <td>$${amount.toFixed(2)}</td>
                    </tr>
                ` : ''}
            `;
        } else {
            preview.innerHTML = '<tr><td colspan="3" style="text-align: center; color: #666;">Preview will appear here</td></tr>';
        }
    }

    clearEntryBuilder() {
        document.getElementById('debitAccount').value = '';
        document.getElementById('creditAccount').value = '';
        document.getElementById('entryAmount').value = '';
        this.updateJournalPreview();
    }

    submitEntry() {
        const debitAccount = document.getElementById('debitAccount').value;
        const creditAccount = document.getElementById('creditAccount').value;
        const amount = parseFloat(document.getElementById('entryAmount').value);
        
        if (!debitAccount || !creditAccount || !amount) {
            this.showNotification('Please complete all fields', 'error');
            return;
        }
        
        // Check if entry matches the correct answer
        const correct = this.currentPracticeProble.correctEntry;
        const isCorrect = (
            debitAccount === correct.debit &&
            creditAccount === correct.credit &&
            Math.abs(amount - correct.amount) < 0.01
        );
        
        // Update score
        this.totalQuestions++;
        if (isCorrect) {
            this.score += 10;
        }
        
        this.updateProgress();
        
        // Show feedback
        const feedbackTitle = isCorrect ? '🎉 Perfect Entry!' : '🔍 Review Your Entry';
        const feedbackContent = `
            <div class="feedback-${isCorrect ? 'correct' : 'incorrect'}">
                <h4>${feedbackTitle}</h4>
                <p><strong>Your Entry:</strong></p>
                <div class="journal-entry" style="margin: 10px 0;">
                    <table class="journal-table">
                        <tr><td>${debitAccount}</td><td>$${amount.toFixed(2)}</td><td></td></tr>
                        <tr><td style="padding-left: 30px;">${creditAccount}</td><td></td><td>$${amount.toFixed(2)}</td></tr>
                    </table>
                </div>
                <p><strong>Correct Entry:</strong></p>
                <div class="journal-entry" style="margin: 10px 0;">
                    <table class="journal-table">
                        <tr><td>${correct.debit}</td><td>$${correct.amount.toFixed(2)}</td><td></td></tr>
                        <tr><td style="padding-left: 30px;">${correct.credit}</td><td></td><td>$${correct.amount.toFixed(2)}</td></tr>
                    </table>
                </div>
                <div class="feedback-explanation">
                    <p><strong>Explanation:</strong> ${this.currentPracticeProble.explanation}</p>
                </div>
            </div>
        `;
        
        this.closeEntryBuilder();
        this.showFeedback(feedbackTitle, feedbackContent);
    }

    startChallenge() {
        this.challengeStartTime = Date.now();
        this.challengeQuestions = this.generateChallengeQuestions();
        this.challengeCurrentIndex = 0;
        this.challengeCorrect = 0;
        
        this.showChallengeQuestion();
        this.updateChallengeTimer();
    }

    generateChallengeQuestions() {
        const allProblems = Object.values(this.practiceProblems).flat();
        const shuffled = allProblems.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 10);
    }

    showChallengeQuestion() {
        const question = this.challengeQuestions[this.challengeCurrentIndex];
        const challengeArea = document.getElementById('challengeArea');
        
        challengeArea.innerHTML = `
            <div class="practice-problem">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h3>Question ${this.challengeCurrentIndex + 1} of ${this.challengeQuestions.length}</h3>
                </div>
                
                <div class="problem-scenario">
                    <h4>📋 Scenario</h4>
                    <p>${question.scenario}</p>
                </div>
                
                <div class="problem-question">
                    <h4>❓ Question</h4>
                    <p>${question.question}</p>
                </div>
                
                <div class="answer-options">
                    ${question.options.map((option, index) => `
                        <div class="answer-option" onclick="academy.selectChallengeAnswer(${index})">
                            ${option}
                        </div>
                    `).join('')}
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <button class="cta-button" onclick="academy.submitChallengeAnswer()">
                        Submit Answer
                    </button>
                </div>
            </div>
        `;
        
        this.selectedChallengeAnswer = null;
        document.getElementById('challengeProgress').textContent = `${this.challengeCurrentIndex + 1}/10`;
    }

    selectChallengeAnswer(index) {
        document.querySelectorAll('.answer-option').forEach(opt => {
            opt.classList.remove('selected');
        });
        document.querySelectorAll('.answer-option')[index].classList.add('selected');
        this.selectedChallengeAnswer = index;
    }

    submitChallengeAnswer() {
        if (this.selectedChallengeAnswer === null) {
            this.showNotification('Please select an answer', 'error');
            return;
        }
        
        const question = this.challengeQuestions[this.challengeCurrentIndex];
        const isCorrect = this.selectedChallengeAnswer === question.correct;
        
        if (isCorrect) {
            this.challengeCorrect++;
            this.score += 5;
        }
        
        this.totalQuestions++;
        this.challengeCurrentIndex++;
        
        // Update accuracy
        const accuracy = Math.round((this.challengeCorrect / (this.challengeCurrentIndex)) * 100);
        document.getElementById('challengeAccuracy').textContent = `${accuracy}%`;
        
        if (this.challengeCurrentIndex < this.challengeQuestions.length) {
            setTimeout(() => this.showChallengeQuestion(), 1000);
        } else {
            this.completChallenge();
        }
        
        this.updateProgress();
    }

    completChallenge() {
        const finalAccuracy = Math.round((this.challengeCorrect / this.challengeQuestions.length) * 100);
        const timeElapsed = Math.round((Date.now() - this.challengeStartTime) / 1000);
        
        const challengeArea = document.getElementById('challengeArea');
        challengeArea.innerHTML = `
            <div style="text-align: center;">
                <h2>🎉 Challenge Complete!</h2>
                <div class="challenge-stats" style="margin: 30px 0;">
                    <div class="stat">
                        <span class="stat-label">Final Score:</span>
                        <span style="color: var(--success-color);">${this.challengeCorrect}/${this.challengeQuestions.length}</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Accuracy:</span>
                        <span style="color: var(--success-color);">${finalAccuracy}%</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">Time:</span>
                        <span>${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')}</span>
                    </div>
                </div>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
                    <h3>Performance Review</h3>
                    <p>${this.getChallengeReview(finalAccuracy)}</p>
                </div>
                
                <button class="start-challenge-btn" onclick="academy.startChallenge()" style="background: var(--secondary-color);">
                    Try Again
                </button>
            </div>
        `;
    }

    getChallengeReview(accuracy) {
        if (accuracy >= 90) return "Excellent work! You've mastered adjusting entries!";
        if (accuracy >= 80) return "Great job! You have a solid understanding of adjusting entries.";
        if (accuracy >= 70) return "Good effort! Review the lessons and try again to improve.";
        return "Keep practicing! Review each lesson type and focus on the key concepts.";
    }

    updateChallengeTimer() {
        if (this.challengeStartTime && this.challengeCurrentIndex < this.challengeQuestions.length) {
            const elapsed = Math.round((Date.now() - this.challengeStartTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            document.getElementById('challengeTime').textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            setTimeout(() => this.updateChallengeTimer(), 1000);
        }
    }

    updateProgress() {
        const progress = this.totalQuestions > 0 ? (this.score / (this.totalQuestions * 10)) * 100 : 0;
        document.getElementById('progressFill').style.width = `${Math.min(progress, 100)}%`;
        document.getElementById('currentScore').textContent = this.score;
        document.getElementById('totalScore').textContent = this.totalQuestions * 10;
        
        // Update learning path
        const pathItems = ['lessonsPath', 'practicePath', 'challengePath'];
        pathItems.forEach((pathId, index) => {
            const element = document.getElementById(pathId);
            if (this.completedLessons.size > index) {
                element.classList.add('completed');
            } else if (this.score > index * 50) {
                element.classList.add('active');
            }
        });
    }

    showFeedback(title, content) {
        document.getElementById('feedbackTitle').textContent = title;
        document.getElementById('feedbackContent').innerHTML = content;
        document.getElementById('feedbackModal').style.display = 'block';
    }

    closeFeedback() {
        document.getElementById('feedbackModal').style.display = 'none';
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
        `;
        
        switch (type) {
            case 'success':
                notification.style.background = 'var(--success-color)';
                break;
            case 'error':
                notification.style.background = 'var(--accent-color)';
                break;
            default:
                notification.style.background = 'var(--secondary-color)';
        }
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }

    initializeLessonData() {
        return {
            'accrued-revenue': {
                title: 'Accrued Revenue',
                definition: 'Revenue that has been earned but not yet recorded or collected. This occurs when services are provided or goods are delivered, but payment will be received in the future.',
                when: 'Use when your company has performed services or delivered goods but hasn\'t recorded the revenue or received payment yet.',
                identify: 'Look for situations where work is completed, time has passed, or services have been provided, but no cash has been received and no revenue has been recorded.',
                example: {
                    scenario: 'ABC Company provided consulting services worth $2,000 in December, but the client will pay in January.',
                    debitAccount: 'Accounts Receivable',
                    creditAccount: 'Service Revenue',
                    amount: '2,000.00',
                    explanation: 'We debit Accounts Receivable (asset) because we have a right to receive payment, and credit Service Revenue because we earned the revenue in December.'
                },
                keyPoints: [
                    'Increases both assets (receivables) and revenues',
                    'Follows the revenue recognition principle',
                    'Common in service businesses',
                    'Always involves a receivable account'
                ]
            },
            'accrued-expense': {
                title: 'Accrued Expense',
                definition: 'Expenses that have been incurred (used up or consumed) but not yet recorded or paid. These are obligations that exist at the end of the accounting period.',
                when: 'Use when your company has used services, consumed resources, or owes money for expenses, but hasn\'t recorded them or made payment yet.',
                identify: 'Look for situations where time has passed, services have been used, or resources consumed, but no expense has been recorded and no cash has been paid.',
                example: {
                    scenario: 'XYZ Company owes $1,500 in wages to employees for work performed in December, but payday is in January.',
                    debitAccount: 'Salaries Expense',
                    creditAccount: 'Salaries Payable',
                    amount: '1,500.00',
                    explanation: 'We debit Salaries Expense because the expense was incurred in December, and credit Salaries Payable (liability) because we owe the money.'
                },
                keyPoints: [
                    'Increases both expenses and liabilities',
                    'Follows the matching principle',
                    'Common examples: wages, utilities, interest',
                    'Always involves a payable account'
                ]
            },
            'unearned-revenue': {
                title: 'Unearned Revenue',
                definition: 'Money received from customers for goods or services that haven\'t been delivered or performed yet. This creates a liability because you owe the customer the service or product.',
                when: 'Use when your company has received cash but needs to recognize that the service has now been performed or the product delivered.',
                identify: 'Look for situations where you previously received payment in advance, and now you\'ve provided the service or delivered the goods.',
                example: {
                    scenario: 'DEF Company received $3,000 in advance for a 6-month service contract. One month has passed, so $500 of service has been provided.',
                    debitAccount: 'Unearned Service Revenue',
                    creditAccount: 'Service Revenue',
                    amount: '500.00',
                    explanation: 'We debit Unearned Service Revenue (liability) to reduce what we owe, and credit Service Revenue because we\'ve now earned $500 of the revenue.'
                },
                keyPoints: [
                    'Decreases liabilities and increases revenues',
                    'Only adjust for the portion actually earned',
                    'Common in subscription or contract businesses',
                    'Converts a liability into earned revenue'
                ]
            },
            'prepaid-expense': {
                title: 'Prepaid Expense',
                definition: 'Expenses that have been paid for in advance but are now being used up or consumed. As time passes or resources are used, the prepaid asset becomes an expense.',
                when: 'Use when your company previously paid for something in advance, and now part of it has been used up or consumed.',
                identify: 'Look for situations where you previously paid in advance for services or supplies, and now time has passed or items have been consumed.',
                example: {
                    scenario: 'GHI Company paid $12,000 for a one-year insurance policy. One month has passed, so $1,000 of insurance has been used.',
                    debitAccount: 'Insurance Expense',
                    creditAccount: 'Prepaid Insurance',
                    amount: '1,000.00',
                    explanation: 'We debit Insurance Expense for the portion used up this month, and credit Prepaid Insurance (asset) to reduce the remaining balance.'
                },
                keyPoints: [
                    'Decreases assets and increases expenses',
                    'Only adjust for the portion actually used',
                    'Common examples: insurance, rent, supplies',
                    'Converts a prepaid asset into an expense'
                ]
            },
            'depreciation': {
                title: 'Depreciation',
                definition: 'The systematic allocation of an asset\'s cost over its useful life. As equipment, buildings, or other long-term assets are used, their cost is gradually expensed.',
                when: 'Use at the end of each accounting period to record the portion of an asset\'s cost that has been "used up" during that period.',
                identify: 'Look for long-term assets like equipment, buildings, or vehicles that are being used in business operations.',
                example: {
                    scenario: 'JKL Company owns equipment that cost $60,000 with a 5-year useful life. Monthly depreciation is $1,000 ($60,000 ÷ 5 years ÷ 12 months).',
                    debitAccount: 'Depreciation Expense',
                    creditAccount: 'Accumulated Depreciation - Equipment',
                    amount: '1,000.00',
                    explanation: 'We debit Depreciation Expense for the monthly amount, and credit Accumulated Depreciation (contra-asset) to track total depreciation without reducing the asset account directly.'
                },
                keyPoints: [
                    'Increases expenses and contra-assets',
                    'Uses straight-line method most commonly',
                    'Doesn\'t involve cash transactions',
                    'Accumulated Depreciation is a contra-asset account'
                ]
            }
        };
    }

    initializePracticeProblems() {
        return {
            'accrued-revenue': [
                {
                    scenario: 'Sunset Law Firm provided $4,500 worth of legal services to a client in December. The client will pay the bill in January.',
                    question: 'What adjusting entry should be made in December?',
                    options: [
                        'Debit Cash $4,500; Credit Legal Service Revenue $4,500',
                        'Debit Accounts Receivable $4,500; Credit Legal Service Revenue $4,500',
                        'Debit Legal Service Revenue $4,500; Credit Accounts Receivable $4,500',
                        'No entry needed until January'
                    ],
                    correct: 1,
                    hint: 'Revenue was earned in December but no cash was received. What asset account represents money owed to us?',
                    explanation: 'Since services were provided in December, revenue must be recorded in December (revenue recognition principle). Accounts Receivable increases because the client owes us money.',
                    correctEntry: { debit: 'Accounts Receivable', credit: 'Service Revenue', amount: 4500 }
                },
                {
                    scenario: 'Tech Solutions completed a $2,800 website design project in December. The customer will pay when they receive the invoice in January.',
                    question: 'What is the correct adjusting entry for December?',
                    options: [
                        'Debit Service Revenue $2,800; Credit Cash $2,800',
                        'Debit Cash $2,800; Credit Service Revenue $2,800',
                        'Debit Accounts Receivable $2,800; Credit Service Revenue $2,800',
                        'Debit Service Revenue $2,800; Credit Accounts Receivable $2,800'
                    ],
                    correct: 2,
                    hint: 'The work is complete, so revenue is earned. What do we call money that customers owe us?',
                    explanation: 'Revenue should be recorded when earned (December), not when cash is collected (January). We create a receivable for the amount owed.',
                    correctEntry: { debit: 'Accounts Receivable', credit: 'Service Revenue', amount: 2800 }
                }
            ],
            'accrued-expense': [
                {
                    scenario: 'Metro Corp\'s employees earned $3,200 in wages during the last week of December, but payday is January 5th.',
                    question: 'What adjusting entry is needed on December 31st?',
                    options: [
                        'Debit Cash $3,200; Credit Wages Expense $3,200',
                        'Debit Wages Expense $3,200; Credit Cash $3,200',
                        'Debit Wages Expense $3,200; Credit Wages Payable $3,200',
                        'No entry needed until wages are paid'
                    ],
                    correct: 2,
                    hint: 'Employees worked in December, so the expense belongs in December. What account shows money we owe to employees?',
                    explanation: 'The expense was incurred in December (matching principle), so it must be recorded in December. Wages Payable shows our obligation to pay employees.',
                    correctEntry: { debit: 'Wages Expense', credit: 'Wages Payable', amount: 3200 }
                },
                {
                    scenario: 'City Electric used $850 worth of electricity in December, but the utility bill won\'t arrive until January 15th.',
                    question: 'What is the proper adjusting entry for December 31st?',
                    options: [
                        'Debit Utilities Expense $850; Credit Utilities Payable $850',
                        'Debit Cash $850; Credit Utilities Expense $850',
                        'Debit Utilities Payable $850; Credit Utilities Expense $850',
                        'Wait until the bill arrives to make an entry'
                    ],
                    correct: 0,
                    hint: 'Electricity was used in December, so the expense should be recorded in December. What liability account represents unpaid utilities?',
                    explanation: 'Even though the bill hasn\'t arrived, the electricity was consumed in December, so the expense must be matched to December revenues.',
                    correctEntry: { debit: 'Utilities Expense', credit: 'Utilities Payable', amount: 850 }
                }
            ],
            'unearned-revenue': [
                {
                    scenario: 'Fitness Plus received $6,000 for a 12-month gym membership on October 1st. Three months have now passed.',
                    question: 'What adjusting entry should be made on December 31st?',
                    options: [
                        'Debit Cash $1,500; Credit Membership Revenue $1,500',
                        'Debit Unearned Membership Revenue $1,500; Credit Membership Revenue $1,500',
                        'Debit Membership Revenue $1,500; Credit Unearned Membership Revenue $1,500',
                        'Debit Unearned Membership Revenue $6,000; Credit Membership Revenue $6,000'
                    ],
                    correct: 1,
                    hint: 'Three months of service have been provided. How much of the $6,000 should be recognized as earned revenue?',
                    explanation: 'Three months of the 12-month membership have been provided ($6,000 × 3/12 = $1,500). This reduces the liability and increases revenue.',
                    correctEntry: { debit: 'Unearned Membership Revenue', credit: 'Membership Revenue', amount: 1500 }
                },
                {
                    scenario: 'Clean Pro received $2,400 on November 1st for a 6-month cleaning contract. Two months of service have been completed.',
                    question: 'What is the correct adjusting entry for December 31st?',
                    options: [
                        'Debit Service Revenue $800; Credit Unearned Service Revenue $800',
                        'Debit Cash $800; Credit Service Revenue $800',
                        'Debit Unearned Service Revenue $800; Credit Service Revenue $800',
                        'Debit Unearned Service Revenue $2,400; Credit Service Revenue $2,400'
                    ],
                    correct: 2,
                    hint: 'Two months of a 6-month contract have been completed. Calculate: $2,400 × 2/6 months.',
                    explanation: 'Two months of service have been provided ($2,400 × 2/6 = $800). The liability decreases and revenue increases by this amount.',
                    correctEntry: { debit: 'Unearned Service Revenue', credit: 'Service Revenue', amount: 800 }
                }
            ],
            'prepaid-expense': [
                {
                    scenario: 'Office Supply Co. paid $3,600 for a 12-month insurance policy on July 1st. Six months have passed.',
                    question: 'What adjusting entry is needed on December 31st?',
                    options: [
                        'Debit Insurance Expense $1,800; Credit Cash $1,800',
                        'Debit Insurance Expense $1,800; Credit Prepaid Insurance $1,800',
                        'Debit Prepaid Insurance $1,800; Credit Insurance Expense $1,800',
                        'Debit Cash $1,800; Credit Insurance Expense $1,800'
                    ],
                    correct: 1,
                    hint: 'Six months of the 12-month policy have been used up. Calculate: $3,600 × 6/12.',
                    explanation: 'Six months of insurance have been used ($3,600 × 6/12 = $1,800). The prepaid asset decreases and insurance expense increases.',
                    correctEntry: { debit: 'Insurance Expense', credit: 'Prepaid Insurance', amount: 1800 }
                },
                {
                    scenario: 'Rent-A-Space paid $9,000 for 3 months of rent in advance on November 1st. Two months have now elapsed.',
                    question: 'What is the proper adjusting entry for December 31st?',
                    options: [
                        'Debit Prepaid Rent $6,000; Credit Rent Expense $6,000',
                        'Debit Rent Expense $3,000; Credit Cash $3,000',
                        'Debit Rent Expense $6,000; Credit Prepaid Rent $6,000',
                        'Debit Cash $6,000; Credit Rent Expense $6,000'
                    ],
                    correct: 2,
                    hint: 'Two months of the 3-month prepaid rent have been used. Calculate: $9,000 × 2/3.',
                    explanation: 'Two months of rent have been used ($9,000 × 2/3 = $6,000). The prepaid asset decreases and rent expense increases.',
                    correctEntry: { debit: 'Rent Expense', credit: 'Prepaid Rent', amount: 6000 }
                }
            ],
            'depreciation': [
                {
                    scenario: 'Manufacturing Inc. purchased equipment for $48,000 with an estimated 8-year useful life and no salvage value. One year has passed.',
                    question: 'What is the annual depreciation adjusting entry?',
                    options: [
                        'Debit Equipment $6,000; Credit Depreciation Expense $6,000',
                        'Debit Depreciation Expense $6,000; Credit Equipment $6,000',
                        'Debit Depreciation Expense $6,000; Credit Accumulated Depreciation - Equipment $6,000',
                        'Debit Accumulated Depreciation - Equipment $6,000; Credit Depreciation Expense $6,000'
                    ],
                    correct: 2,
                    hint: 'Annual depreciation = $48,000 ÷ 8 years. Remember that we don\'t reduce the Equipment account directly.',
                    explanation: 'Annual depreciation is $48,000 ÷ 8 = $6,000. We credit Accumulated Depreciation (a contra-asset) to preserve the original cost in the Equipment account.',
                    correctEntry: { debit: 'Depreciation Expense', credit: 'Accumulated Depreciation - Equipment', amount: 6000 }
                },
                {
                    scenario: 'Delivery Service owns a truck that cost $36,000 with a 6-year useful life and no salvage value. What is the monthly depreciation?',
                    question: 'What monthly depreciation adjusting entry should be made?',
                    options: [
                        'Debit Truck $500; Credit Depreciation Expense $500',
                        'Debit Depreciation Expense $500; Credit Accumulated Depreciation - Truck $500',
                        'Debit Accumulated Depreciation - Truck $500; Credit Depreciation Expense $500',
                        'Debit Depreciation Expense $500; Credit Truck $500'
                    ],
                    correct: 1,
                    hint: 'Monthly depreciation = ($36,000 ÷ 6 years) ÷ 12 months. Use a contra-asset account, not the truck account directly.',
                    explanation: 'Monthly depreciation is ($36,000 ÷ 6 ÷ 12) = $500. Accumulated Depreciation is a contra-asset that reduces the truck\'s book value.',
                    correctEntry: { debit: 'Depreciation Expense', credit: 'Accumulated Depreciation - Truck', amount: 500 }
                }
            ]
        };
    }
}

// Global functions for HTML onclick events
function startLessons() {
    academy.showSection('lessons');
}

function startChallenge() {
    academy.startChallenge();
}

function closeEntryBuilder() {
    academy.closeEntryBuilder();
}

function submitEntry() {
    academy.submitEntry();
}

function closeFeedback() {
    academy.closeFeedback();
}

// Initialize the academy when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.academy = new AdjustingEntriesAcademy();
});