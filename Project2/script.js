// DOM Elements
const passwordOutput = document.getElementById('password-output');
const lengthSlider = document.getElementById('length-slider');
const lengthVal = document.getElementById('length-val');
const chkUppercase = document.getElementById('chk-uppercase');
const chkLowercase = document.getElementById('chk-lowercase');
const chkNumbers = document.getElementById('chk-numbers');
const chkSymbols = document.getElementById('chk-symbols');
const numPasswords = document.getElementById('num-passwords');
const generateBtn = document.getElementById('generate-btn');
const copyBtn = document.getElementById('copy-btn');
const toggleMaskBtn = document.getElementById('toggle-mask-btn');
const strengthBar = document.getElementById('strength-bar');
const strengthText = document.getElementById('strength-text');
const historySection = document.getElementById('history-section');
const historyList = document.getElementById('history-list');
const saveTxtBtn = document.getElementById('save-txt-btn');
const clearHistoryBtn = document.getElementById('clear-history-btn');
const toast = document.getElementById('toast');

// Character Sets
const CHAR_SETS = {
    uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lowercase: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
};

// State
let generatedPasswords = [];
let isMasked = false;

// Event Listeners
lengthSlider.addEventListener('input', (e) => {
    lengthVal.textContent = e.target.value;
});

generateBtn.addEventListener('click', handleGenerate);

copyBtn.addEventListener('click', () => {
    if (passwordOutput.value) {
        copyToClipboard(passwordOutput.value);
    }
});

toggleMaskBtn.addEventListener('click', toggleMask);

saveTxtBtn.addEventListener('click', saveToTXT);

clearHistoryBtn.addEventListener('click', () => {
    generatedPasswords = [];
    renderHistory();
    historySection.style.display = 'none';
    showToast('History cleared');
});

// Functions
function handleGenerate() {
    const length = parseInt(lengthSlider.value);
    const count = parseInt(numPasswords.value);
    
    const options = {
        uppercase: chkUppercase.checked,
        lowercase: chkLowercase.checked,
        numbers: chkNumbers.checked,
        symbols: chkSymbols.checked
    };

    // Validation
    if (!options.uppercase && !options.lowercase && !options.numbers && !options.symbols) {
        showToast('Please select at least one character type!');
        return;
    }

    if (count < 1 || count > 100) {
        showToast('Please enter a valid number of passwords (1-100)');
        return;
    }

    const newPasswords = [];
    for (let i = 0; i < count; i++) {
        newPasswords.push(generatePassword(length, options));
    }

    // Display first password in main area
    passwordOutput.value = newPasswords[0];
    if(isMasked) {
        passwordOutput.type = 'password';
    } else {
        passwordOutput.type = 'text';
    }

    // Update Strength
    updateStrengthMeter(newPasswords[0]);

    // Add to history (newest first)
    generatedPasswords = [...newPasswords, ...generatedPasswords];
    
    // Render History
    renderHistory();
    historySection.style.display = 'block';
}

function generatePassword(length, options) {
    let charPool = '';
    let requiredChars = [];

    if (options.uppercase) {
        charPool += CHAR_SETS.uppercase;
        requiredChars.push(getRandomChar(CHAR_SETS.uppercase));
    }
    if (options.lowercase) {
        charPool += CHAR_SETS.lowercase;
        requiredChars.push(getRandomChar(CHAR_SETS.lowercase));
    }
    if (options.numbers) {
        charPool += CHAR_SETS.numbers;
        requiredChars.push(getRandomChar(CHAR_SETS.numbers));
    }
    if (options.symbols) {
        charPool += CHAR_SETS.symbols;
        requiredChars.push(getRandomChar(CHAR_SETS.symbols));
    }

    let password = '';
    
    // Ensure at least one of each selected type is included
    for (let i = 0; i < requiredChars.length; i++) {
        password += requiredChars[i];
    }

    // Fill the rest randomly using secure crypto API
    for (let i = requiredChars.length; i < length; i++) {
        password += getRandomChar(charPool);
    }

    // Shuffle the password to prevent predictable patterns (like all uppercase at start)
    return shuffleString(password);
}

function getRandomChar(str) {
    // Secure random generation
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return str[array[0] % str.length];
}

function shuffleString(str) {
    const arr = str.split('');
    for (let i = arr.length - 1; i > 0; i--) {
        const randomArray = new Uint32Array(1);
        window.crypto.getRandomValues(randomArray);
        const j = randomArray[0] % (i + 1);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr.join('');
}

function updateStrengthMeter(password) {
    let score = 0;
    
    // Length contribution
    if (password.length > 8) score += 1;
    if (password.length > 12) score += 1;
    if (password.length >= 16) score += 1;

    // Character variety contribution
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let strength = 'Weak';
    let width = '25%';
    let color = 'var(--weak-color)';

    if (score >= 6) {
        strength = 'Very Strong';
        width = '100%';
        color = 'var(--very-strong-color)';
    } else if (score >= 4) {
        strength = 'Strong';
        width = '75%';
        color = 'var(--strong-color)';
    } else if (score >= 3) {
        strength = 'Medium';
        width = '50%';
        color = 'var(--medium-color)';
    }

    strengthBar.style.width = width;
    strengthBar.style.backgroundColor = color;
    strengthText.textContent = strength;
    strengthText.style.color = color;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Password copied!');
    }).catch(() => {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        showToast('Password copied!');
    });
}

function toggleMask() {
    isMasked = !isMasked;
    const icon = toggleMaskBtn.querySelector('i');
    
    if (isMasked) {
        passwordOutput.type = 'password';
        icon.classList.replace('ph-eye', 'ph-eye-slash');
    } else {
        passwordOutput.type = 'text';
        icon.classList.replace('ph-eye-slash', 'ph-eye');
    }
}

function renderHistory() {
    historyList.innerHTML = '';
    
    generatedPasswords.forEach((pwd, index) => {
        const li = document.createElement('li');
        li.className = 'history-item';
        
        const pwdSpan = document.createElement('span');
        pwdSpan.textContent = pwd;
        // Optionally mask history items too, but let's keep them visible or masked based on global?
        // Usually history is visible or masked via CSS, but let's just make it text.
        // For security, if they want to mask, we could mask all, but text content is simpler.
        
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'history-item-actions';
        
        const copyItemBtn = document.createElement('button');
        copyItemBtn.className = 'icon-btn';
        copyItemBtn.innerHTML = '<i class="ph ph-copy"></i>';
        copyItemBtn.title = "Copy";
        copyItemBtn.onclick = () => copyToClipboard(pwd);
        
        actionsDiv.appendChild(copyItemBtn);
        li.appendChild(pwdSpan);
        li.appendChild(actionsDiv);
        
        historyList.appendChild(li);
    });
}

function saveToTXT() {
    if (generatedPasswords.length === 0) {
        showToast('No passwords to save!');
        return;
    }
    
    const content = generatedPasswords.join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `passwords_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Saved to TXT successfully');
}

let toastTimeout;
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Initial generation
handleGenerate();
