document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const generateBtn = document.getElementById('generate-btn');
    const promptInput = document.getElementById('prompt');
    const negativePromptInput = document.getElementById('negative-prompt');
    const modelSelect = document.getElementById('model');
    const styleSelect = document.getElementById('style');
    const colorPaletteSelect = document.getElementById('color-palette');
    const compositionSelect = document.getElementById('composition');
    const aspectRatioSelect = document.getElementById('aspect-ratio');
    const enhanceCheckbox = document.getElementById('enhance');
    const hdCheckbox = document.getElementById('hd');
    const nologoCheckbox = document.getElementById('nologo');
    const seedInput = document.getElementById('seed');
    const generatedImage = document.getElementById('generated-image');
    const loadingElement = document.querySelector('.cyber-loading');
    const enhancePromptBtn = document.getElementById('enhance-prompt');
    const randomPromptBtn = document.getElementById('random-prompt');
    const randomSeedBtn = document.getElementById('random-seed');
    const downloadBtn = document.getElementById('download-btn');
    const saveBtn = document.getElementById('save-btn');
    const historyList = document.getElementById('history-list');
    const clearHistoryBtn = document.getElementById('clear-history');
    const themeToggle = document.getElementById('theme-toggle');
    const languageToggle = document.getElementById('language-toggle');
    const settingsToggle = document.querySelector('.cyber-accordion');
    const settingsContent = document.querySelector('.cyber-accordion-content');
    const imageActions = document.querySelector('.cyber-image-actions');

    // State
    let currentLanguage = localStorage.getItem('aiImageLanguage') || 'en';
    let currentTheme = localStorage.getItem('aiImageTheme') || 'dark';
    let history = JSON.parse(localStorage.getItem('aiImageHistory')) || [];

    // Initialize
    updateHistoryList();
    updateTheme();
    updateLanguage();

    // Style Combination Processor
    function processStyleCombination(prompt) {
        const styleCombinations = {
            'ghibli': ['ghibli', 'fractal'],
            'watercolor': ['watercolor', 'air brush'],
            'painting': ['painting', 'impressionism'],
            'digital art': ['digital art', 'cinematic'],
            'cinematic': ['cinematic', 'vintage'],
            'psikadelik': ['psychedelic', 'macabre'],
            'psychedelic': ['psychedelic', 'macabre'],
            'macabre': ['macabre', 'sanctuary'],
            'sanctuary': ['sanctuary', 'surrealism'],
            'surrealisme': ['surrealism', 'fractal'],
            'surrealism': ['surrealism', 'fractal'],
            'dark fantasy': ['dark fantasy', 'psychedelic'],
            'fractal vorter': ['fractal vortex', 'fractal spiral'],
            'fractal vortex': ['fractal vortex', 'fractal spiral'],
            'ornamen geometri': ['geometric ornament', 'zentangle'],
            'geometric ornament': ['geometric ornament', 'zentangle']
        };

        let processedPrompt = prompt.toLowerCase();
        let stylesToApply = [];
        let enhancedStyle = '';

        // Check for style combinations in prompt
        for (const [key, styles] of Object.entries(styleCombinations)) {
            if (processedPrompt.includes(key)) {
                stylesToApply = [...styles];
                enhancedStyle = `(${styles.join(' mixed with ')}) `;
                break;
            }
        }

        // If no specific combination found, check for individual styles
        if (stylesToApply.length === 0) {
            const allStyles = Object.values(styleCombinations).flat();
            for (const style of allStyles) {
                if (processedPrompt.includes(style)) {
                    stylesToApply.push(style);
                    break;
                }
            }
        }

        // Apply the style combination without showing in UI
        if (stylesToApply.length > 0) {
            // Remove existing style mentions to avoid duplication
            const styleRegex = new RegExp(stylesToApply.join('|'), 'gi');
            prompt = prompt.replace(styleRegex, '').trim();
            
            // Add the enhanced style combination
            if (enhancedStyle) {
                prompt = `${enhancedStyle} ${prompt}`;
            } else {
                prompt = `(${stylesToApply.join(' style')}) ${prompt}`;
            }
        }

        return prompt;
    }

    // Advanced settings toggle
    settingsToggle.addEventListener('click', () => {
        settingsToggle.classList.toggle('active');
        settingsContent.classList.toggle('expanded');
    });

    // Event Listeners
    generateBtn.addEventListener('click', generateImage);
    enhancePromptBtn.addEventListener('click', enhancePrompt);
    randomPromptBtn.addEventListener('click', generateRandomPrompt);
    randomSeedBtn.addEventListener('click', generateRandomSeed);
    downloadBtn.addEventListener('click', downloadImage);
    saveBtn.addEventListener('click', saveToHistory);
    clearHistoryBtn.addEventListener('click', clearHistory);
    themeToggle.addEventListener('click', toggleTheme);
    languageToggle.addEventListener('click', toggleLanguage);
    aspectRatioSelect.addEventListener('change', updateAspectRatio);

    // Aspect Ratio Handling
    function updateAspectRatio() {
        const value = aspectRatioSelect.value;
        if (value === 'custom') {
            // Show custom size inputs if implemented
            return;
        }
        
        const [width, height] = value.split('x');
        // Update width and height inputs if implemented
    }

    // Generate Image
    function generateImage() {
        let prompt = promptInput.value.trim();
        
        if (!prompt) {
            showAlert(currentLanguage === 'en' ? 'Please enter a prompt' : 'Silakan masukkan prompt');
            return;
        }

        // Process style combinations before generating
        prompt = processStyleCombination(prompt);

        loadingElement.style.display = 'flex';
        generatedImage.style.display = 'none';
        imageActions.classList.add('hidden');

        const model = modelSelect.value;
        const style = styleSelect.value;
        const enhance = enhanceCheckbox.checked;
        const hd = hdCheckbox.checked;
        const nologo = nologoCheckbox.checked;
        const seed = seedInput.value || Math.floor(Math.random() * 1000000);
        const negativePrompt = negativePromptInput.value.trim();
        const colorPalette = colorPaletteSelect.value;
        const composition = compositionSelect.value;
        const aspectRatio = aspectRatioSelect.value;

        // Build URL with parameters
        let url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?format=png&quality=100`;
        
        if (aspectRatio) {
            const [width, height] = aspectRatio.split('x');
            url += `&width=${width}&height=${height}`;
        }
        
        if (model !== 'default') url += `&model=${model}`;
        if (style !== 'default') url += `&style=${style}`;
        if (colorPalette !== 'default') url += `&color_palette=${colorPalette}`;
        if (composition !== 'default') url += `&composition=${composition}`;
        if (hd) url += '&quality=100';
        if (enhance) url += '&enhance=true';
        if (nologo) url += '&nologo=true';
        if (seed) url += `&seed=${seed}`;
        if (negativePrompt) url += `&negative_prompt=${encodeURIComponent(negativePrompt)}`;
        
        url += `&timestamp=${Date.now()}`;
        
        generatedImage.onload = function() {
            loadingElement.style.display = 'none';
            generatedImage.style.display = 'block';
            imageActions.classList.remove('hidden');
            addToHistory(promptInput.value.trim(), url); // Use original prompt for history
        };
        
        generatedImage.onerror = function() {
            loadingElement.style.display = 'none';
            showAlert(currentLanguage === 'en' ? 'Error generating image. Please try again.' : 'Gagal membuat gambar. Silakan coba lagi.');
        };
        
        generatedImage.src = url;
    }

    // Prompt Enhancement
    function enhancePrompt() {
        const prompt = promptInput.value.trim();
        if (!prompt) {
            showAlert(currentLanguage === 'en' ? 'Please enter a prompt first' : 'Silakan masukkan prompt terlebih dahulu');
            return;
        }

        const enhancedPrompt = `highly detailed, 4k, 8k, ultra HD, professional photography, ${prompt}`;
        promptInput.value = enhancedPrompt;
        
        showAlert(currentLanguage === 'en' ? 'Prompt enhanced!' : 'Prompt ditingkatkan!', 'success');
    }

    // Random Prompt Generation
    function generateRandomPrompt() {
        const randomPrompts = [
            "A cyberpunk cityscape at night with neon lights and flying cars",
            "A majestic dragon perched on a mountain peak at sunset",
            "An astronaut exploring an alien jungle with bioluminescent plants",
            "A steampunk airship flying over a Victorian-era city",
            "A surreal landscape with floating islands and waterfalls in the sky",
            "A futuristic robot meditating in a zen garden",
            "A magical library with infinite bookshelves and floating lanterns",
            "A pirate ship sailing through the clouds",
            "An ancient temple hidden in a lush rainforest",
            "A dystopian megacity with towering skyscrapers and crowded streets"
        ];
        
        const randomIndex = Math.floor(Math.random() * randomPrompts.length);
        promptInput.value = randomPrompts[randomIndex];
    }

    // Random Seed Generation
    function generateRandomSeed() {
        const randomSeed = Math.floor(Math.random() * 1000000);
        seedInput.value = randomSeed;
    }

    // Image Download
    function downloadImage() {
        if (!generatedImage.src || generatedImage.src === '') {
            showAlert(currentLanguage === 'en' ? 'No image to download' : 'Tidak ada gambar untuk diunduh');
            return;
        }

        const link = document.createElement('a');
        link.href = generatedImage.src;
        link.download = `dery-ai-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert(currentLanguage === 'en' ? 'Image downloaded!' : 'Gambar diunduh!', 'success');
    }

    // History Management
    function addToHistory(prompt, url) {
        const existingIndex = history.findIndex(item => item.prompt === prompt);
        if (existingIndex >= 0) {
            history.splice(existingIndex, 1);
        }
        
        history.unshift({ prompt, url, timestamp: Date.now() });
        
        if (history.length > 20) {
            history.pop();
        }
        
        localStorage.setItem('aiImageHistory', JSON.stringify(history));
        updateHistoryList();
    }

    function updateHistoryList() {
        historyList.innerHTML = '';
        
        history.forEach((item, index) => {
            const li = document.createElement('li');
            li.textContent = item.prompt.length > 50 
                ? `${item.prompt.substring(0, 50)}...` 
                : item.prompt;
            
            li.addEventListener('click', () => {
                promptInput.value = item.prompt;
                generatedImage.src = item.url;
                generatedImage.style.display = 'block';
                imageActions.classList.remove('hidden');
            });
            
            historyList.appendChild(li);
        });
    }

    function clearHistory() {
        history = [];
        localStorage.removeItem('aiImageHistory');
        updateHistoryList();
        showAlert(currentLanguage === 'en' ? 'History cleared' : 'Riwayat dihapus', 'success');
    }

    function saveToHistory() {
        if (!generatedImage.src || generatedImage.src === '') {
            showAlert(currentLanguage === 'en' ? 'No image to save' : 'Tidak ada gambar untuk disimpan');
            return;
        }

        const prompt = promptInput.value.trim();
        if (!prompt) {
            showAlert(currentLanguage === 'en' ? 'Please enter a prompt' : 'Silakan masukkan prompt');
            return;
        }

        addToHistory(prompt, generatedImage.src);
        showAlert(currentLanguage === 'en' ? 'Saved to history!' : 'Disimpan ke riwayat!', 'success');
    }

    // Theme Toggle
    function toggleTheme() {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('aiImageTheme', currentTheme);
        updateTheme();
    }

    function updateTheme() {
        document.body.setAttribute('data-theme', currentTheme);
        themeToggle.innerHTML = currentTheme === 'dark' 
            ? '<i class="fas fa-moon"></i>' 
            : '<i class="fas fa-sun"></i>';
    }

    // Language Toggle
    function toggleLanguage() {
        currentLanguage = currentLanguage === 'en' ? 'id' : 'en';
        localStorage.setItem('aiImageLanguage', currentLanguage);
        updateLanguage();
    }

    function updateLanguage() {
        document.querySelectorAll('[data-en]').forEach(el => {
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                const placeholderAttr = el.hasAttribute('data-en-placeholder') ? 'placeholder' : 'value';
                el[placeholderAttr] = currentLanguage === 'en' 
                    ? el.getAttribute(`data-en-${placeholderAttr}`) || el.getAttribute('data-en')
                    : el.getAttribute(`data-id-${placeholderAttr}`) || el.getAttribute('data-id');
            } else {
                el.textContent = currentLanguage === 'en' 
                    ? el.getAttribute('data-en') 
                    : el.getAttribute('data-id');
            }
        });
    }

    // Alert System
    function showAlert(message, type = 'error') {
        const alertBox = document.createElement('div');
        alertBox.className = `alert ${type}`;
        alertBox.textContent = message;
        
        document.body.appendChild(alertBox);
        
        setTimeout(() => {
            alertBox.classList.add('fade-out');
            setTimeout(() => alertBox.remove(), 300);
        }, 3000);
    }

    // Add styles for alerts if not already added
    if (!document.querySelector('style[data-alert-styles]')) {
        const style = document.createElement('style');
        style.setAttribute('data-alert-styles', 'true');
        style.textContent = `
            .alert {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 12px 16px;
                border-radius: 8px;
                color: white;
                font-weight: bold;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 1000;
                transform: translateX(0);
                opacity: 1;
                transition: all 0.3s ease;
                font-family: 'Rajdhani', sans-serif;
            }
            .alert.error {
                background-color: #e84118;
            }
            .alert.success {
                background-color: #4cd137;
            }
            .alert.info {
                background-color: #00a8ff;
            }
            .alert.fade-out {
                transform: translateX(100%);
                opacity: 0;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize theme and language
    updateTheme();
    updateLanguage();
});

// Load Font Awesome if not already loaded
if (!document.querySelector('link[href*="font-awesome"]')) {
    const fontAwesome = document.createElement('link');
    fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css';
    fontAwesome.rel = 'stylesheet';
    document.head.appendChild(fontAwesome);
}