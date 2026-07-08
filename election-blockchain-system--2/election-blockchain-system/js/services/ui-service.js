// Election Commission of Pakistan - UI Service

export class UIService {
    static showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.querySelector('.toast');
        if (existingToast) {
            existingToast.remove();
        }

        // Create new toast
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
        toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast && toast.parentNode) {
                toast.remove();
            }
        }, 3000);
    }

    static updateElementText(elementId, text) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = text;
        }
    }

    static updateElementHTML(elementId, html) {
        const element = document.getElementById(elementId);
        if (element) {
            element.innerHTML = html;
        }
    }

    static showElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = '';
        }
    }

    static hideElement(elementId) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = 'none';
        }
    }

    static toggleElement(elementId, condition) {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = condition ? '' : 'none';
        }
    }

    static addClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.add(className);
        }
    }

    static removeClass(elementId, className) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove(className);
        }
    }

    static toggleClass(elementId, className, force) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.toggle(className, force);
        }
    }

    static getValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value.trim() : '';
    }

    static setValue(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.value = value || '';
        }
    }

    static getSelectValue(elementId) {
        const element = document.getElementById(elementId);
        return element ? element.value : '';
    }

    static translatePage(translations, currentLang) {
        const elements = document.querySelectorAll('[data-key]');
        elements.forEach(element => {
            const key = element.getAttribute('data-key');
            if (translations[currentLang] && translations[currentLang][key]) {
                element.textContent = translations[currentLang][key];
            }
        });
    }

  static getSymbolHTML(symbol) {
    // Animal emojis
    const animalEmojis = {
        'lion': '🦁',
        'tiger': '🐯',
        'elephant': '🐘',
        'eagle': '🦅',
        'horse': '🐴',
        'bull': '🐂',
        'wolf': '🐺',
        'bear': '🐻',
        'dolphin': '🐬',
        'peacock': '🦚',
        'falcon': '🦅',
        'owl': '🦉',
        'camel': '🐪',
        'goat': '🐐',
        'sheep': '🐑',
        'cow': '🐄',
        'cat': '🐱',
        'dog': '🐕',
        'snake': '🐍',
        'crocodile': '🐊',
        'whale': '🐋',
        'shark': '🦈',
        'butterfly': '🦋',
        'bee': '🐝',
        'ant': '🐜',
        'spider': '🕷️',
        'scorpion': '🦂',
        'chicken': '🐔',
        'rooster': '🐓',
        'duck': '🦆',
        'parrot': '🦜',
        'rabbit': '🐰',
        'monkey': '🐒',
        'gorilla': '🦍',
        'rhino': '🦏',
        'hippo': '🦛',
        'leopard': '🐆',
        'zebra': '🦓',
        'giraffe': '🦒',
        'kangaroo': '🦘',
        'panda': '🐼',
        'koala': '🐨',
        'penguin': '🐧',
        'turtle': '🐢',
        'octopus': '🐙',
        'crab': '🦀',
        'lobster': '🦞',
        'dragon': '🐉',
        'unicorn': '🦄'
    };
    
    if (animalEmojis[symbol]) {
        return `<span class="cand-symbol-icon" style="font-size:1.5rem;">${animalEmojis[symbol]}</span>`;
    }
    
    const iconMap = {
        'star': 'fa-star',
        'flag': 'fa-flag',
        'balance-scale': 'fa-scale-balanced',
        'leaf': 'fa-leaf',
        'crown': 'fa-crown',
        'moon': 'fa-moon',
        'bolt': 'fa-bolt',
        'globe': 'fa-globe',
        'feather': 'fa-feather',
        'house': 'fa-house',
        'hand': 'fa-hand',
        'user': 'fa-user',
        'heart': 'fa-heart',
        'sun': 'fa-sun',
        'diamond': 'fa-gem',
        'fire': 'fa-fire',
        'trophy': 'fa-trophy',
        'shield': 'fa-shield',
        'fish': 'fa-fish',
        'rocket': 'fa-rocket',
        'tree': 'fa-tree',
        'bird': 'fa-dove',
        'bell': 'fa-bell',
        'book': 'fa-book',
        'eye': 'fa-eye',
        'key': 'fa-key',
        'lock': 'fa-lock',
        'phone': 'fa-phone',
        'clock': 'fa-clock',
        'lightbulb': 'fa-lightbulb',
        'gear': 'fa-gear',
        'pencil': 'fa-pencil'
    };
    
    const iconClass = iconMap[symbol] || 'fa-circle';
    return `<i class="fas ${iconClass} cand-symbol-icon"></i>`;
}

    static formatCNIC(cnic) {
        if (!cnic) return 'N/A';
        return cnic.substring(0, 9) + '***';
    }
}