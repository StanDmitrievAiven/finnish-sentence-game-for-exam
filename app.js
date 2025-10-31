// Initialize app
let currentIndex = 0;
let shuffledSentences = [];
let correctCount = 0;
let incorrectCount = 0;
let currentCardAnswered = false;
let currentSentence = null;
let wordElements = [];
let currentCategory = null;

// DOM elements
const homePage = document.getElementById('homePage');
const practicePage = document.getElementById('practicePage');
const categoriesGrid = document.getElementById('categoriesGrid');
const categoryBadge = document.getElementById('categoryBadge');
const wordsContainer = document.getElementById('wordsContainer');
const englishText = document.getElementById('englishText');
const checkButton = document.getElementById('checkButton');
const nextButton = document.getElementById('nextButton');
const restartButton = document.getElementById('restartButton');
const backButton = document.getElementById('backButton');
const result = document.getElementById('result');
const correctAnswer = document.getElementById('correctAnswer');
const progressFill = document.getElementById('progressFill');
const currentCardSpan = document.getElementById('currentCard');
const totalCardsSpan = document.getElementById('totalCards');
const correctSpan = document.getElementById('correct');
const incorrectSpan = document.getElementById('incorrect');

// Initialize home page with categories
function initHomePage() {
    const categories = getCategories();
    
    // Add "All" category first
    const allCard = document.createElement('div');
    allCard.className = 'category-card';
    allCard.innerHTML = `
        <h3>All Categories</h3>
        <div class="count">${sentences.length} sentences</div>
    `;
    allCard.addEventListener('click', () => {
        startPractice('All');
    });
    categoriesGrid.appendChild(allCard);
    
    // Add individual categories
    categories.forEach(category => {
        const categorySentences = filterByCategory(category);
        const card = document.createElement('div');
        card.className = 'category-card';
        card.innerHTML = `
            <h3>${category}</h3>
            <div class="count">${categorySentences.length} sentences</div>
        `;
        card.addEventListener('click', () => {
            startPractice(category);
        });
        categoriesGrid.appendChild(card);
    });
}

// Start practice with a category
function startPractice(category) {
    currentCategory = category;
    const filteredSentences = filterByCategory(category);
    shuffledSentences = shuffleArray(filteredSentences);
    
    // Hide home page, show practice page
    homePage.style.display = 'none';
    practicePage.style.display = 'block';
    
    // Update category badge
    categoryBadge.textContent = category === 'All' ? 'All Categories' : category;
    
    // Initialize practice
    currentIndex = 0;
    correctCount = 0;
    incorrectCount = 0;
    currentCardAnswered = false;
    totalCardsSpan.textContent = shuffledSentences.length;
    loadCard();
}

// Go back to home page
function goToHome() {
    homePage.style.display = 'block';
    practicePage.style.display = 'none';
    currentCategory = null;
}

// Split sentence into words with punctuation
function splitIntoWords(sentence) {
    const words = [];
    // Split by spaces but keep the words
    const parts = sentence.split(/\s+/).filter(p => p.length > 0);
    
    parts.forEach(part => {
        // Extract word and punctuation separately
        const match = part.match(/^([a-zäöåA-ZÄÖÅ]+)(.*)$/i);
        if (match) {
            words.push({ word: match[1], punctuation: match[2] || '' });
        } else if (part.match(/[^\s]/)) {
            // Pure punctuation (like standalone punctuation)
            words.push({ word: '', punctuation: part });
        }
    });
    
    return words;
}

// Generate placeholder text (first letter + dots)
function generatePlaceholder(word) {
    if (!word || word.length === 0) return '';
    const firstLetter = word[0];
    const dots = '.'.repeat(Math.max(2, word.length - 1));
    return firstLetter + dots;
}

// Calculate correctness percentage (character-by-character)
function calculateCorrectnessPercentage(userWord, correctWord) {
    if (!userWord || !correctWord || userWord.length === 0) return 0;
    
    const userLower = userWord.toLowerCase();
    const correctLower = correctWord.toLowerCase();
    const maxLength = Math.max(userLower.length, correctLower.length);
    
    if (maxLength === 0) return 100;
    
    let correctChars = 0;
    const minLength = Math.min(userLower.length, correctLower.length);
    
    // Count correct characters in matching positions
    for (let i = 0; i < minLength; i++) {
        if (userLower[i] === correctLower[i]) {
            correctChars++;
        }
    }
    
    // Calculate percentage based on the correct word length
    return Math.round((correctChars / correctLower.length) * 100);
}

// Create word placeholder element
function createWordPlaceholder(wordData, index) {
    const placeholder = document.createElement('span');
    placeholder.className = 'word-placeholder';
    
    // If there's no word (only punctuation), show it as static text
    if (!wordData.word || wordData.word.length === 0) {
        placeholder.textContent = wordData.punctuation;
        placeholder.style.cursor = 'default';
        placeholder.style.pointerEvents = 'none';
        placeholder.dataset.index = index;
        placeholder.dataset.correctWord = '';
        placeholder.dataset.punctuation = wordData.punctuation;
        return placeholder;
    }
    
    placeholder.textContent = generatePlaceholder(wordData.word) + wordData.punctuation;
    placeholder.dataset.index = index;
    placeholder.dataset.correctWord = wordData.word.toLowerCase();
    placeholder.dataset.punctuation = wordData.punctuation;
    placeholder.dataset.wordLength = wordData.word.length; // Store correct word length
    
    placeholder.addEventListener('click', () => {
        if (currentCardAnswered) return;
        startEditingWord(placeholder, index);
    });
    
    return placeholder;
}

// Start editing a word
function startEditingWord(placeholderElement, index) {
    if (currentCardAnswered) return;
    
    const correctWord = placeholderElement.dataset.correctWord;
    const punctuation = placeholderElement.dataset.punctuation || '';
    const wordLength = parseInt(placeholderElement.dataset.wordLength) || 0;
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'word-input';
    input.value = placeholderElement.dataset.userInput || '';
    input.dataset.index = index;
    input.maxLength = wordLength; // Enforce exact length
    
    // Set initial size based on placeholder, but allow growth
    const minWidth = Math.max(placeholderElement.offsetWidth, 80);
    input.style.minWidth = minWidth + 'px';
    input.style.width = minWidth + 'px';
    
    // Auto-resize input as user types
    input.addEventListener('input', () => {
        // Limit input to exact word length
        if (input.value.length > wordLength) {
            input.value = input.value.substring(0, wordLength);
        }
        
        // Visual feedback: green border when word length matches
        if (input.value.length === wordLength && wordLength > 0) {
            input.style.borderColor = '#4caf50';
            input.style.backgroundColor = '#f1f8f4';
        } else {
            input.style.borderColor = '#667eea';
            input.style.backgroundColor = 'white';
        }
        
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.fontSize = input.style.fontSize || '24px';
        tempSpan.style.fontWeight = '600';
        tempSpan.textContent = input.value || 'M';
        document.body.appendChild(tempSpan);
        const newWidth = Math.max(tempSpan.offsetWidth + 36, minWidth); // 36 for padding
        input.style.width = newWidth + 'px';
        document.body.removeChild(tempSpan);
    });
    
    // Prevent paste of text longer than maxLength
    input.addEventListener('paste', (e) => {
        e.preventDefault();
        const pastedText = (e.clipboardData || window.clipboardData).getData('text');
        const truncatedText = pastedText.substring(0, wordLength);
        input.value = truncatedText;
        input.dispatchEvent(new Event('input'));
    });
    
    // Replace placeholder with input
    placeholderElement.parentNode.replaceChild(input, placeholderElement);
    input.focus();
    input.select();
    
    // Handle input completion
    const finishEditing = () => {
        const userWord = input.value.trim();
        const newPlaceholder = document.createElement('span');
        newPlaceholder.className = 'word-placeholder';
        newPlaceholder.dataset.index = index;
        newPlaceholder.dataset.correctWord = correctWord;
        newPlaceholder.dataset.punctuation = punctuation;
        newPlaceholder.dataset.userInput = userWord;
        newPlaceholder.dataset.wordLength = placeholderElement.dataset.wordLength;
        
        // Check if word length requirement is met
        const userWordLength = userWord.length;
        const requiredLength = parseInt(placeholderElement.dataset.wordLength) || 0;
        
        // Add warning class if word is entered but length doesn't match
        if (userWord && userWordLength !== requiredLength && requiredLength > 0) {
            newPlaceholder.classList.add('warning');
        }
        
        // Calculate and display correctness percentage
        let correctnessPercentage = 0;
        if (userWord && correctWord) {
            correctnessPercentage = calculateCorrectnessPercentage(userWord, correctWord);
        }
        
        // Set text content - use innerHTML or create structure that preserves badge
        const textContent = userWord ? (userWord + punctuation) : (generatePlaceholder(correctWord) + punctuation);
        
        // Create correctness badge first if needed
        if (userWord && correctnessPercentage > 0) {
            const badgeContainer = document.createElement('span');
            badgeContainer.className = 'correctness-badge';
            badgeContainer.textContent = correctnessPercentage + '%';
            badgeContainer.style.display = 'block';
            
            // Color based on percentage
            if (correctnessPercentage === 100) {
                badgeContainer.style.backgroundColor = '#4caf50';
                badgeContainer.style.color = 'white';
            } else if (correctnessPercentage >= 70) {
                badgeContainer.style.backgroundColor = '#ff9800';
                badgeContainer.style.color = 'white';
            } else {
                badgeContainer.style.backgroundColor = '#f44336';
                badgeContainer.style.color = 'white';
            }
            
            // Set text content and append badge
            newPlaceholder.innerHTML = textContent;
            newPlaceholder.appendChild(badgeContainer);
        } else {
            // No badge needed, just set text
            newPlaceholder.textContent = textContent;
        }
        
        newPlaceholder.addEventListener('click', () => {
            if (currentCardAnswered) return;
            // Remove warning class when editing again
            newPlaceholder.classList.remove('warning');
            startEditingWord(newPlaceholder, index);
        });
        
        input.parentNode.replaceChild(newPlaceholder, input);
        
        // Update wordElements array
        wordElements[index] = newPlaceholder;
    };
    
    input.addEventListener('blur', finishEditing);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            finishEditing();
        } else if (e.key === 'Escape') {
            input.value = '';
            finishEditing();
        }
    });
}

// Load a card
function loadCard() {
    if (currentIndex >= shuffledSentences.length) {
        showResults();
        return;
    }

    const card = shuffledSentences[currentIndex];
    currentSentence = card.finnish;
    englishText.textContent = card.english;
    
    // Clear previous words
    wordsContainer.innerHTML = '';
    wordElements = [];
    
    // Create word placeholders
    const words = splitIntoWords(card.finnish);
    words.forEach((wordData, index) => {
        // Skip empty entries
        if (!wordData.word && !wordData.punctuation) return;
        
        const placeholder = createWordPlaceholder(wordData, index);
        wordsContainer.appendChild(placeholder);
        wordElements.push(placeholder);
        
        // Add space after word (but not after last word)
        if (index < words.length - 1) {
            const space = document.createTextNode(' ');
            wordsContainer.appendChild(space);
        }
    });
    
    // Reset state
    checkButton.style.display = 'block';
    nextButton.style.display = 'none';
    restartButton.style.display = 'none';
    result.textContent = '';
    result.className = '';
    correctAnswer.textContent = '';
    correctAnswer.classList.remove('show');
    currentCardAnswered = false;
    
    // Update progress
    const progress = ((currentIndex + 1) / shuffledSentences.length) * 100;
    progressFill.style.width = progress + '%';
    currentCardSpan.textContent = currentIndex + 1;
    
    // Update stats
    correctSpan.textContent = correctCount;
    incorrectSpan.textContent = incorrectCount;
}

// Get user answer from word elements
function getUserAnswer() {
    const words = [];
    wordElements.forEach((element) => {
        const userInput = element.dataset.userInput || '';
        const punctuation = element.dataset.punctuation || '';
        
        if (userInput) {
            words.push(userInput + punctuation);
        }
        // If no user input, don't include empty words
    });
    return words.join(' ').trim();
}

// Check answer
function checkAnswer() {
    if (currentCardAnswered) return;
    
    const userAnswer = getUserAnswer();
    const correctAnswerText = currentSentence.trim();
    
    // Normalize for comparison (case-insensitive, handle extra spaces)
    const normalizedUser = userAnswer.toLowerCase().replace(/\s+/g, ' ');
    const normalizedCorrect = correctAnswerText.toLowerCase().replace(/\s+/g, ' ');
    
    // Also check individual words for visual feedback
    const correctWords = splitIntoWords(correctAnswerText);
    let allCorrect = normalizedUser === normalizedCorrect;
    
    wordElements.forEach((element, index) => {
        const userWord = (element.dataset.userInput || '').toLowerCase().trim();
        const correctWordData = correctWords[index];
        
        // Skip punctuation-only elements
        if (!correctWordData || !correctWordData.word) return;
        
        const correctWord = correctWordData.word.toLowerCase();
        if (userWord === correctWord) {
            element.classList.add('correct');
            element.classList.remove('incorrect', 'warning');
        } else if (userWord) {
            element.classList.add('incorrect');
            element.classList.remove('correct', 'warning');
            allCorrect = false;
        } else {
            // Word not filled in
            element.classList.remove('correct', 'incorrect', 'warning');
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        // Correct answer
        result.textContent = '✓ Correct!';
        result.className = 'result correct';
        correctCount++;
        correctSpan.textContent = correctCount;
    } else {
        // Incorrect answer
        result.textContent = '✗ Incorrect';
        result.className = 'result incorrect';
        correctAnswer.textContent = `Correct answer: ${correctAnswerText}`;
        correctAnswer.classList.add('show');
        incorrectCount++;
        incorrectSpan.textContent = incorrectCount;
    }
    
    currentCardAnswered = true;
    checkButton.style.display = 'none';
    nextButton.style.display = 'block';
    
    // Disable all word placeholders
    wordElements.forEach(element => {
        element.style.pointerEvents = 'none';
        // Hide correctness badges after checking
        const badge = element.querySelector('.correctness-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    });
}

// Show results
function showResults() {
    wordsContainer.innerHTML = '';
    englishText.textContent = '';
    checkButton.style.display = 'none';
    nextButton.style.display = 'none';
    
    const total = shuffledSentences.length;
    const percentage = Math.round((correctCount / total) * 100);
    
    result.className = 'result';
    result.innerHTML = `
        <div style="text-align: center;">
            <h2 style="margin-bottom: 20px; color: #667eea;">Session Complete!</h2>
            <p style="font-size: 24px; margin-bottom: 10px;">Score: ${correctCount} / ${total}</p>
            <p style="font-size: 20px; color: #666;">Accuracy: ${percentage}%</p>
        </div>
    `;
    
    restartButton.style.display = 'block';
    progressFill.style.width = '100%';
}

// Event listeners
checkButton.addEventListener('click', checkAnswer);

nextButton.addEventListener('click', () => {
    currentIndex++;
    loadCard();
});

restartButton.addEventListener('click', () => {
    startPractice(currentCategory || 'All');
});

backButton.addEventListener('click', () => {
    goToHome();
});

// Initialize on load
initHomePage();

