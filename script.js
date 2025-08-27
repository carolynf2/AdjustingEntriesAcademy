class AdjustingEntriesAcademy {
    constructor() {
        this.currentSection = 'overview';
        this.currentLesson = 'accrued-revenue';
        this.score = 0;
        this.progress = 0;
        this.currentQuestion = null;
        this.challengeMode = false;
        this.challengeTimer = null;
        this.challengeTimeLeft = 900; // 15 minutes
        this.challengeQuestionIndex = 0;
        this.challengeQuestions = [];
        this.challengeAnswers = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadLessonContent();
        this.loadNewQuestion();
        this.updateProgress();
        this.populateAccountSelectors();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Lessons
        document.querySelectorAll('.lesson-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchLesson(e.target.dataset.lesson);
            });
        });

        // Practice
        document.getElementById('new-question-btn').addEventListener('click', () => {
            this.loadNewQuestion();
        });

        document.getElementById('practice-filter').addEventListener('change', (e) => {
            this.loadNewQuestion(e.target.value);
        });

        // Challenge
        document.getElementById('start-challenge-btn').addEventListener('click', () => {
            this.startChallenge();
        });

        // Modals
        document.querySelectorAll('.close').forEach(close => {
            close.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Entry Builder
        document.getElementById('check-entry-btn').addEventListener('click', () => {
            this.checkJournalEntry();
        });

        document.getElementById('reset-entry-btn').addEventListener('click', () => {
            this.resetEntryBuilder();
        });

        // Entry Builder Real-time Preview
        ['debit-account', 'debit-amount', 'credit-account', 'credit-amount'].forEach(id => {
            document.getElementById(id).addEventListener('input', () => {
                this.updateEntryPreview();
            });
        });

        // Feedback Modal
        document.getElementById('continue-btn').addEventListener('click', () => {
            document.getElementById('feedback-modal').style.display = 'none';
            if (this.challengeMode) {
                this.nextChallengeQuestion();
            }
        });

        // Click outside modal to close
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    switchSection(section) {
        // Update navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update sections
        document.querySelectorAll('.section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(section).classList.add('active');

        this.currentSection = section;
    }

    switchLesson(lesson) {
        document.querySelectorAll('.lesson-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-lesson="${lesson}"]`).classList.add('active');

        this.currentLesson = lesson;
        this.loadLessonContent();
    }

    loadLessonContent() {
        const content = this.getLessonContent(this.currentLesson);
        document.getElementById('lesson-content').innerHTML = content;
    }

    getLessonContent(lesson) {
        const lessons = {
            'accrued-revenue': {
                title: 'Accrued Revenue',
                content: `
                    <h3>Understanding Accrued Revenue</h3>
                    <p>Accrued revenue represents income that has been <strong>earned</strong> but not yet <strong>received</strong> or recorded. This typically occurs when services are provided or goods are delivered before payment is received.</p>
                    
                    <div class="example">
                        <h4>Example Scenario:</h4>
                        <p>ABC Consulting completed $2,500 worth of consulting services for a client on December 28, but won't receive payment until January 15. The revenue must be recorded in December when it was earned.</p>
                    </div>

                    <h4>Journal Entry:</h4>
                    <div class="journal-entry">
                        Accounts Receivable          2,500<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Consulting Revenue                2,500<br>
                        <em>(To record accrued consulting revenue)</em>
                    </div>

                    <h4>Key Points:</h4>
                    <ul>
                        <li>Revenue is recognized when <strong>earned</strong>, not when cash is received</li>
                        <li>Creates an asset (Accounts Receivable) and revenue</li>
                        <li>Common in service businesses</li>
                        <li>Ensures proper matching of revenues with the period they were earned</li>
                    </ul>

                    <button onclick="academy.openEntryBuilder('accrued-revenue')" class="primary-btn">Practice Journal Entry</button>
                `
            },
            'accrued-expense': {
                title: 'Accrued Expense',
                content: `
                    <h3>Understanding Accrued Expenses</h3>
                    <p>Accrued expenses are costs that have been <strong>incurred</strong> but not yet <strong>paid</strong> or recorded. These represent obligations to pay for goods or services that have already been received or used.</p>
                    
                    <div class="example">
                        <h4>Example Scenario:</h4>
                        <p>Your company's employees worked the last week of December, earning $3,000 in wages, but won't be paid until the first Friday of January. The wage expense must be recorded in December.</p>
                    </div>

                    <h4>Journal Entry:</h4>
                    <div class="journal-entry">
                        Wage Expense                 3,000<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Wages Payable                     3,000<br>
                        <em>(To record accrued wage expense)</em>
                    </div>

                    <h4>Key Points:</h4>
                    <ul>
                        <li>Expenses are recorded when <strong>incurred</strong>, not when cash is paid</li>
                        <li>Creates a liability (Payable account) and an expense</li>
                        <li>Common examples: wages, utilities, interest, rent</li>
                        <li>Essential for accurate period-end financial statements</li>
                    </ul>

                    <button onclick="academy.openEntryBuilder('accrued-expense')" class="primary-btn">Practice Journal Entry</button>
                `
            },
            'unearned-revenue': {
                title: 'Unearned Revenue',
                content: `
                    <h3>Understanding Unearned Revenue</h3>
                    <p>Unearned revenue occurs when cash is <strong>received</strong> before services are performed or goods are delivered. The cash creates a liability because the company owes the customer either services or a refund.</p>
                    
                    <div class="example">
                        <h4>Example Scenario:</h4>
                        <p>A magazine company receives $1,200 for a 12-month subscription on December 1. By December 31, only one month of magazines has been delivered, so $1,100 remains unearned.</p>
                    </div>

                    <h4>Initial Entry (when cash received):</h4>
                    <div class="journal-entry">
                        Cash                         1,200<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Unearned Revenue                  1,200<br>
                        <em>(To record cash received for future services)</em>
                    </div>

                    <h4>Adjusting Entry (after one month):</h4>
                    <div class="journal-entry">
                        Unearned Revenue               100<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Subscription Revenue                100<br>
                        <em>(To record one month of earned revenue)</em>
                    </div>

                    <h4>Key Points:</h4>
                    <ul>
                        <li>Initially recorded as a <strong>liability</strong>, not revenue</li>
                        <li>Revenue is recognized as services are performed</li>
                        <li>Common in subscription businesses, prepaid services</li>
                        <li>The adjustment transfers liability to revenue over time</li>
                    </ul>

                    <button onclick="academy.openEntryBuilder('unearned-revenue')" class="primary-btn">Practice Journal Entry</button>
                `
            },
            'prepaid-expense': {
                title: 'Prepaid Expense',
                content: `
                    <h3>Understanding Prepaid Expenses</h3>
                    <p>Prepaid expenses occur when cash is <strong>paid</strong> before goods or services are received or used. These payments create assets that will be converted to expenses over time as the benefits are consumed.</p>
                    
                    <div class="example">
                        <h4>Example Scenario:</h4>
                        <p>Your company pays $2,400 for a 12-month insurance policy on December 1. By December 31, only one month of coverage has been used, so $2,200 remains as a prepaid asset.</p>
                    </div>

                    <h4>Initial Entry (when cash paid):</h4>
                    <div class="journal-entry">
                        Prepaid Insurance            2,400<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Cash                             2,400<br>
                        <em>(To record prepayment for insurance)</em>
                    </div>

                    <h4>Adjusting Entry (after one month):</h4>
                    <div class="journal-entry">
                        Insurance Expense              200<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Prepaid Insurance                  200<br>
                        <em>(To record one month of insurance expense)</em>
                    </div>

                    <h4>Key Points:</h4>
                    <ul>
                        <li>Initially recorded as an <strong>asset</strong>, not an expense</li>
                        <li>Expense is recognized as benefits are consumed</li>
                        <li>Common examples: insurance, rent, supplies, advertising</li>
                        <li>The adjustment transfers asset value to expense over time</li>
                    </ul>

                    <button onclick="academy.openEntryBuilder('prepaid-expense')" class="primary-btn">Practice Journal Entry</button>
                `
            },
            'depreciation': {
                title: 'Depreciation',
                content: `
                    <h3>Understanding Depreciation</h3>
                    <p>Depreciation allocates the cost of long-term assets over their useful lives. This matches the asset's cost against the revenue it helps generate, following the matching principle of accounting.</p>
                    
                    <div class="example">
                        <h4>Example Scenario:</h4>
                        <p>Your company owns equipment that cost $60,000 with a 10-year useful life and no salvage value. Annual depreciation is $6,000 ($60,000 ÷ 10 years), or $500 per month.</p>
                    </div>

                    <h4>Monthly Adjusting Entry:</h4>
                    <div class="journal-entry">
                        Depreciation Expense           500<br>
                        &nbsp;&nbsp;&nbsp;&nbsp;Accumulated Depreciation - Equipment  500<br>
                        <em>(To record monthly depreciation expense)</em>
                    </div>

                    <h4>Key Points:</h4>
                    <ul>
                        <li><strong>Depreciation Expense</strong> appears on the income statement</li>
                        <li><strong>Accumulated Depreciation</strong> is a contra-asset on the balance sheet</li>
                        <li>The asset's original cost remains unchanged</li>
                        <li>Book value = Cost - Accumulated Depreciation</li>
                        <li>Common methods: straight-line, units-of-production, double-declining balance</li>
                    </ul>

                    <button onclick="academy.openEntryBuilder('depreciation')" class="primary-btn">Practice Journal Entry</button>
                `
            }
        };

        return lessons[lesson].content;
    }

    loadNewQuestion(filter = 'all') {
        const questions = this.getQuestions(filter);
        this.currentQuestion = questions[Math.floor(Math.random() * questions.length)];
        this.displayQuestion();
    }

    displayQuestion() {
        const container = document.getElementById('question-container');
        const question = this.currentQuestion;
        
        container.innerHTML = `
            <div class="question">
                <h3>${question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                <div class="question-text">
                    <p><strong>Scenario:</strong> ${question.scenario}</p>
                    <p><strong>Question:</strong> ${question.question}</p>
                </div>
                <div class="answers">
                    ${question.answers.map((answer, index) => `
                        <div class="answer-option" data-index="${index}">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top: 2rem; text-align: center;">
                    <button onclick="academy.openEntryBuilder('${question.type}')" class="primary-btn">Create Journal Entry</button>
                </div>
            </div>
        `;

        // Add click handlers to answers
        document.querySelectorAll('.answer-option').forEach(option => {
            option.addEventListener('click', (e) => {
                // Remove previous selections
                document.querySelectorAll('.answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                
                // Select current option
                e.target.classList.add('selected');
                
                // Check answer after a brief delay
                setTimeout(() => {
                    this.checkMultipleChoiceAnswer(parseInt(e.target.dataset.index));
                }, 500);
            });
        });
    }

    checkMultipleChoiceAnswer(selectedIndex) {
        const question = this.currentQuestion;
        const isCorrect = selectedIndex === question.correctAnswer;
        
        // Show visual feedback
        document.querySelectorAll('.answer-option').forEach((option, index) => {
            if (index === question.correctAnswer) {
                option.classList.add('correct');
            } else if (index === selectedIndex && !isCorrect) {
                option.classList.add('incorrect');
            }
        });

        // Update score and progress
        if (isCorrect) {
            this.score += 10;
            this.updateProgress();
        }

        // Show feedback modal
        setTimeout(() => {
            this.showFeedback(isCorrect, question.explanation);
        }, 1000);
    }

    openEntryBuilder(type) {
        document.getElementById('entry-modal').style.display = 'block';
        this.currentEntryType = type;
        this.resetEntryBuilder();
    }

    resetEntryBuilder() {
        document.getElementById('debit-account').value = '';
        document.getElementById('debit-amount').value = '';
        document.getElementById('credit-account').value = '';
        document.getElementById('credit-amount').value = '';
        document.getElementById('entry-preview').innerHTML = '';
        document.getElementById('entry-feedback').innerHTML = '';
        document.getElementById('entry-feedback').className = 'feedback';
    }

    updateEntryPreview() {
        const debitAccount = document.getElementById('debit-account').value;
        const debitAmount = document.getElementById('debit-amount').value;
        const creditAccount = document.getElementById('credit-account').value;
        const creditAmount = document.getElementById('credit-amount').value;

        let preview = '<strong>Journal Entry Preview:</strong><br><br>';
        
        if (debitAccount && debitAmount) {
            preview += `${debitAccount}${' '.repeat(Math.max(30 - debitAccount.length, 1))}${debitAmount}<br>`;
        }
        
        if (creditAccount && creditAmount) {
            preview += `&nbsp;&nbsp;&nbsp;&nbsp;${creditAccount}${' '.repeat(Math.max(26 - creditAccount.length, 1))}${creditAmount}<br>`;
        }

        document.getElementById('entry-preview').innerHTML = preview;
    }

    checkJournalEntry() {
        const debitAccount = document.getElementById('debit-account').value;
        const debitAmount = parseFloat(document.getElementById('debit-amount').value) || 0;
        const creditAccount = document.getElementById('credit-account').value;
        const creditAmount = parseFloat(document.getElementById('credit-amount').value) || 0;

        const correctEntry = this.getCorrectJournalEntry(this.currentEntryType);
        const feedback = document.getElementById('entry-feedback');

        // Check if entry is correct
        const isCorrect = this.validateJournalEntry(
            { account: debitAccount, amount: debitAmount },
            { account: creditAccount, amount: creditAmount },
            correctEntry
        );

        if (isCorrect) {
            feedback.className = 'feedback correct';
            feedback.innerHTML = `
                <h4>✅ Correct!</h4>
                <p>Excellent work! Your journal entry is accurate.</p>
                <p><strong>Explanation:</strong> ${correctEntry.explanation}</p>
            `;
            this.score += 15;
            this.updateProgress();
        } else {
            feedback.className = 'feedback incorrect';
            feedback.innerHTML = `
                <h4>❌ Not Quite Right</h4>
                <p>Review your entry and try again.</p>
                <div class="journal-entry">
                    <strong>Correct Entry:</strong><br>
                    ${correctEntry.debit.account}${' '.repeat(Math.max(30 - correctEntry.debit.account.length, 1))}${correctEntry.debit.amount}<br>
                    &nbsp;&nbsp;&nbsp;&nbsp;${correctEntry.credit.account}${' '.repeat(Math.max(26 - correctEntry.credit.account.length, 1))}${correctEntry.credit.amount}
                </div>
                <p><strong>Explanation:</strong> ${correctEntry.explanation}</p>
            `;
        }
    }

    validateJournalEntry(userDebit, userCredit, correctEntry) {
        return (userDebit.account === correctEntry.debit.account &&
                userCredit.account === correctEntry.credit.account &&
                userDebit.amount === correctEntry.debit.amount &&
                userCredit.amount === correctEntry.credit.amount);
    }

    getCorrectJournalEntry(type) {
        const entries = {
            'accrued-revenue': {
                debit: { account: 'Accounts Receivable', amount: 2500 },
                credit: { account: 'Service Revenue', amount: 2500 },
                explanation: 'Accrued revenue increases both an asset (Accounts Receivable) and revenue. The company has earned the revenue but hasn\'t received cash yet.'
            },
            'accrued-expense': {
                debit: { account: 'Wage Expense', amount: 3000 },
                credit: { account: 'Wages Payable', amount: 3000 },
                explanation: 'Accrued expense increases both an expense and a liability (Payable). The company has incurred the expense but hasn\'t paid cash yet.'
            },
            'unearned-revenue': {
                debit: { account: 'Unearned Revenue', amount: 100 },
                credit: { account: 'Service Revenue', amount: 100 },
                explanation: 'As services are performed, unearned revenue (liability) decreases and revenue increases. This represents earning previously collected cash.'
            },
            'prepaid-expense': {
                debit: { account: 'Insurance Expense', amount: 200 },
                credit: { account: 'Prepaid Insurance', amount: 200 },
                explanation: 'As prepaid benefits are consumed, the asset (Prepaid Insurance) decreases and expense increases. This allocates the prepaid cost to the current period.'
            },
            'depreciation': {
                debit: { account: 'Depreciation Expense', amount: 500 },
                credit: { account: 'Accumulated Depreciation - Equipment', amount: 500 },
                explanation: 'Depreciation allocates asset cost over its useful life. We credit Accumulated Depreciation (contra-asset) rather than the asset directly to preserve original cost information.'
            }
        };
        return entries[type];
    }

    populateAccountSelectors() {
        const accounts = [
            'Cash', 'Accounts Receivable', 'Prepaid Insurance', 'Prepaid Rent', 'Supplies',
            'Equipment', 'Accumulated Depreciation - Equipment', 'Accounts Payable', 
            'Wages Payable', 'Unearned Revenue', 'Service Revenue', 'Wage Expense',
            'Insurance Expense', 'Rent Expense', 'Depreciation Expense', 'Supplies Expense'
        ];

        const selectors = ['debit-account', 'credit-account'];
        selectors.forEach(id => {
            const select = document.getElementById(id);
            accounts.forEach(account => {
                const option = document.createElement('option');
                option.value = account;
                option.textContent = account;
                select.appendChild(option);
            });
        });
    }

    getQuestions(filter = 'all') {
        const allQuestions = [
            {
                type: 'accrued-revenue',
                scenario: 'ABC Law Firm completed $5,000 of legal services for a client on December 30, but will not receive payment until January 15.',
                question: 'What type of adjusting entry is needed?',
                answers: [
                    'Accrued Revenue - to record revenue earned but not received',
                    'Accrued Expense - to record expense incurred but not paid',
                    'Unearned Revenue - to record cash received in advance',
                    'Prepaid Expense - to record cash paid in advance'
                ],
                correctAnswer: 0,
                explanation: 'This is accrued revenue because the firm has earned revenue (completed services) but hasn\'t received payment yet.'
            },
            {
                type: 'accrued-expense',
                scenario: 'Employees worked the last week of December earning $2,000 in wages, but won\'t be paid until the first Friday in January.',
                question: 'What adjusting entry is required?',
                answers: [
                    'Debit Wages Payable, Credit Wage Expense',
                    'Debit Wage Expense, Credit Wages Payable',
                    'Debit Cash, Credit Wage Expense',
                    'Debit Wage Expense, Credit Cash'
                ],
                correctAnswer: 1,
                explanation: 'Wage expense must be recorded in December when incurred, and wages payable recognizes the obligation to pay.'
            },
            {
                type: 'unearned-revenue',
                scenario: 'A fitness center received $3,600 for a 12-month membership on December 1. By December 31, one month of service has been provided.',
                question: 'What is the December 31 adjusting entry?',
                answers: [
                    'Debit Unearned Revenue $3,600, Credit Membership Revenue $3,600',
                    'Debit Unearned Revenue $300, Credit Membership Revenue $300',
                    'Debit Membership Revenue $300, Credit Unearned Revenue $300',
                    'Debit Cash $300, Credit Membership Revenue $300'
                ],
                correctAnswer: 1,
                explanation: 'One month ($3,600 ÷ 12 = $300) of revenue has been earned, so we reduce the liability and record revenue.'
            },
            {
                type: 'prepaid-expense',
                scenario: 'A company paid $1,800 for 6 months of insurance coverage starting December 1. By December 31, one month has elapsed.',
                question: 'What adjusting entry is needed on December 31?',
                answers: [
                    'Debit Insurance Expense $300, Credit Prepaid Insurance $300',
                    'Debit Prepaid Insurance $300, Credit Insurance Expense $300',
                    'Debit Insurance Expense $1,800, Credit Prepaid Insurance $1,800',
                    'Debit Cash $300, Credit Insurance Expense $300'
                ],
                correctAnswer: 0,
                explanation: 'One month ($1,800 ÷ 6 = $300) of insurance has been used, so we record expense and reduce the prepaid asset.'
            },
            {
                type: 'depreciation',
                scenario: 'Office equipment costing $24,000 has a useful life of 8 years with no salvage value. The company uses straight-line depreciation.',
                question: 'What is the annual depreciation expense?',
                answers: [
                    '$24,000',
                    '$3,000',
                    '$2,000',
                    '$8,000'
                ],
                correctAnswer: 1,
                explanation: 'Annual depreciation = Cost ÷ Useful Life = $24,000 ÷ 8 years = $3,000 per year.'
            }
        ];

        if (filter === 'all') {
            return allQuestions;
        }
        return allQuestions.filter(q => q.type === filter);
    }

    showFeedback(isCorrect, explanation) {
        const modal = document.getElementById('feedback-modal');
        const title = document.getElementById('feedback-title');
        const content = document.getElementById('feedback-content');

        title.textContent = isCorrect ? '✅ Correct!' : '❌ Incorrect';
        content.innerHTML = `<p>${explanation}</p>`;
        modal.style.display = 'block';
    }

    updateProgress() {
        document.getElementById('score').textContent = this.score;
        this.progress = Math.min(this.score / 2, 100); // Max progress at 200 points
        document.getElementById('progress-fill').style.width = this.progress + '%';
    }

    startChallenge() {
        this.challengeMode = true;
        this.challengeTimeLeft = 900; // 15 minutes
        this.challengeQuestionIndex = 0;
        this.challengeAnswers = [];
        this.challengeQuestions = this.generateChallengeQuestions();
        
        document.getElementById('start-challenge-btn').style.display = 'none';
        document.getElementById('challenge-container').style.display = 'block';
        
        this.startChallengeTimer();
        this.loadChallengeQuestion();
    }

    generateChallengeQuestions() {
        const allQuestions = this.getQuestions();
        const selectedQuestions = [];
        
        // Ensure we have at least 2 questions from each type
        const types = ['accrued-revenue', 'accrued-expense', 'unearned-revenue', 'prepaid-expense', 'depreciation'];
        
        types.forEach(type => {
            const typeQuestions = allQuestions.filter(q => q.type === type);
            selectedQuestions.push(...typeQuestions.slice(0, 2));
        });
        
        // Shuffle the questions
        return selectedQuestions.sort(() => Math.random() - 0.5).slice(0, 10);
    }

    loadChallengeQuestion() {
        const question = this.challengeQuestions[this.challengeQuestionIndex];
        document.getElementById('question-num').textContent = this.challengeQuestionIndex + 1;
        
        const container = document.getElementById('challenge-question');
        container.innerHTML = `
            <div class="question">
                <h3>${question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h3>
                <div class="question-text">
                    <p><strong>Scenario:</strong> ${question.scenario}</p>
                    <p><strong>Question:</strong> ${question.question}</p>
                </div>
                <div class="answers">
                    ${question.answers.map((answer, index) => `
                        <div class="answer-option" data-index="${index}">
                            ${answer}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // Add click handlers
        document.querySelectorAll('#challenge-question .answer-option').forEach(option => {
            option.addEventListener('click', (e) => {
                document.querySelectorAll('#challenge-question .answer-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                e.target.classList.add('selected');
                
                const selectedIndex = parseInt(e.target.dataset.index);
                this.challengeAnswers[this.challengeQuestionIndex] = {
                    selected: selectedIndex,
                    correct: question.correctAnswer,
                    isCorrect: selectedIndex === question.correctAnswer
                };

                setTimeout(() => {
                    this.nextChallengeQuestion();
                }, 1000);
            });
        });
    }

    nextChallengeQuestion() {
        this.challengeQuestionIndex++;
        
        if (this.challengeQuestionIndex >= this.challengeQuestions.length) {
            this.endChallenge();
        } else {
            this.loadChallengeQuestion();
        }
    }

    startChallengeTimer() {
        this.challengeTimer = setInterval(() => {
            this.challengeTimeLeft--;
            
            const minutes = Math.floor(this.challengeTimeLeft / 60);
            const seconds = this.challengeTimeLeft % 60;
            document.getElementById('timer').textContent = 
                `${minutes}:${seconds.toString().padStart(2, '0')}`;
            
            if (this.challengeTimeLeft <= 0) {
                this.endChallenge();
            }
        }, 1000);
    }

    endChallenge() {
        clearInterval(this.challengeTimer);
        this.challengeMode = false;
        
        document.getElementById('challenge-container').style.display = 'none';
        
        // Calculate results
        const correct = this.challengeAnswers.filter(a => a && a.isCorrect).length;
        const percentage = Math.round((correct / this.challengeQuestions.length) * 100);
        
        // Add challenge bonus to score
        const bonusPoints = correct * 20;
        this.score += bonusPoints;
        this.updateProgress();
        
        // Show results
        const results = document.getElementById('challenge-results');
        results.innerHTML = `
            <h3>Challenge Complete!</h3>
            <div style="font-size: 2rem; margin: 2rem 0;">
                ${correct}/${this.challengeQuestions.length} Correct (${percentage}%)
            </div>
            <div style="margin: 1rem 0;">
                <strong>Bonus Points Earned:</strong> ${bonusPoints}
            </div>
            <div style="margin: 2rem 0;">
                ${percentage >= 80 ? 
                    '🏆 Excellent work! You\'ve mastered adjusting entries!' : 
                    percentage >= 60 ? 
                    '👍 Good job! Review the lessons and try again to improve.' :
                    '📚 Keep studying! Focus on the areas where you missed questions.'
                }
            </div>
            <button onclick="academy.resetChallenge()" class="primary-btn">Take Challenge Again</button>
        `;
        results.style.display = 'block';
    }

    resetChallenge() {
        document.getElementById('challenge-results').style.display = 'none';
        document.getElementById('start-challenge-btn').style.display = 'block';
    }
}

// Initialize the application
const academy = new AdjustingEntriesAcademy();

// Make some functions globally accessible for onclick handlers
window.academy = academy;