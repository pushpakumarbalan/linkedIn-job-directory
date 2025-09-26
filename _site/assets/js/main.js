/**
 * LinkedIn Job Directory - Enhanced JavaScript Functionality
 * Features: Advanced search, filtering, analytics, and user experience enhancements
 */

class JobDirectoryApp {
    constructor() {
        this.searchInput = document.getElementById('searchInput');
        this.companies = [];
        this.universities = [];
        this.currentFilter = 'all';
        this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
        
        this.init();
    }
    
    init() {
        this.loadData();
        this.setupEventListeners();
        this.setupAnalytics();
        this.addUserPreferences();
        this.initializeStats();
    }
    
    loadData() {
        // Load companies and universities from DOM
        const companyLinks = document.querySelectorAll('.company-list a');
        const universityLinks = document.querySelectorAll('.university-section a');
        
        this.companies = Array.from(companyLinks).map(link => ({
            name: link.textContent.trim(),
            url: link.href,
            element: link,
            section: link.closest('.company-section')
        }));
        
        this.universities = Array.from(universityLinks).map(link => ({
            name: link.textContent.trim(),
            url: link.href,
            element: link,
            section: link.closest('.university-section')
        }));
    }
    
    setupEventListeners() {
        // Enhanced search functionality
        if (this.searchInput) {
            this.searchInput.addEventListener('input', this.debounce(this.handleSearch.bind(this), 300));
            this.searchInput.addEventListener('keydown', this.handleSearchKeydown.bind(this));
        }
        
        // Filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', this.handleFilter.bind(this));
        });
        
        // Link click tracking
        document.querySelectorAll('a[href*="linkedin.com"]').forEach(link => {
            link.addEventListener('click', this.trackLinkClick.bind(this));
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', this.handleKeyboardShortcuts.bind(this));
        
        // Scroll to top functionality
        this.addScrollToTop();
    }
    
    handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase().trim();
        
        if (searchTerm) {
            this.addToSearchHistory(searchTerm);
        }
        
        this.filterContent(searchTerm);
        this.updateSearchStats(searchTerm);
    }
    
    handleSearchKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            const searchTerm = event.target.value.toLowerCase().trim();
            if (searchTerm) {
                this.performAdvancedSearch(searchTerm);
            }
        }
    }
    
    filterContent(searchTerm) {
        const allSections = document.querySelectorAll('.company-section, .university-section');
        const allItems = [...this.companies, ...this.universities];
        let visibleCount = 0;
        
        if (!searchTerm) {
            // Show all content
            allSections.forEach(section => {
                section.style.display = 'block';
                section.classList.add('fade-in');
            });
            allItems.forEach(item => {
                item.element.parentElement.style.display = 'block';
            });
            this.updateResultsCount(allItems.length);
            return;
        }
        
        // Hide all sections first
        allSections.forEach(section => section.style.display = 'none');
        
        // Filter and show matching items
        allItems.forEach(item => {
            const matches = this.fuzzySearch(item.name.toLowerCase(), searchTerm);
            
            if (matches) {
                item.element.parentElement.style.display = 'block';
                item.section.style.display = 'block';
                item.section.classList.add('fade-in');
                this.highlightMatch(item.element, searchTerm);
                visibleCount++;
            } else {
                item.element.parentElement.style.display = 'none';
                this.removeHighlight(item.element);
            }
        });
        
        this.updateResultsCount(visibleCount);
        
        if (visibleCount === 0) {
            this.showNoResults(searchTerm);
        } else {
            this.hideNoResults();
        }
    }
    
    fuzzySearch(text, term) {
        // Implement fuzzy search for better matching
        if (text.includes(term)) return true;
        
        // Check for partial matches and typos
        const words = term.split(' ');
        return words.every(word => {
            if (text.includes(word)) return true;
            
            // Check for similar words (simple edit distance)
            const textWords = text.split(' ');
            return textWords.some(textWord => {
                return this.editDistance(textWord, word) <= Math.max(1, Math.floor(word.length * 0.2));
            });
        });
    }
    
    editDistance(a, b) {
        const matrix = [];
        
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[b.length][a.length];
    }
    
    highlightMatch(element, term) {
        const originalText = element.getAttribute('data-original-text') || element.textContent;
        if (!element.getAttribute('data-original-text')) {
            element.setAttribute('data-original-text', originalText);
        }
        
        const regex = new RegExp(`(${term})`, 'gi');
        const highlightedText = originalText.replace(regex, '<mark>$1</mark>');
        element.innerHTML = highlightedText;
    }
    
    removeHighlight(element) {
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
        }
    }
    
    addToSearchHistory(term) {
        if (!this.searchHistory.includes(term)) {
            this.searchHistory.unshift(term);
            this.searchHistory = this.searchHistory.slice(0, 10); // Keep only last 10 searches
            localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
        }
    }
    
    trackLinkClick(event) {
        const link = event.currentTarget;
        const companyName = link.textContent.trim();
        
        // Store click data (can be sent to analytics service)
        const clickData = {
            company: companyName,
            url: link.href,
            timestamp: new Date().toISOString(),
            searchQuery: this.searchInput ? this.searchInput.value : ''
        };
        
        // Store in localStorage for now (can be replaced with analytics service)
        const clicks = JSON.parse(localStorage.getItem('linkClicks') || '[]');
        clicks.push(clickData);
        localStorage.setItem('linkClicks', JSON.stringify(clicks.slice(-100))); // Keep last 100 clicks
        
        // Visual feedback
        link.style.transform = 'scale(0.95)';
        setTimeout(() => {
            link.style.transform = '';
        }, 150);
    }
    
    handleKeyboardShortcuts(event) {
        // Ctrl/Cmd + K to focus search
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            if (this.searchInput) {
                this.searchInput.focus();
                this.searchInput.select();
            }
        }
        
        // Escape to clear search
        if (event.key === 'Escape' && this.searchInput) {
            this.searchInput.value = '';
            this.filterContent('');
        }
    }
    
    addScrollToTop() {
        const scrollBtn = document.createElement('button');
        scrollBtn.innerHTML = '↑';
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--primary-color);
            color: white;
            border: none;
            font-size: 20px;
            cursor: pointer;
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 1000;
            box-shadow: var(--shadow);
        `;
        
        document.body.appendChild(scrollBtn);
        
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.transform = 'translateY(0)';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.transform = 'translateY(10px)';
            }
        });
    }
    
    updateResultsCount(count) {
        let resultsElement = document.getElementById('search-results-count');
        if (!resultsElement) {
            resultsElement = document.createElement('div');
            resultsElement.id = 'search-results-count';
            resultsElement.style.cssText = `
                text-align: center;
                padding: 10px;
                margin: 20px 0;
                background: var(--accent-color);
                border-radius: 8px;
                font-weight: 500;
                color: var(--text-secondary);
            `;
            
            const mainContent = document.querySelector('main .container');
            if (mainContent) {
                mainContent.insertBefore(resultsElement, mainContent.firstChild);
            }
        }
        
        const total = this.companies.length + this.universities.length;
        resultsElement.textContent = `Showing ${count} of ${total} results`;
        resultsElement.style.display = count < total ? 'block' : 'none';
    }
    
    showNoResults(term) {
        let noResultsElement = document.getElementById('no-results');
        if (!noResultsElement) {
            noResultsElement = document.createElement('div');
            noResultsElement.id = 'no-results';
            noResultsElement.style.cssText = `
                text-align: center;
                padding: 40px 20px;
                background: var(--background-light);
                border-radius: 12px;
                margin: 20px 0;
                box-shadow: var(--shadow);
            `;
            
            const mainContent = document.querySelector('main .container .content-section');
            if (mainContent) {
                mainContent.appendChild(noResultsElement);
            }
        }
        
        noResultsElement.innerHTML = `
            <h3 style="color: var(--text-secondary); margin-bottom: 15px;">No results found for "${term}"</h3>
            <p style="color: var(--text-secondary); margin-bottom: 20px;">Try searching with different keywords or check the spelling.</p>
            <button onclick="document.getElementById('searchInput').value = ''; app.filterContent('');" 
                    style="background: var(--primary-color); color: white; border: none; padding: 10px 20px; border-radius: 20px; cursor: pointer;">
                Clear Search
            </button>
        `;
        noResultsElement.style.display = 'block';
    }
    
    hideNoResults() {
        const noResultsElement = document.getElementById('no-results');
        if (noResultsElement) {
            noResultsElement.style.display = 'none';
        }
    }
    
    initializeStats() {
        // Add statistics to the page
        const statsHtml = `
            <div class="stats-container">
                <div class="stat-card">
                    <span class="stat-number">${this.companies.length}</span>
                    <span class="stat-label">Companies</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${this.universities.length}</span>
                    <span class="stat-label">Universities</span>
                </div>
                <div class="stat-card">
                    <span class="stat-number">${this.companies.length + this.universities.length}</span>
                    <span class="stat-label">Total Opportunities</span>
                </div>
            </div>
        `;
        
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.insertAdjacentHTML('beforeend', statsHtml);
        }
    }
    
    setupAnalytics() {
        // Track page views and user interactions
        const analytics = {
            pageView: () => {
                console.log('Page viewed at:', new Date().toISOString());
            },
            searchPerformed: (term) => {
                console.log('Search performed:', term, 'at:', new Date().toISOString());
            },
            linkClicked: (company, url) => {
                console.log('Link clicked:', company, url, 'at:', new Date().toISOString());
            }
        };
        
        analytics.pageView();
        this.analytics = analytics;
    }
    
    addUserPreferences() {
        // Add theme toggle and other preferences
        const preferencesBtn = document.createElement('button');
        preferencesBtn.innerHTML = '⚙️';
        preferencesBtn.className = 'preferences-btn';
        preferencesBtn.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: var(--background-light);
            border: 2px solid var(--primary-color);
            cursor: pointer;
            font-size: 16px;
            z-index: 1001;
            box-shadow: var(--shadow);
            transition: all 0.3s ease;
        `;
        
        document.body.appendChild(preferencesBtn);
        
        preferencesBtn.addEventListener('click', this.showPreferences.bind(this));
    }
    
    showPreferences() {
        // Create preferences modal
        const modal = document.createElement('div');
        modal.className = 'preferences-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
        `;
        
        modal.innerHTML = `
            <div style="background: var(--background-light); padding: 30px; border-radius: 12px; max-width: 400px; width: 90%;">
                <h3 style="margin-bottom: 20px; color: var(--primary-color);">Preferences</h3>
                <div style="margin-bottom: 15px;">
                    <label style="display: block; margin-bottom: 5px;">Theme:</label>
                    <select id="theme-select" style="width: 100%; padding: 8px; border: 1px solid var(--border-color); border-radius: 4px;">
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                    </select>
                </div>
                <div style="margin-bottom: 20px;">
                    <label style="display: flex; align-items: center; gap: 8px;">
                        <input type="checkbox" id="animations-toggle" checked>
                        Enable animations
                    </label>
                </div>
                <div style="display: flex; gap: 10px; justify-content: flex-end;">
                    <button onclick="this.closest('.preferences-modal').remove()" 
                            style="padding: 8px 16px; background: var(--border-color); border: none; border-radius: 4px; cursor: pointer;">
                        Cancel
                    </button>
                    <button onclick="app.savePreferences(); this.closest('.preferences-modal').remove();" 
                            style="padding: 8px 16px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">
                        Save
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Load current preferences
        const preferences = JSON.parse(localStorage.getItem('userPreferences') || '{}');
        if (preferences.theme) {
            document.getElementById('theme-select').value = preferences.theme;
        }
        if (preferences.animations === false) {
            document.getElementById('animations-toggle').checked = false;
        }
    }
    
    savePreferences() {
        const theme = document.getElementById('theme-select').value;
        const animations = document.getElementById('animations-toggle').checked;
        
        const preferences = { theme, animations };
        localStorage.setItem('userPreferences', JSON.stringify(preferences));
        
        // Apply preferences
        this.applyTheme(theme);
        this.toggleAnimations(animations);
    }
    
    applyTheme(theme) {
        document.body.setAttribute('data-theme', theme);
        // Theme CSS would be handled in the CSS file
    }
    
    toggleAnimations(enabled) {
        if (!enabled) {
            document.body.style.setProperty('--animation-duration', '0s');
        } else {
            document.body.style.removeProperty('--animation-duration');
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    updateSearchStats(term) {
        if (this.analytics && term) {
            this.analytics.searchPerformed(term);
        }
    }
    
    performAdvancedSearch(term) {
        // Implement advanced search features like filtering by industry, location, etc.
        console.log('Advanced search for:', term);
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new JobDirectoryApp();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = JobDirectoryApp;
}